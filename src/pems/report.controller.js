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

  //   @swagger
  //   apipemsmeterValuesstatisticalMeterValue
  //     get
  //       security
  //         - Authorization []
  //       description Calculate the energy consumption of each shift(展示meterValue数据并计算每个班次耗能情况)
  //       tags [pems]
  //       produces
  //         - applicationjson
  //       parameters
  //         - name id
  //           description meter's id.
  //           in query
  //           type int
  //         - name cType
  //           description meter's cType
  //           in query
  //           type string
  //         - name cPositionFk
  //           description meter's cPositionFk
  //           in query
  //           type int
  //         - name cRecordType
  //           description meterValues's cRecordType
  //           in query
  //           type string
  //       responses
  //         200
  //           description meterValues
  //           schema
  //             type object

  // router.get('statisticalMeterValue', async (req, res) = {
  //   let { page, row, cRecordDate, id, cType, cPositionFk } = req.query;

  //   let now = new Date(moment().format('YYYY-MM-DD'));
  //   let reportingDayData;
  //   if (cRecordDate != null && cRecordDate != '') {
  //     let cRecordDate = new Date(moment(cRecordDate).format('YYYY-MM-DD'));
  //     if (cRecordDate.getTime() != now.getTime()) {
  //       获取meterId
  //       let meterId = await service.getMeterId(id, cType, cPositionFk);
  //       根据meterId获取meterValue的数据
  //       reportingDayData = service.getMeterReportingDayData(page, row, cRecordDate, null, meterId);
  //     } else {
  //       reportingDayData = await service.getNowMeterValue(id, cType, cPositionFk);
  //     }
  //   } else {
  //     reportingDayData = await service.getNowMeterValue(id, cType, cPositionFk);
  //   }
  //   res.json(reportingDayData);
  // });

  // router.get('saveweek', async (req, res) = {
  //   let date;
  //   let report = await prisma.Pems_MeterReporting_Week.findMany();

  //   const StartWeekOfday = moment().format('E');

  //   周一
  //   const endDate = moment()
  //     .subtract(StartWeekOfday - 1, 'days')
  //     .format('YYYYMMDD');
  //   上周周日
  //   let preDate = new Date(
  //     moment(endDate)
  //       .subtract(1, 'days')
  //       .format('YYYY-MM-DD'),
  //   );
  //   let startDate;
  //   if (report == null  report == '') {
  //     let recordDateList = await prisma.Pems_MeterValues().groupBy({
  //       by ['cRecordDate'],
  //       orderBy {
  //         cRecordDate 'asc',
  //       },
  //     });
  //     if (recordDateList != null && recordDateList.length  0) {
  //       startDate = recordDateList[0].cRecordDate;
  //     } else {
  //       startDate = preDate;
  //     }
  //   } else {
  //     startDate = preDate;
  //   }
  //   let weekList = service.getMonAndSunDay(startDate, endDate);
  //   if (weekList != null && weekList != '') {
  //     weekList.forEach(element = {
  //       element.startTime;
  //       element.endSun;
  //     });
  //   }
  //   await service.saveReportingDay(startDate, endDate);
  //   res.json(date);
  // });
  return router;
})();

controller.prefix = '/pems/reproting';

export default controller;
