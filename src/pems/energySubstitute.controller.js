import e, { Router } from 'express';
import { lte } from 'lodash';
import prisma from '../core/prisma';
import energyService from './energy.service';
import catchAsync from '../utils/catchAsync';
var moment = require('moment');

const controller = (() => {
  const router = Router();
  /**
   * @swagger
   * /api/pems/energySubstitute/add:
   *   post:
   *     security:
   *       - Authorization: []
   *     description: add energySubstitute  (新增)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *         description: energySubstitute's cName
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: energySubstitute
   *         schema:
   *           type: object
   */
  router.post('/add', async (req, res) => {
    if (!req.body.cName) {
      res.status(400).json({ message: 'Please pass cName.' });
    }
    req.body.dAddTime = new Date();
    await prisma.Pems_Energy_Substitute.create({
      data: req.body,
    });
    res.json({ isok: true, message: 'energySubstitute saved' });
  });
  /**
   * @swagger
   * /api/pems/energySubstitute/edit/:id:
   *   put:
   *     security:
   *       - Authorization: []
   *     description : edit energySubstitute  (编辑)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *         description: energySubstitute's cName
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: energySubstitute
   *         schema:
   *           type: object
   */
  router.put(
    '/edit/:id',
    catchAsync(async (req, res) => {
      const data = {
        cName: req.body.cName,
      };
      const message = await prisma.Pems_Energy_Substitute.update({
        where: { id: Number(req.params.id) },
        data,
      }).then(() => 'List updated');
      res.json({ isok: true, updatedData: data, message });
    }),
  );
  /**
   * @swagger
   * /api/pems/energySubstitute/pagination:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Pagination query(根据条件获取energyfee的分页数据)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *         description: energySubstitute's cName
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: Get Energy Substitute Pagination
   *         schema:
   *           type: object
   */
  router.get(
    '/pagination',
    catchAsync(async (req, res) => {
      const filter = { AND: {} };
      const { cName } = req.query;
      if (cName) filter.AND = { ...filter.AND, cName };
      const page = Number(req.query.page) || 1;
      const row = Number(req.query.row) || 5;
      const count = await prisma.Pems_Energy_Substitute.count({
        where: filter,
      });

      // const select = {
      //   id: true,
      //   cName: true,
      //   dAddTime
      // };

      if (count != null && count > 0) {
        const rstdata = await prisma.Pems_Energy_Substitute.findMany({
          where: filter,
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
   * /api/pems/energySubstitute/getAll:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Pagination query(根据条件获取energy_Substitutenergyfee的所有信息)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Get Energy Substitute Pagination
   *         schema:
   *           type: object
   */
  router.get(
    '/getAll',
    catchAsync(async (req, res) => {
      const rstdata = await prisma.Pems_Energy_Substitute.findMany();
      res.json({ data: rstdata });
    }),
  );

  /**
   * @swagger
   * /api/pems/energySubstitute/delete/:id:
   *   put:
   *     security:
   *       - Authorization: []
   *     description : delete energySubstitute  (删除)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: energySubstitute's id.
   *         in: query
   *         type: int
   *     responses:
   *       200:
   *         description: energySubstitute
   *         schema:
   *           type: object
   */
  router.delete(
    '/delete/:id',
    catchAsync(async (req, res) => {
      const message = await prisma.Pems_Energy_Substitute.delete({
        where: { id: Number(req.params.id) },
      }).then(() => 'MeterPosition deleted');

      res.json({ isok: true, message });
    }),
  );

  /**
   * @swagger
   * /api/pems/energySubstitute/getName:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Get the Pems_Energy_Substitute cName(获取介质的名称)
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
    '/getName',
    catchAsync(async (req, res) => {
      // const select = {
      //   cType: true,
      // };
      const rstdata = await prisma.Pems_Energy_Substitute.groupBy({
        by: ['cName'],
      });
      res.json(rstdata);
    }),
  );

  return router;
})();

controller.prefix = '/pems/energySubstitute';

export default controller;
