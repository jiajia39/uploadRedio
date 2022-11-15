import e, { Router } from 'express';
import prisma from '../core/prisma';
import service from '../pems/service';
import energyService from './energy.service';
var moment = require('moment');

const controller = (() => {
  const router = Router();
  router.get('/save/day', async (req, res) => {
    await service.saveReportDay();
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
    await service.saveReoprtMonHistory();
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
    let recordDate = new Date(moment(cRecordDate).format('YYYY-MM-DD'));
    if (cRecordDate == null || cRecordDate == '' || now.getTime() == recordDate.getTime()) {
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
        pageList.forEach(element => {
          element.cRecordDate = moment(element.cDate).format('YYYY-MM-DD');
        });
        const { totalEnergyConsumption } = date[date.length - 1];
        res.json({
          totalEnergyConsumption,
          feeSum: null,
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
      cRecordDate = new Date(moment(cRecordDate).format('YYYY-MM-DD'));
      let meterIdList = await service.getMeterId(id, cType, cPositionFk);
      console.log(meterIdList);
      let meterReport = await service.getMeterReportingDayData(
        page,
        row,
        cRecordDate,
        meterIdList,
        cType,
        isAll,
      );
      console.log(meterReport);
      let total;
      if (meterReport.data != null) {
        total = parseFloat(meterReport.data._sum.cValue).toFixed(2);
      }
      if (meterReport.rstdata != null && meterReport.rstdata.length > 0) {
        let statisticalMeter = [];
        meterReport.rstdata.forEach(element => {
          let energyConsumption = element.cValue;
          const cRecordDate = element.cDate;
          const cMeterFk = element.cMeterFk;
          const cRecordType = element.cRecordType;
          statisticalMeter.push({ cMeterFk, cRecordType, cRecordDate, energyConsumption });
        });
        res.json({
          totalEnergyConsumption: Number(total),
          data: statisticalMeter,
          total: meterReport.count,
          feeSum: meterReport.feeSum,
          message: 'Data obtained.',
        });
      } else {
        res.json({
          data: [],
          total: 0,
          totalEnergyConsumption: null,
          feeSum: null,
          message: 'Data Empty.',
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
    const endWeekOfday = moment(cRecordDate).format('E');
    const endSun = moment(cRecordDate)
      .add(7 - endWeekOfday, 'days')
      .format('YYYYMMDD');

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
    let feeSum = null;
    let totalEnergyConsumption = null;
    if (cType != null && cType != '') {
      const total = await prisma.Pems_MeterReporting_Week.aggregate({
        where: filter,
        _sum: {
          cValue: true,
        },
      });
      totalEnergyConsumption = parseFloat(total._sum.cValue).toFixed(2);
      feeSum = await energyService.getFeeSum(meterIds, cRecordDate, endSun);
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
        feeSum,
        total: count,
        message: 'Data obtained.',
      });
    } else {
      res.json({
        data: [],
        totalEnergyConsumption,
        feeSum,
        total: 0,
        message: 'Data Empty.',
      });
    }
  });

  /**
   * @swagger
   * /api/pems/meterValues/statisticalMeterMon:
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
    //月末
    let endMonth = moment(startMonth)
      .endOf('month')
      .format('YYYY-MM-DD');
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
    let feeSum = null;
    if (cType != null && cType != '') {
      total = await prisma.Pems_MeterReporting_Month.aggregate({
        where: filter,
        _sum: {
          cValue: true,
        },
      });
      totalEnergyConsumption = parseFloat(total._sum.cValue).toFixed(2);
      feeSum = await energyService.getFeeSum(meterIds, startMonth, endMonth);
    }

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
        feeSum,
        data: rstdata,
        total: count,
        message: 'Data obtained.',
      });
    } else {
      res.json({
        totalEnergyConsumption,
        feeSum,
        data: [],
        total: 0,
        message: 'Data Empty.',
      });
    }
  });

  return router;
})();

controller.prefix = '/pems/reporting';

export default controller;
