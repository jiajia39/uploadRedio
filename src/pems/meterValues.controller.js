import { Router } from 'express';
import influxservice from '../influx/service';
import prisma from '../core/prisma';
import service from './service';
const controller = (() => {
  const router = Router();
  router.get('/testCronService', async (req, res) => {
    let list = [
      {
        id: 199,
      },
    ];
    let getMeterValuesData = await service.getMeterValuesData(1, 5, '2022-10-25', null, list);
    res.json(getMeterValuesData);
    // const filter = { AND: {} };
    // var moment = require('moment');
    // let meterIdList = [16];

    // var moment = require('moment');
    // const dateStr = moment(new Date()).format('YYYY-MM-DD');

    // let dateTime = new Date(dateStr);

    // let preDate = new Date(
    //   moment(dateTime)
    //     .subtract(1, 'days')
    //     .format('YYYY-MM-DD'),
    // );
    // // let preDate = new Date(moment(dateTime).format('YYYY-MM-DD'));

    // let cRecordDate = '';

    // // const preDate = new Date(cRecordDate);
    // let dateList = [];
    // dateList.push(dateTime);
    // dateList.push(preDate);
    // // const filter = { AND: [] };
    // // if (cRecordType) filter.AND.push({ cRecordType });
    // const select = {
    //   cRecordTime: true,
    //   cRecordDate: true,
    //   cValue: true,
    //   cMerterFk: true,
    //   cRecordType: true,
    //   Pems_Meter: {
    //     select: {
    //       id: true,
    //       cName: true,
    //     },
    //   },
    // };
    // const list = [];
    // meterIdList.forEach(meter => {
    //   dateList.forEach(date => {
    //     console.log(date);
    //     list.push({
    //       cMerterFk: meter,
    //       cRecordDate: date,
    //     });
    //   });
    // });
    // console.log(list);
    // const page = 1;
    // const row = 5;
    // const count = await prisma.Pems_MeterValues.count({
    //   where: {
    //     OR: list,
    //   },
    // });
    // console.log(count);
    // let rstdata;
    // // rstdata = await prisma.Pems_MeterValues.findMany({
    // //   where: {
    // //     OR: list,
    // //   },
    // //   select,
    // //   orderBy: {
    // //     cRecordTime: 'asc',
    // //   },
    // // });

    // if (count != null && count > 0) {
    //   const rstdata = await prisma.Pems_MeterValues.findMany({
    //     where: {
    //       OR: list,
    //     },
    //     select,
    //     skip: (page - 1) * row,
    //     take: row,
    //     orderBy: {
    //       cRecordTime: 'asc',
    //     },
    //   });

    //   res.json({
    //     data: rstdata,
    //     total: count,
    //     message: 'Data obtained.',
    //   });
    // } else {
    //   res.json({
    //     data: [],
    //     total: count,
    //     message: 'Data Empty.',
    //   });
    // }
    // res.json(rstdata);
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
    const date = await service.statisticalMeterData(
      id,
      cType,
      cPositionFk,
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
    const { id, cType, cPositionFk, cRecordType } = req.query;
    const date = await service.statisticalMeterWeek(id, cType, cPositionFk, cRecordType);
    if (date.length != 0) {
      const { totalEnergyConsumption } = date[date.length - 1];
      res.json({
        totalEnergyConsumption,
        data: date,
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
  });

  /**
   * @swagger
   * /api/pems/meterValues/statisticalMeterMon:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Calculate monthly energy consumption(计算每月耗能情况)
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
    const { id, cType, cPositionFk, cRecordType } = req.query;
    const date = await service.statisticalMeterMon(id, cType, cPositionFk, cRecordType);
    if (date.length != 0) {
      const { totalEnergyConsumption } = date[date.length - 1];
      res.json({
        totalEnergyConsumption,
        data: date,
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
  });
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
  router.get('/getall', async (req, res) => {
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
  });
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
  router.get('/pagination', async (req, res) => {
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
  });

  return router;
})();

controller.prefix = '/pems/meterValues';

export default controller;
