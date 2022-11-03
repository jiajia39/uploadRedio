import { Router } from 'express';
import prisma from '../core/prisma';
import service from './service';
import influxservice from '../influx/service';
import { start } from 'pm2';
var moment = require('moment');

const controller = (() => {
  const router = Router();
  router.get('/save/Day', async (req, res) => {
    let date;
    let report = await prisma.Pems_MeterReporting_Day.findMany();
    let preDate = new Date(
      moment()
        .subtract(1, 'days')
        .format('YYYY-MM-DD'),
    );
    let endDate = new Date(
      moment()
        // .subtract(1, 'days')
        .format('YYYY-MM-DD'),
    );
    let startDate = new Date(moment().format('YYYY-MM-DD'));
    if (report == null || report == '') {
      let recordDateList = await prisma.Pems_MeterValues.groupBy({
        by: ['cRecordDate'],
        orderBy: {
          cRecordDate: 'asc',
        },
      });
      if (recordDateList != null && recordDateList.length > 0) {
        startDate = recordDateList[0].cRecordDate;
      } else {
        startDate = preDate;
      }
    } else {
      startDate = preDate;
    }
    await service.saveReportingDay(startDate, endDate, '24h');

    res.json({ isok: true, message: 'EnergyFees saved' });
  });

  router.get('/save/week', async (req, res) => {
    let date;
    let report = await prisma.Pems_MeterReporting_Week.findMany();

    const StartWeekOfday = moment().format('E');
    //周一
    const endDate = moment()
      .subtract(StartWeekOfday - 1, 'days')
      .format('YYYYMMDD');
    //上周周日
    let preDate = new Date(
      moment(endDate)
        .subtract(1, 'days')
        .format('YYYY-MM-DD'),
    );
    let startDate;
    if (report == null || report == '') {
      let recordDateList = await prisma.Pems_MeterValues().groupBy({
        by: ['cRecordDate'],
        orderBy: {
          cRecordDate: 'asc',
        },
      });
      if (recordDateList != null && recordDateList.length > 0) {
        startDate = recordDateList[0].cRecordDate;
      } else {
        startDate = preDate;
      }
    } else {
      startDate = preDate;
    }
    let weekList = service.getMonAndSunDay(startDate, endDate);
    if (weekList != null && weekList != '') {
      weekList.forEach(element => {
        element.startTime;
        element.endSun;
      });
    }
    await service.saveReportingDay(startDate, endDate);
    res.json(date);
  });
  return router;
})();
controller.prefix = '/pems/reproting';

export default controller;
