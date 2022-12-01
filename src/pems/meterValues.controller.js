import { Router } from 'express';
import prisma from '../core/prisma';
import service from './service';
import energyFeeService from './energy.service';
import catchAsync from './../utils/catchAsync';
import AppError from './../utils/appError';

var moment = require('moment');
const controller = (() => {
  const router = Router();

  // Test Cron Purpose
  router.get(
    '/testCronService',
    catchAsync(async (req, res) => {
      await service.setMeterValuesandSave();
      res.json('Completed');
    }),
  );

  // Controller for GET Debug Test
  router.get(
    '/getTest',
    catchAsync(async (req, res) => {
      // let meterIds = await service.getMeterId(null, null, 8);
      // let data = await service.getMeterValuesData(null, null, meterIds);
      let dateList = await prisma.Pems_EnergyFeeValues.findFirst();
      res.json(dateList);
    }),
  );

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
  router.get(
    '/statisticalMeterValue',
    catchAsync(async (req, res) => {
      let { page, row, cRecordDate, id, cType, cPositionFk, cRecordType } = req.query;
      if (page == null) {
        page = 1;
      }
      if (row == null) {
        row = 5;
      }
      if (cRecordDate == null || cRecordDate == '') {
        cRecordDate = new Date();
      }
      if (cType == null && id == null && cPositionFk == null) {
        cPositionFk = Number(8);
      }
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
    }),
  );

  /**
   * @swagger
   * /api/pems/meterValues/getall:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Get meterValues by Id or cMerterFk(根据条件（满足A或B条件）获取meterValues的数据)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: meterValues's id.
   *         in: query
   *         type: int
   *       - name: cMerterFk
   *         description: meterValues's cMerterFk
   *         in: query
   *         type: int
   *     responses:
   *       200:
   *         description: meterValues
   *         schema:
   *           type: object
   */
  router.get(
    '/getall',
    catchAsync(async (req, res) => {
      const { id, cMerterFk } = req.query;
      const filter = { OR: [] };
      const select = {
        id: true,
        cValue: true,
        cRecordTime: true,
        cRecordDate: true,
        cRecordType: true,
        cMerterFk: true,
        cRecorder: true,
        Pems_Meter: {
          select: {
            id: true,
            cName: true,
            cType: true,
            cDesc: true,
            dAddTime: true,
          },
        },
      };

      if (id) filter.OR.push({ id: parseInt(id) });
      if (cMerterFk) filter.OR.push({ cMerterFk: parseInt(cMerterFk) });

      if (filter.OR.length < 1) {
        const data = await prisma.Pems_MeterValues.findMany({ select });
        res.json(data);
      } else {
        const data = await prisma.Pems_MeterValues.findMany({
          where: filter,
          select,
        });
        res.json(data);
      }
    }),
  );

  /**
   * @swagger
   * /api/pems/meterValues/pagination:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Pagination query(根据条件获取meterValues的分页数据)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cRecordType
   *         description: meterValues's cRecordType.
   *         in: query
   *         type: String
   *       - name: cMerterFk
   *         description: meterValues's cMerterFk
   *         in: query
   *         type: int
   *     responses:
   *       200:
   *         description: meterValues
   *         schema:
   *           type: object
   */
  router.get(
    '/pagination',
    catchAsync(async (req, res) => {
      const { cRecordType, cMerterFk } = req.query;
      const filter = { AND: {} };
      if (cRecordType) filter.AND = { ...filter.AND, cRecordType: { contains: cRecordType } };
      if (cMerterFk) filter.AND = { ...filter.AND, cMerterFk: Number(cMerterFk) };

      const page = Number(req.query.page) || 1;
      const row = Number(req.query.row) || 5;

      const count = await prisma.Pems_MeterValues.count({
        where: filter,
      });

      const select = {
        id: true,
        cValue: true,
        cRecordTime: true,
        cRecordDate: true,
        cRecordType: true,
        cMerterFk: true,
        cRecorder: true,
        Pems_Meter: {
          select: {
            id: true,
            cName: true,
            cType: true,
            cDesc: true,
            dAddTime: true,
          },
        },
      };

      if (count != null && count > 0) {
        const rstdata = await prisma.Pems_MeterValues.findMany({
          where: filter,
          select,
          skip: (page - 1) * row,
          take: row,
          orderBy: {
            id: 'asc',
          },
        });

        res.json({
          data: rstdata,
          total: count,
          message: 'Data obtained.',
        });
      } else {
        res.json({
          data: [],
          total: count,
          message: 'Data Empty.',
        });
      }
    }),
  );

  return router;
})();

controller.prefix = '/pems/meterValues';

export default controller;
