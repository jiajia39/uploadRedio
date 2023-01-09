import e, { Router } from 'express';
import { lte } from 'lodash';
import prisma from '../core/prisma';
import energyService from './energy.service';
import catchAsync from './../utils/catchAsync';
var moment = require('moment');

const controller = (() => {
  const router = Router();
  /**
   * @swagger
   * /api/pems/energyFees/add:
   *   post:
   *     security:
   *       - Authorization: []
   *     description: add energyFees  (新增)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cPrice
   *         description: energyFees's cPrice.
   *         in: query
   *         type: float
   *       - name: cType
   *         description: energyFees's cType
   *         in: query
   *         type: string
   *       - name: cModel
   *         description: energyFees's cModel
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: energyFees
   *         schema:
   *           type: object
   */
  router.post('/add', async (req, res) => {
    if (!req.body.cPrice) {
      res.status(400).json({ message: 'Please pass price.' });
    } else {
      req.body.cPrice = Number(req.body.cPrice);
    }
    const { cEnergySubstituteFk } = req.body;
    if (cEnergySubstituteFk != null && cEnergySubstituteFk != '') {
      req.body.cEnergySubstituteFk = Number(cEnergySubstituteFk);
    }
    await prisma.Pems_EnergyFees.create({
      data: req.body,
    });
    res.json({ isok: true, message: 'EnergyFees saved' });
  });
  /**
   * @swagger
   * /api/pems/energyFees/edit/:id:
   *   put:
   *     security:
   *       - Authorization: []
   *     description : edit energyFees  (编辑)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cPrice
   *         description: energyFees's cPrice.
   *         in: query
   *         type: float
   *       - name: cType
   *         description: energyFees's cType
   *         in: query
   *         type: string
   *       - name: cModel
   *         description: energyFees's cModel
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: energyFees
   *         schema:
   *           type: object
   */
  router.put(
    '/edit/:id',
    catchAsync(async (req, res) => {
      const { cEnergySubstituteFk } = req.body;
      if (cEnergySubstituteFk != null && cEnergySubstituteFk != '') {
        req.body.cEnergySubstituteFk = Number(cEnergySubstituteFk);
      }
      const data = {
        cPrice: parseFloat(req.body.cPrice),
        cType: req.body.cType,
        cStartTime: req.body.cStartTime,
        cEndTime: req.body.cEndTime,
        cModel: req.body.cModel,
        cEnergySubstituteFk: Number(cEnergySubstituteFk),
      };

      const message = await prisma.Pems_EnergyFees.update({
        where: { id: Number(req.params.id) },
        data: data,
      }).then(() => 'List updated');
      res.json({ isok: true, updatedData: data, message });
    }),
  );
  /**
   * @swagger
   * /api/pems/energyFees/pagination:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Pagination query(根据条件获取energyfee的分页数据)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cRecordType
   *         description: energyfee's cRecordType.
   *         in: query
   *         type: String
   *       - name: cMerterFk
   *         description: energyfee's cMerterFk
   *         in: query
   *         type: int
   *     responses:
   *       200:
   *         description: Get Energy Fees Pagination
   *         schema:
   *           type: object
   */
  router.get(
    '/pagination',
    catchAsync(async (req, res) => {
      const filter = { AND: {} };
      let cType = [];
      let type = req.query.cType;
      if (type != null && type != '') {
        if (type.includes(',')) {
          const result = type.split(',');
          for (let i = 0; i < result.length; i++) {
            cType.push(result[i]);
          }
        } else {
          cType.push(type);
        }
        if (cType) filter.AND = { ...filter.AND, cType: { in: cType } };
      }
      const page = Number(req.query.page) || 1;
      const row = Number(req.query.row) || 5;
      const count = await prisma.Pems_EnergyFees.count({
        where: filter,
      });

      const select = {
        id: true,
        cPrice: true,
        cType: true,
        cStartTime: true,
        cEndTime: true,
        cModel: true,
        cEnergySubstituteFk: true,
        Pems_Energy_Substitute: {
          select: {
            id: true,
            cName: true,
          },
        },
      };

      if (count != null && count > 0) {
        const rstdata = await prisma.Pems_EnergyFees.findMany({
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

  /**
   * @swagger
   * /api/pems/Pems_EnergyFees/delete/:id:
   *   put:
   *     security:
   *       - Authorization: []
   *     description : delete Pems_EnergyFees  (删除)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Pems_EnergyFees's id.
   *         in: query
   *         type: int
   *     responses:
   *       200:
   *         description: Pems_EnergyFees
   *         schema:
   *           type: object
   */
  router.delete(
    '/delete/:id',
    catchAsync(async (req, res) => {
      const message = await prisma.Pems_EnergyFees.delete({
        where: { id: Number(req.params.id) },
      }).then(() => 'MeterPosition deleted');

      res.json({ message });
    }),
  );
  /**
   * @swagger
   * /api/pems/energyFees/getType:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Get the meterValues type(获取meterValues的类型值)
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
    '/getType',
    catchAsync(async (req, res) => {
      // const select = {
      //   cType: true,
      // };
      const rstdata = await prisma.Pems_EnergyFees.groupBy({
        by: ['cType'],
      });
      res.json(rstdata);
    }),
  );

  /**
   * @swagger
   * /api/pems/energyFees/save/value:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Save the Energy Fees for All Meters(将计算的前一天能源费率存入表中)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Save Completed
   *         schema:
   *           type: json
   */
  router.get(
    '/save/value',
    catchAsync(async (req, res) => {
      // const filter = { AND: [] };
      // const cRecordDate = new Date(moment('2022-11-09').format('YYYY-MM-DD'));
      // if (cRecordDate) filter.AND.push({ cRecordDate: { gte: cRecordDate } });

      // const value = await prisma.Pems_EnergyFeeValues.findMany({
      //   where: filter,
      // });
      const value = await energyService.setEnergyFeeValuesAndSaveHistory();
      res.json('Energy Fee Saved');
    }),
  );

  return router;
})();

controller.prefix = '/pems/energyFees';

export default controller;
