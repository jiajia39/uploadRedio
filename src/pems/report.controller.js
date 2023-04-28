import e, { Router } from 'express';
import prisma from '../core/prisma';
import service from './service';
import energyService from './energy.service';
import reportService from './report.service';
import catchAsync from '../utils/catchAsync';

const moment = require('moment');

const controller = (() => {
  const router = Router();

  /**
   * Save the Daily Energy Consumption to the Energy Fee Day Table
   * Executed Every Day at Midnight, can be referred at Schedule Service
   * This Controller is for Test Purpose and will not be used in the Production Env
   */
  router.get('/save/day', async (req, res) => {
    await service.saveReportDay();
    res.json({ isok: true, message: 'Report saved' });
  });

  /**
   * Save the Weekly Energy Consumption to the Energy Week Table
   * Executed Every Monday at Midnight, can be referred at Schedule Service
   * This Controller is for Test Purpose and will not be used in the Production Env
   */
  router.get('/save/week/history', async (req, res) => {
    await service.saveReoprtWeekHistory();
    res.json({ isok: true, message: 'Report saved' });
  });

  /**
   * Update the Weekly Energy Consumption per Day to the Energy Week Table
   * Executed Every Day at Midnight, can be referred at Schedule Service
   * This Controller is for Test Purpose and will not be used in the Production Env
   */
  router.get('/save/Current/week', async (req, res) => {
    await service.saveReoprtCurrentWeek();
    res.json({ isok: true, message: 'Report saved' });
  });

  /**
   * Save the Monthly Energy Consumption to the Energy Month Table
   * Executed Every Month at Midnight, can be referred at Schedule Service
   * This Controller is for Test Purpose and will not be used in the Production Env
   */
  router.get('/save/month/history', async (req, res) => {
    await service.saveReoprtMonHistory();
    res.json({ isok: true, message: 'Report saved' });
  });

  /**
   * Update the Monthly Energy Consumption per Day to the Energy Month Table
   * Executed Every Day at Midnight, can be referred at Schedule Service
   * This Controller is for Test Purpose and will not be used in the Production Env
   */
  router.get('/save/current/month', async (req, res) => {
    await service.saveReoprtCurrentMon();
    res.json({ isok: true, message: 'Report saved' });
  });

  /**
   * @swagger
   * /api/pems/reporting/statisticalMeterValue:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Calculate the energy consumption of each shift(展示meterValue数据并计算每个班次耗能情况)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cRecordDate
   *         description: Date Input (YYYY-MM-DD), Default is Current Date
   *         in: query
   *         type: datetime
   *       - name: cType
   *         description: meter's cType
   *         in: query
   *         type: string
   *       - name: cPositionFk
   *         description: meter's cPositionFk
   *         in: query
   *         type: int
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
   *         description: meterValues's cRecordType,
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: meterValues
   *         schema:
   *           type: object
   */
  router.get(
    '/statisticalMeterValue',
    catchAsync(async (req, res) => {
      // isAll 是否展示所有数据 1展示
      let {
        page,
        row,
        cRecordDate,
        id,
        cType,
        cPositionFk,
        cRecordType,
        cProductionLineFk,
        isAll,
        productLine,
      } = req.query;
      if (page == null) {
        page = 1;
      }
      if (row == null) {
        row = 5;
      }
      const now = new Date(moment().format('YYYY-MM-DD'));
      const recordDate = new Date(moment(cRecordDate).format('YYYY-MM-DD'));
      if (cRecordDate == null || cRecordDate == '' || now.getTime() == recordDate.getTime()) {
        cRecordDate = new Date();
        const date = await service.statisticalMeterData(
          id,
          cType,
          Number(cPositionFk),
          cRecordDate,
          cRecordType,
          cProductionLineFk,
          productLine,
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
            if (productLine == 'true' || (cProductionLineFk != null && cProductionLineFk != '')) {
              element.productLine = true;
            } else if (productLine == 'false' || (cPositionFk != null && cPositionFk != '')) {
              element.productLine = false;
            }
          });
          const { totalEnergyConsumptionDay } = date[date.length - 1];
          const { totalEnergyConsumptionNight } = date[date.length - 1];
          const { totalEnergyConsumption } = date[date.length - 1];
          res.json({
            totalEnergyConsumption,
            totalEnergyConsumptionDay,
            totalEnergyConsumptionNight,
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
        const meterIdList = await service.getMeterId(
          id,
          cType,
          cPositionFk,
          cProductionLineFk,
          productLine,
          null,
          null,
        );
        const meterReport = await service.getMeterReportingDayData(
          page,
          row,
          cRecordDate,
          meterIdList,
          cType,
          isAll,
        );
        let totalEnergyConsumptionDay = null;
        let totalEnergyConsumptionNight = null;
        let total;
        if (meterReport.data != null) {
          total = parseFloat(meterReport.dataSum._sum.cValue).toFixed(2);
          meterReport.data.forEach(element => {
            if (element.cRecordType == '白班') {
              totalEnergyConsumptionDay = parseFloat(element._sum.cValue).toFixed(2);
            } else {
              totalEnergyConsumptionNight = parseFloat(element._sum.cValue).toFixed(2);
            }
          });
        }
        if (meterReport.rstdata != null && meterReport.rstdata.length > 0) {
          const shiftDate = await prisma.Pems_Shift.findMany();
          const statisticalMeter = [];
          if (productLine == 'true' || (cProductionLineFk != null && cProductionLineFk != '')) {
            productLine = true;
          } else if (productLine == 'false' || (cPositionFk != null && cPositionFk != '')) {
            productLine = false;
          }
          meterReport.rstdata.forEach(element => {
            let shiftTime = null;
            shiftDate.forEach(shift => {
              if (shift.cDesc == element.cRecordType) {
                shiftTime = `${shift.cStartTime}---${shift.cEndTime}`;
              }
            });
            const energyConsumption = element.cValue;
            const cRecordDate = element.cDate;
            const { cMeterFk } = element;
            const { cRecordType } = element;
            const { Pems_Meter } = element;
            const cValue = element.cMeterValue;
            statisticalMeter.push({
              shiftTime,
              cMeterFk,
              cRecordType,
              cRecordDate,
              energyConsumption,
              cValue,
              Pems_Meter,
              productLine,
            });
          });
          res.json({
            totalEnergyConsumption: Number(total),
            totalEnergyConsumptionDay,
            totalEnergyConsumptionNight,
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
    }),
  );
  /**
   * @swagger
   *  /api/pems/reporting/total/energy/consumption/echart/day:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Show the daily energy consumption and cost of water and electricity for the month
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cType
   *         description: meter's cType
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: meterValues
   *         schema:
   *           type: object
   */
  router.get(
    '/total/energy/consumption/echart/day',
    catchAsync(async (req, res) => {
      const { cType } = req.query;
      const list = await reportService.getEchartDay(cType);
      res.json({
        data: list,
      });
    }),
  );
  /**
   * @swagger
   *  /api/pems/reporting/total/energy/consumption/echart/perDate/position:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Distribution of electricity consumption by region on the previous day
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: meterValues
   *         schema:
   *           type: object
   */
  router.get(
    '/total/energy/consumption/echart/perDate/position',
    catchAsync(async (req, res) => {
      const list = await reportService.getEchartByPosition();
      res.json({ data: list });
    }),
  );
  /**
   * @swagger
   *  /api/pems/reporting/total/energy/consumption/echart/perDate/productionLine:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Power consumption distribution of each production line on the previous day
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: meterValues
   *         schema:
   *           type: object
   */
  router.get(
    '/total/energy/consumption/echart/perDate/productionLine',
    catchAsync(async (req, res) => {
      const list = await reportService.getEchartByProductionLine();
      res.json({ data: list });
    }),
  );
  /**
   * @swagger
   *  /api/pems/reporting/total/energy/consumption/echart/perDate/productionLine:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Save Excel - Daily energy consumption last month
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: meterValues
   *         schema:
   *           type: object
   */
  router.get(
    '/total/energy/consumption/excel/save/month/report',
    catchAsync(async (req, res) => {
      reportService.saveExcel();
    }),
  );
  router.get(
    '/total/energy/consumption/echart/week',
    catchAsync(async (req, res) => {
      const list = [];
      const { cType } = req.query;
      const meterIds = [];
      // 获取前7周的周一
      const timeList = [];
      const weekOfDay = parseInt(moment().format('E')); // 计算今天是这周第几天
      for (let i = 9; i >= 0; i--) {
        // 周一日期
        const last_monday = new Date(
          moment()
            .subtract(weekOfDay + 7 * i - 1, 'days')
            .format('YYYY-MM-DD'),
        );
        timeList.push(last_monday);
      }

      console.log(timeList);
      if (cType != null && cType != '') {
        const cPositionFk = [18, 19, 20];
        const filterMeter = { AND: [] };
        if (cType) filterMeter.AND.push({ cType });
        if (cPositionFk) filterMeter.AND.push({ cPositionFk: { in: cPositionFk } });

        const ids = await prisma.Pems_Meter.groupBy({
          where: filterMeter,
          by: ['id'],
        });
        ids.forEach(element => {
          meterIds.push(element.id);
        });
      }
      for (let j = 0; j < timeList.length; j++) {
        let totalEnergyConsumption = null;
        const monTime = timeList[j];
        const filter = { AND: [] };
        if (meterIds != null && meterIds.length > 0)
          filter.AND = { ...filter.AND, cMeterFk: { in: meterIds } };
        if (monTime) filter.AND = { ...filter.AND, cWeekStart: { in: monTime } };
        const data = await prisma.Pems_MeterReporting_Week.aggregate({
          where: filter,
          _sum: {
            cValue: true,
          },
        });
        totalEnergyConsumption = parseFloat(data._sum.cValue).toFixed(2);
        // 周日
        const weekOfday = moment(monTime).format('E');
        const endSun = moment(monTime)
          .add(7 - weekOfday, 'days')
          .format('YYYY-MM-DD');
        const weekTime = `${moment(monTime).format('YYYY-MM-DD')}---${endSun}`;
        list.push({
          date: weekTime,
          totalEnergyConsumption,
        });
      }
      res.json({
        data: list,
      });
    }),
  );

  router.get(
    '/total/energy/consumption/echart/month',
    catchAsync(async (req, res) => {
      const list = [];
      const { cType } = req.query;
      const mon = new Date(
        moment()
          .subtract(9, 'months')
          .format('YYYY-MM-DD'),
      );
      const now = new Date(moment().format('YYYY-MM-DD'));
      const monList = await service.getStaAndEndMon(mon, now);
      const meterIds = [];
      if (cType != null && cType != '') {
        const cPositionFk = [18, 19, 20];
        const filterMeter = { AND: [] };
        if (cType) filterMeter.AND.push({ cType });
        if (cPositionFk) filterMeter.AND.push({ cPositionFk: { in: cPositionFk } });

        const ids = await prisma.Pems_Meter.groupBy({
          where: filterMeter,
          by: ['id'],
        });
        ids.forEach(element => {
          meterIds.push(element.id);
        });
      }
      for (let j = 0; j < monList.length; j++) {
        let totalEnergyConsumption = null;
        const startMonTime = new Date(monList[j].startTime);
        const filter = { AND: [] };
        if (meterIds != null && meterIds.length > 0)
          filter.AND = { ...filter.AND, cMeterFk: { in: meterIds } };
        if (startMonTime) filter.AND = { ...filter.AND, cMonthStart: { in: startMonTime } };
        const data = await prisma.Pems_MeterReporting_Month.aggregate({
          where: filter,
          _sum: {
            cValue: true,
          },
        });
        totalEnergyConsumption = parseFloat(data._sum.cValue).toFixed(2);
        const monTime = `${monList[j].startTime}---${monList[j].endSun}`;
        list.push({
          date: monTime,
          totalEnergyConsumption,
        });
      }
      res.json({
        data: list,
      });
    }),
  );

  /**
   * @swagger
   * /api/pems/meterValues/statisticalMeterDay:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Calculate Day energy consumption(计算每天耗能情况)
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
  router.get(
    '/statisticalMeterDay',
    catchAsync(async (req, res) => {
      let {
        row,
        page,
        cRecordDate,
        id,
        cType,
        cPositionFk,
        isAll,
        cProductionLineFk,
        productLine,
      } = req.query;
      if (cRecordDate == null || cRecordDate == '') {
        cRecordDate = new Date(
          moment()
            .subtract(1, 'days')
            .format('YYYY-MM-DD'),
        );
      } else {
        cRecordDate = new Date(moment(cRecordDate).format('YYYY-MM-DD'));
      }
      const data = await service.getStatisticalMeterDay(
        row,
        page,
        cRecordDate,
        id,
        cType,
        cPositionFk,
        isAll,
        cProductionLineFk,
        productLine,
      );
      res.json(data);
    }),
  );

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
  router.get(
    '/statisticalMeterWeek',
    catchAsync(async (req, res) => {
      let {
        row,
        page,
        startWeek,
        id,
        cType,
        cPositionFk,
        isAll,
        cProductionLineFk,
        productLine,
      } = req.query;
      if (startWeek == null || startWeek == '') {
        startWeek = new Date();
      }
      const weekOfday = moment(startWeek).format('E');
      // 开始时间的周一
      const cRecordDate = new Date(
        moment(startWeek)
          .subtract(weekOfday - 1, 'days')
          .format('YYYY-MM-DD'),
      );
      const endWeekOfday = moment(cRecordDate).format('E');
      const endSun = moment(cRecordDate)
        .add(7 - endWeekOfday, 'days')
        .format('YYYYMMDD');

      const meterIdList = await service.getMeterId(
        id,
        cType,
        cPositionFk,
        cProductionLineFk,
        productLine,
        null,
        null,
      );
      let endWeek;
      page = Number(page) || 1;
      row = Number(row) || 5;
      const meterIds = [];
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
      if (productLine == 'true' || (cProductionLineFk != null && cProductionLineFk != '')) {
        rstdata.forEach(element => {
          element.productLine = true;
        });
      } else if (productLine == 'false' || (cPositionFk != null && cPositionFk != '')) {
        rstdata.forEach(element => {
          element.productLine = false;
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
          const date = `${start}---${end}`;
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
    }),
  );

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
  router.get(
    '/statisticalMeterMon',
    catchAsync(async (req, res) => {
      let {
        row,
        page,
        startMonth,
        id,
        cType,
        cPositionFk,
        isAll,
        cProductionLineFk,
        productLine,
      } = req.query;
      if (startMonth == null || startMonth == '') {
        startMonth = new Date();
      }
      const startDate = moment(startMonth);
      // 月初
      startMonth = new Date(startDate.format('YYYY-MM-01'));
      // 月末
      const endMonth = moment(startMonth)
        .endOf('month')
        .format('YYYY-MM-DD');
      console.log(startMonth);
      const meterIdList = await service.getMeterId(
        id,
        cType,
        cPositionFk,
        cProductionLineFk,
        productLine,
        null,
        null,
      );
      page = Number(page) || 1;
      row = Number(row) || 5;
      const meterIds = [];
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
      if (productLine == 'true' || (cProductionLineFk != null && cProductionLineFk != '')) {
        rstdata.forEach(element => {
          element.productLine = true;
        });
      } else if (productLine == 'false' || (cPositionFk != null && cPositionFk != '')) {
        rstdata.forEach(element => {
          element.productLine = false;
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
          const date = `${start}---${end}`;
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
    }),
  );

  /**
   * @swagger
   * /api/pems/reporting/getMonthEnergyConsumption:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: 根据日期计算这段日期每月的耗能
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - startDate: id
   *         description: startDate
   *         in: query
   *         type: date
   *       - name: cType
   *         description: meter's cType
   *         in: query
   *         type: string
   *       - name: endDate
   *         description: endDate
   *         in: query
   *         type: date
   *     responses:
   *       200:
   *         description: meterValues
   *         schema:
   *           type: object
   */
  router.get(
    '/getMonthEnergyConsumption',
    catchAsync(async (req, res) => {
      const { startDate, endDate, cType } = req.query;
      console.log(startDate);
      if (startDate == null || startDate == '' || startDate == 'undefined') {
        res.json({ isok: false, message: '开始时间不能为空' });
      }
      if (endDate == null || endDate == '' || endDate == 'undefined') {
        res.json({ isok: false, message: '结束时间不能为空' });
      }
      if (cType == null || cType == '' || cType == 'undefined') {
        res.json({ isok: false, message: '类型不能为空' });
      }
      const aa = await reportService.getMonthEnergyConsumption(cType, startDate, endDate);
      res.json(aa);
    }),
  );

  return router;
})();

controller.prefix = '/pems/reporting';

export default controller;
