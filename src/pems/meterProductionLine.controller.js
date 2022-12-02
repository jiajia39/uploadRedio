import { Router } from 'express';
import service from '../sys/service';
import prisma from '../core/prisma';
import catchAsync from '../utils/catchAsync';

const controller = (() => {
  const router = Router();
  /**
   * @swagger
   * /api/pems/meterProductionLine/add:
   *   put:
   *     security:
   *       - Authorization: []
   *     description : add meterProductionLine  (新增)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: parentId
   *         description: meterProductionLine's parentId.
   *         in: query
   *         type: int
   *       - name: cType
   *         description: meterProductionLine's cType
   *         in: query
   *         type: string
   *       - name: cName
   *         description: meterProductionLine's cName
   *         in: query
   *         type: string
   *       - name: cDesc
   *         description: meterProductionLine's cDesc
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: meterProductionLine
   *         schema:
   *           type: object
   */
  router.post('/add', async (req, res) => {
    if (!req.body.cName) {
      res.status(400).json({ message: 'Please pass cName.' });
      return;
    }
    if (!req.body.cType) {
      res.status(400).json({ message: 'Please pass cType.' });
      return;
    }
    if (!req.body.cDesc) {
      res.status(400).json({ message: 'Please pass cDesc.' });
      return;
    }
    if (!req.body.parentId) {
      console.log('____________' + req.body.parentId);
      req.body.parentId = null;
    } else {
      req.body.parentId = Number(req.body.parentId);
    }
    req.body.dAddTime = new Date();
    await prisma.Pems_MeterProductionLine.create({
      data: req.body,
    });
    res.json({ isok: true, message: 'EnergyFees saved' });
  });

  /**
   * @swagger
   * /api/pems/meterProductionLine/edit/:id:
   *   put:
   *     security:
   *       - Authorization: []
   *     description : edit meterProductionLine  (编辑)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: parentId
   *         description: meterProductionLine's parentId.
   *         in: query
   *         type: int
   *       - name: cType
   *         description: meterProductionLine's cType
   *         in: query
   *         type: string
   *       - name: cName
   *         description: meterProductionLine's cName
   *         in: query
   *         type: string
   *       - name: cDesc
   *         description: meterProductionLine's cDesc
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: meterProductionLine
   *         schema:
   *           type: object
   */

  router.put(
    '/edit/:id',
    catchAsync(async (req, res) => {
      if (!req.body.parentId) {
        console.log('____________' + req.body.parentId);
        req.body.parentId = null;
      } else {
        req.body.parentId = Number(req.body.parentId);
      }
      const date = {
        parentId: req.body.parentId,
        cName: req.body.cName,
        cType: req.body.cType,
        cDesc: req.body.cDesc,
      };
      const message = await prisma.Pems_MeterProductionLine.update({
        where: { id: Number(req.params.id) },
        data: date,
      }).then(() => 'List updated');
      res.json({ isok: true, message });
    }),
  );

  /**
   * @swagger
   * /api/pems/meterProductionLine/delete/:id:
   *   put:
   *     security:
   *       - Authorization: []
   *     description : delete meterProductionLine  (删除)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: meterProductionLine's id.
   *         in: query
   *         type: int
   *     responses:
   *       200:
   *         description: meterProductionLine
   *         schema:
   *           type: object
   */
  router.delete('/delete/:id', async (req, res) => {
    const message = await prisma.Pems_MeterProductionLine.delete({
      where: { id: Number(req.params.id) },
    }).then(() => 'MeterProductionLine deleted');

    res.json({ message });
  });

  /**
   * @swagger
   * /api/pems/meterProductionLine/getall:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Get Meter Position and its relevant meters by id and type
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: meter's id.
   *         in: query
   *         type: int
   *       - name: cType
   *         description: meter's type.
   *         in: query
   *         type: int
   *     responses:
   *       200:
   *         description: meter ProductionLines and relevant meters
   *         schema:
   *           type: object
   */
  router.get(
    '/getall',
    catchAsync(async (req, res) => {
      const { id, cName } = req.query;
      const filter = { OR: [] };

      const select = {
        id: true,
        cName: true,
        parentId: true,
        dAddTime: true,
        cDesc: true,
      };

      if (id) filter.OR.push({ id: parseInt(id) });
      if (cName) filter.OR.push({ cName });

      if (filter.OR.length < 1) {
        const data = await prisma.Pems_MeterProductionLine.findMany({ select });
        res.json(data);
      } else {
        const data = await prisma.Pems_MeterProductionLine.findMany({
          where: filter,
          select,
        });
        res.json(data);
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
      const rstdata = await prisma.Pems_MeterProductionLine.findMany();
      res.json({ data: rstdata });
    }),
  );

  /**
   * @swagger
   * /api/pems/meterProductionLine/getbyparentid:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: meter ProductionLine getbyparentid
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: parentId
   *         description: parent id.
   *         in: query
   *         type: int
   *     responses:
   *       200:
   *         description: Get Meter Position by Parent Id
   *         schema:
   *           type: object
   */
  router.get(
    '/getbyparentid',
    catchAsync(async (req, res) => {
      const { parentId } = req.query;

      const find = {};

      if (parentId) find.parentId = parentId;

      const data = await prisma.Pems_MeterProductionLine.findMany({
        where: find,
      });

      res.json({ data, message: 'Data obtained.' });
    }),
  );

  /**
   * @swagger
   * /api/pems/meterProductionLine/gettreenodes:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: get treenodes for meter ProductionLine
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: parentId
   *         description: parent id.
   *         in: query
   *         type: int
   *     responses:
   *       200:
   *         description: get treenodes for meter ProductionLine
   *         schema:
   *           type: object
   */
  router.get(
    '/gettreenodes',
    catchAsync(async (req, res) => {
      const data = await prisma.Pems_MeterProductionLine.findMany();
      const treeOption = {
        enable: true, // 是否开启转tree插件数据
        keyField: 'key', // 标识字段名称
        valueField: 'value', // 值字段名称
        titleField: 'title', // 标题字段名称

        keyFieldBind: 'id', // 标识字段绑定字段名称
        valueFieldBind: 'id', // 值字段名称绑定字段名称
        titleFieldBind: 'cName', // 标题字段名称绑定字段名称
      };
      const treeData = service.toTreeByRecursion(
        data,
        'id',
        'parentId',
        null,
        'children',
        treeOption,
      );
      res.json({ treeData, message: 'Data obtained.', productLine: true });
    }),
  );

  /**
   * @swagger
   * /api/pems/meterProductionLine/item/{id}:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: meter ProductionLine's id.
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: login
   *         schema:
   *           type: object
   */
  router.get(
    '/item/:id',
    catchAsync(async (req, res) => {
      const data = await prisma.Pems_MeterProductionLine.findUnique({
        where: { id: parseInt(req.params.id) },
      });
      res.json({ data, message: 'Data obtained.' });
    }),
  );

  /**
   * @swagger
   * /api/pems/meterProductionLine/count:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Get count for meter ProductionLines!
   *     tags: [pems]
   *     responses:
   *       200:
   *         description: Returns a mysterious string.
   */
  router.get(
    '/count',
    catchAsync(async (req, res) => {
      const data = await prisma.Pems_MeterProductionLine.count();
      res.json({ data, message: 'Data obtained.' });
    }),
  );

  /**
   * @name pagination - get a list of paging
   * @param {number} [page=1] - current page number
   * @param {number} [row=5] - rows per page
   * @return {Object<{ data: ListColl[], message: string }>}
   *
   * @example GET /crud-operations/pagination?page=${page}&row=${row}
   */

  /**
   * @swagger
   * /api/pems/meterProductionLine/pagination:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: page
   *         description: pagination's pageindex.
   *         in: query
   *         required: true
   *         type: number
   *       - name: row
   *         description: pagination's row count.
   *         in: query
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: meterProductionLine/pagination
   *         schema:
   *           type: object
   */
  router.get(
    '/pagination',
    catchAsync(async (req, res) => {
      const { parentId, cDesc } = req.query;

      const filter = { AND: {} };

      if (parentId) filter.AND = { ...filter.AND, parentId: Number(parentId) };
      if (cDesc) filter.AND = { ...filter.AND, cDesc: { contains: cDesc } };

      const page = Number(req.query.page) || 1;
      const row = Number(req.query.row) || 5;
      const count = await prisma.Pems_MeterProductionLine.count({
        where: filter,
      });

      if (count != null && count > 0) {
        const rstdata = await prisma.Pems_MeterProductionLine.findMany({
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
          productLine: true,
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

controller.prefix = '/pems/meterProductionLine';

export default controller;
