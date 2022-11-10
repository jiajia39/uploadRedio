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
      await prisma.Pems_MeterReporting_Day.deleteMany({ where: { cDate: new Date(preDate) } });
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
          cMeterFk: list[i].cMeterFk,
          cDate: list[i].cRecordDate,
          cRecordType: list[i].cRecordType,
        });
      }
    }
    console.log(dayList);
    await prisma.Pems_MeterReporting_Day.createMany({ data: dayList });
    res.json({ isok: true, message: 'ReportingWeek saved' });
  });

  router.get('/save/week/history', async (req, res) => {
    await service.saveReoprtWeekHistory();
    res.json({ isok: true, message: 'ReportingWeek saved' });
  });

  router.get('/save/Current/week', async (req, res) => {
    await service.saveReoprtCurrentWeek();
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
    await service.saveReoprtCurrentMon();
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
    //isAll 是否展示所有数据 1展示
    let { page, row, cRecordDate, id, cType, cPositionFk, cRecordType, isAll } = req.query;
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
        let pageList;
        if (isAll == 1) {
          pageList = date;
        } else {
          pageList = service.getPageDate(date, row, page);
        }
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
      let meterReport = await service.getMeterReportingDayData(
        page,
        row,
        cRecordDate,
        meterIdList,
        cType,
        isAll,
      );
      let total;
      if (meterReport.data != null) {
        total = parseFloat(meterReport.data._sum.cValue).toFixed(2);
      }
      if (meterReport.rstdata != null && meterReport.rstdata.length > 0) {
        let statisticalMeter = [];
        meterReport.rstdata.forEach(element => {
          let energyConsumption = element.cValue;
          const cRecordDate = element.cDate;
          console.log(element.cValue);
          statisticalMeter.push(Object.assign({}, element, { cRecordDate }, { energyConsumption }));
        });
        res.json({
          totalEnergyConsumption: Number(total),
          data: statisticalMeter,
          total: meterReport.count,
          message: 'Data obtained.',
        });
      }
    }
  });

  /**
   * @swagger
   * /api/pems/meterValues/statisticalMeterWeek:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Calculate weekly energy consumption(计算每周耗能情况)
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
  router.get('/statisticalMeterWeek', async (req, res) => {
    let { row, page, startWeek, id, cType, cPositionFk, isAll } = req.query;
    if (startWeek == null || startWeek == '') {
      startWeek = new Date();
    }
    const weekOfday = moment(startWeek).format('E');
    //开始时间的周一
    const cRecordDate = new Date(
      moment(startWeek)
        .subtract(weekOfday - 1, 'days')
        .format('YYYY-MM-DD'),
    );
    let meterIdList = await service.getMeterId(id, cType, cPositionFk);
    let endWeek;
    page = Number(page) || 1;
    row = Number(row) || 5;
    let meterIds = [];
    meterIdList.forEach(element => {
      meterIds.push(element.id);
    });
    const filter = { AND: [] };
    if (cRecordDate) filter.AND = { ...filter.AND, cWeekStart: { in: cRecordDate } };
    filter.AND = { ...filter.AND, cMeterFk: { in: meterIds } };
    const select = {
      cValue: true,
      cMeterFk: true,
      cWeekStart: true,
      cWeekEnd: true,
      Pems_Meter: {
        select: {
          id: true,
          cName: true,
          cDesc: true,
        },
      },
    };
    let rstdata;
    if (isAll == 1) {
      rstdata = await prisma.Pems_MeterReporting_Week.findMany({
        where: filter,
        select,
        orderBy: {
          cMeterFk: 'asc',
        },
      });
    } else {
      rstdata = await prisma.Pems_MeterReporting_Week.findMany({
        where: filter,
        select,
        skip: (page - 1) * row,
        take: row,
        orderBy: {
          cMeterFk: 'asc',
        },
      });
    }

    const count = await prisma.Pems_MeterReporting_Week.count({
      where: filter,
    });
    let totalEnergyConsumption = null;
    if (cType != null && cType != '') {
      const total = await prisma.Pems_MeterReporting_Week.aggregate({
        where: filter,
        _sum: {
          cValue: true,
        },
      });
      totalEnergyConsumption = total._sum.cValue;
    }
    console.log(rstdata.length);
    if (rstdata != null && rstdata != '' && rstdata.length != 0) {
      rstdata.forEach(element => {
        const start = moment(element.cWeekStart).format('YYYY-MM-DD');
        const end = moment(element.cWeekEnd).format('YYYY-MM-DD');
        let date = start + '---' + end;
        element.cWeekStart = date;
      });
      res.json({
        totalEnergyConsumption,
        data: rstdata,
        total: count,
        message: 'Data obtained.',
      });
    } else {
      res.json({
        data: [],
        total: 0,
        message: 'Data Empty.',
      });
    }
  });

  /**
   * @swagger
   * /api/pems/meterValues/statisticalMeterWeek:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Calculate weekly energy consumption(计算每周耗能情况)
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
  router.get('/statisticalMeterMon', async (req, res) => {
    let { row, page, startMonth, id, cType, cPositionFk, isAll } = req.query;
    if (startMonth == null || startMonth == '') {
      startMonth = new Date();
    }
    let startDate = moment(startMonth);
    //月初
    startMonth = new Date(startDate.format('YYYY-MM-01'));
    console.log(startMonth);
    let meterIdList = await service.getMeterId(id, cType, cPositionFk);
    page = Number(page) || 1;
    row = Number(row) || 5;
    let meterIds = [];
    meterIdList.forEach(element => {
      meterIds.push(element.id);
    });
    const filter = { AND: [] };
    if (startMonth) filter.AND = { ...filter.AND, cMonthStart: { in: startMonth } };
    filter.AND = { ...filter.AND, cMeterFk: { in: meterIds } };
    const select = {
      cValue: true,
      cMeterFk: true,
      cMonthStart: true,
      cMonthEnd: true,
      Pems_Meter: {
        select: {
          id: true,
          cName: true,
          cDesc: true,
        },
      },
    };
    let rstdata;
    if (isAll == 1) {
      rstdata = await prisma.Pems_MeterReporting_Month.findMany({
        where: filter,
        select,
        orderBy: {
          cMeterFk: 'asc',
        },
      });
    } else {
      rstdata = await prisma.Pems_MeterReporting_Month.findMany({
        where: filter,
        select,
        skip: (page - 1) * row,
        take: row,
        orderBy: {
          cMeterFk: 'asc',
        },
      });
    }

    const count = await prisma.Pems_MeterReporting_Month.count({
      where: filter,
    });
    let total;
    let totalEnergyConsumption = null;
    // if (cType != null && cType != '') {
    total = await prisma.Pems_MeterReporting_Month.aggregate({
      where: filter,
      _sum: {
        cValue: true,
      },
    });
    totalEnergyConsumption = total._sum.cValue;
    // }

    if (rstdata != null && rstdata != '' && rstdata.length != 0) {
      console.log(rstdata);
      rstdata.forEach(element => {
        const start = moment(element.cMonthStart).format('YYYY-MM-DD');
        const end = moment(element.cMonthEnd).format('YYYY-MM-DD');
        let date = start + '---' + end;
        element.cMonthStart = date;
      });
      res.json({
        totalEnergyConsumption,
        data: rstdata,
        total: count,
        message: 'Data obtained.',
      });
    } else {
      res.json({
        data: [],
        total: 0,
        message: 'Data Empty.',
      });
    }
  });

  return router;
})();

controller.prefix = '/pems/reproting';

export default controller;
