import { Router } from 'express';
import prisma from '../core/prisma';
import service from '../pems/service';
var moment = require('moment');

const controller = (() => {
  const router = Router();
  router.get('/save/day', async (req, res) => {
    let report = await prisma.Pems_MeterReporting_Day.findMany();
    let list;
    let now = new Date(moment().format('YYYY-MM-DD'));
    if (report == null || report == '') {
      list = await service.statisticalMeterData(null, null, null, null, null);
    } else {
      let preDate = new Date(
        moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD'),
      );
      list = await service.statisticalMeterData(null, null, null, preDate, null);
    }
    let dayList = [];
    if (list != null && list.length > 0) {
      for (let i = 0; i < list.length; i++) {
        let recordDate = new Date(list[i].cRecordDate).getTime();
        if (recordDate >= now.getTime()) {
          continue;
        }
        dayList.push({
          cValue: parseFloat(list[i].energyConsumption),
          cMeterFk: list[i].cMerterFk,
          cDate: list[i].cRecordDate,
        });
      }
    }
    await prisma.Pems_MeterReporting_Day.createMany({ data: dayList });
    res.json(list);
  });

  /**
   * @swagger
   * /api/pems/meterValues/statisticalMeterValue:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Calculate the energy consumption of each shift(展示meterValue数据并计算每个班次耗能情况)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: meter's id.
   *         in: query
   *         type: int
   *       - name: cType
   *         description: meter's cType
   *         in: query
   *         type: string
   *       - name: cPositionFk
   *         description: meter's cPositionFk
   *         in: query
   *         type: int
   *       - name: cRecordType
   *         description: meterValues's cRecordType
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: meterValues
   *         schema:
   *           type: object
   */
  router.get('/statisticalMeterValue', async (req, res) => {
    let { page, row, cRecordDate, id, cType, cPositionFk, cRecordType } = req.query;
    if (page == null) {
      page = 1;
    }
    if (row == null) {
      row = 5;
    }
    let now = new Date(moment().format('YYYY-MM-DD'));
    cRecordDate = new Date(moment(cRecordDate).format('YYYY-MM-DD'));

    if (cRecordDate == null || cRecordDate == '' || now.getTime() == cRecordDate.getTime()) {
      cRecordDate = new Date();
      const date = await service.statisticalMeterData(
        id,
        cType,
        Number(cPositionFk),
        cRecordDate,
        cRecordType,
      );
      if (date != null && date.length != 0) {
        let pageList = service.getPageDate(date, row, page);
        const { totalEnergyConsumption } = date[date.length - 1];
        res.json({
          totalEnergyConsumption,
          data: pageList,
          total: date.length,
          message: 'Data obtained.',
        });
      } else {
        res.json({
          data: [],
          total: 0,
          message: 'Data Empty.',
        });
      }
    } else {
      let meterIdList = await service.getMeterId(id, cType, cPositionFk);
      let meterReport = await service.getMeterReportingDayData(page, row, cRecordDate, meterIdList);
      if (meterReport.rstdata != null && meterReport.rstdata.length > 0) {
        let statisticalMeter = [];
        meterReport.rstdata.forEach(element => {
          let energyConsumption = element.cValue;
          console.log(element.cValue);
          statisticalMeter.push(Object.assign({}, element, { energyConsumption }));
        });
        res.json({
          totalEnergyConsumption: parseFloat(meterReport.data._sum.cValue).toFixed(2),
          data: statisticalMeter,
          total: meterReport.count,
          message: 'Data obtained.',
        });
      }
      console.log(meterReport);
    }
  });
  return router;
})();

controller.prefix = '/pems/reproting';

export default controller;
