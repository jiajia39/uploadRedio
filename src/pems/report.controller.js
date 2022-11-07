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

  router.get('/save/week/history', async (req, res) => {
    let report = await prisma.Pems_MeterReporting_Week.findMany();
    let list = [];
    let now = new Date(moment().format('YYYY-MM-DD'));
    if (report == null || report == '') {
      let meterValue = await prisma.Pems_MeterValues.findMany({
        orderBy: {
          cRecordDate: 'asc',
        },
      });
      if (meterValue != null && meterValue.length > 0) {
        let preDate = meterValue[0].cRecordDate;
        let weekOfDay = new Date().getDay();
        //上周周日
        let endDate = moment()
          .subtract(weekOfDay, 'days')
          .format('YYYY-MM-DD');
        console.log(endDate);
        let timeList = await service.getMonAndSunDayList(preDate, endDate);
        for (let i = 0; i < timeList.length; i++) {
          const startWeek = timeList[i].startTime;
          const endWeek = timeList[i].endSun;
          let data = await service.statisticalMeterWeek(startWeek, endWeek, null, null, null, null);
          if (data != null && data.length > 0) {
            let weekList = [];
            if (data != null && data.length > 0) {
              for (let i = 0; i < data.length; i++) {
                weekList.push({
                  cWeekStart: new Date(data[i].startTime),
                  cWeekEnd: new Date(data[i].endTime),
                  cValue: parseFloat(data[i].energyConsumption),
                  cMeterFk: data[i].cMeterFk,
                });
              }
              await prisma.Pems_MeterReporting_Week.createMany({ data: weekList });
            }
          }
        }
      }
    } else {
      let weekOfDay = new Date().getDay();
      //上周周一
      let startWeek = moment()
        .subtract(weekOfDay + 6, 'days')
        .format('YYYY-MM-DD');
      //上周周日
      let endWeek = moment()
        .subtract(weekOfDay, 'days')
        .format('YYYY-MM-DD');
      await prisma.Pems_MeterReporting_Week.deleteMany({
        where: { cWeekStart: new Date(startWeek) },
      });
      let data = await service.statisticalMeterWeek(startWeek, endWeek, null, null, null, null);
      console.log(startWeek + '--' + endWeek);
      if (data != null && data.length > 0) {
        let weekList = [];
        for (let i = 0; i < data.length; i++) {
          weekList.push({
            cWeekStart: new Date(data[i].startTime),
            cWeekEnd: new Date(data[i].endTime),
            cValue: parseFloat(data[i].energyConsumption),
            cMeterFk: data[i].cMeterFk,
          });
        }
        await prisma.Pems_MeterReporting_Week.createMany({ data: weekList });
      }
    }
    res.json({ isok: true, message: 'ReportingWeek saved' });
    // await prisma.Pems_MeterReporting_Day.createMany({ data: dayList });
    // res.json(list);
  });

  router.get('/save/Current/week', async (req, res) => {
    //
    const weekOfday = moment().format('E');
    const startMon = moment()
      .subtract(weekOfday - 1, 'days')
      .format('YYYY-MM-DD');
    const endSun = moment()
      .add(7 - weekOfday, 'days')
      .format('YYYY-MM-DD');
    const now = new Date(moment().format('YYYY-MM-DD'));
    let list = [];
    await prisma.Pems_MeterReporting_Week.deleteMany({
      where: { cWeekStart: new Date(startMon) },
    });
    let data = await service.statisticalMeterWeek(startMon, now, null, null, null, null);
    console.log(startMon + '--' + endSun);
    if (data != null && data.length > 0) {
      let weekList = [];
      for (let i = 0; i < data.length; i++) {
        weekList.push({
          cWeekStart: new Date(data[i].startTime),
          cWeekEnd: new Date(data[i].endTime),
          cValue: parseFloat(data[i].energyConsumption),
          cMeterFk: data[i].cMeterFk,
        });
      }
      await prisma.Pems_MeterReporting_Week.createMany({
        data: weekList,
      });
    }
    res.json({ isok: true, message: 'ReportingWeek saved' });
  });

  router.get('/save/month/history', async (req, res) => {
    let start = new Date(moment().format('YYYY-MM-01'));
    //上月月末
    let endDate = new Date(
      moment(start)
        .subtract(1, 'days')
        .format('YYYY-MM-DD'),
    );

    let report = await prisma.Pems_MeterReporting_Month.findMany();
    console.log('111111111111111');
    console.log(report);
    let list = [];
    let now = new Date(moment().format('YYYY-MM-DD'));
    if (report == null || report == '') {
      let meterValue = await prisma.Pems_MeterValues.findMany({
        orderBy: {
          cRecordDate: 'asc',
        },
      });
      if (meterValue != null && meterValue.length > 0) {
        let preDate = meterValue[0].cRecordDate;
        preDate = new Date(moment(preDate).format('YYYY-MM-01'));
        let timeList = await service.getStaAndEndMon(preDate, endDate);
        for (let i = 0; i < timeList.length; i++) {
          const startMonth = timeList[i].startTime;
          const endMonth = timeList[i].endSun;
          let data = await service.statisticalMeterMon(
            startMonth,
            endMonth,
            null,
            null,
            null,
            null,
          );
          if (data != null && data != '' && data.length > 0) {
            let monthList = [];
            if (data != null && data.length > 0) {
              for (let i = 0; i < data.length; i++) {
                monthList.push({
                  cMonthStart: new Date(data[i].startTime),
                  cMonthEnd: new Date(data[i].endTime),
                  cValue: parseFloat(data[i].energyConsumption),
                  cMeterFk: data[i].cMeterFk,
                });
              }
              await prisma.Pems_MeterReporting_Month.createMany({ data: monthList });
            }
          }
        }
      }
    } else {
      //上月月初
      let startMonth = new Date(moment(endDate).format('YYYY-MM-01'));
      await prisma.Pems_MeterReporting_Month.deleteMany({
        where: { cMonthStart: new Date(startMonth) },
      });
      let data = await service.statisticalMeterMon(startMonth, endDate, null, null, null, null);
      if (data != null && data.length > 0) {
        let monthList = [];
        for (let i = 0; i < data.length; i++) {
          monthList.push({
            cMonthStart: new Date(data[i].startTime),
            cMonthEnd: new Date(data[i].endTime),
            cValue: parseFloat(data[i].energyConsumption),
            cMeterFk: data[i].cMeterFk,
          });
        }
        await prisma.Pems_MeterReporting_Month.createMany({ data: monthList });
      }
    }
    res.json({ isok: true, message: 'ReportingWeek saved' });
    // await prisma.Pems_MeterReporting_Day.createMany({ data: dayList });
    // res.json(list);
  });

  router.get('/save/current/month', async (req, res) => {
    const start = new Date(moment().format('YYYY-MM-01'));
    const end = new Date(moment().format('YYYY-MM-DD'));
    await prisma.Pems_MeterReporting_Month.deleteMany({
      where: { cMonthStart: new Date(start) },
    });
    const data = await service.statisticalMeterMon(start, end, null, null, null, null);
    if (data != null && data.length > 0) {
      let monthList = [];
      for (let i = 0; i < data.length; i++) {
        monthList.push({
          cMonthStart: new Date(data[i].startTime),
          cMonthEnd: new Date(data[i].endTime),
          cValue: parseFloat(data[i].energyConsumption),
          cMeterFk: data[i].cMeterFk,
        });
      }
      await prisma.Pems_MeterReporting_Month.createMany({ data: monthList });
    }
    res.json({ isok: true, message: 'ReportingWeek saved' });
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
    }
  });
  return router;
})();

controller.prefix = '/pems/reproting';

export default controller;
