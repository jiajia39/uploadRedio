import { Router } from 'express';
import service from './../sys/service';
import prisma from '../core/prisma';

const controller = (() => {
    const router = Router();
    
  /**
   * @swagger
   * /api/pems/meterPosition/getall:
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
   *         description: meter positions and relevant meters
   *         schema:
   *           type: object
   */
  router.get('/getall', async (req, res) => {
    const { id, cType } = req.query;
    const filter = { OR: [] };

    const select = {
      id: true,
      cName: true,
      parentId: true,
      dAddTime: true,
      Pems_Meter: {
        select: {
          cName: true,
          cType: true,
          cDesc: true,
          dAddTime: true,
        }
      }
    };

    if (id) filter.OR.push({ id: parseInt(id) });
    if (cType) filter.OR.push({ cType });

    if (filter.OR.length < 1) {
      const data = await prisma.Pems_MeterPosition.findMany({ select });
      res.json(data);
    } else {
      const data = await prisma.Pems_MeterPosition.findMany({
        where: filter,
        select,
      });
      res.json(data);
    }
  });

  /**
   * @swagger
   * /api/pems/meterPosition/getbyparentid:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: meter position getbyparentid
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
  router.get('/getbyparentid', async (req, res) => {
    const { parentId } = req.query;

    const find = {};

    if (parentId) find.parentId = parentId;

    const data = await prisma.Pems_MeterPosition.findMany({
      where: find,
    });

    res.json({ data, message: 'Data obtained.' });
  });

  /**
   * @swagger
   * /api/pems/meterPosition/gettreenodes:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: get treenodes for meter position
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
   *         description: get treenodes for meter position
   *         schema:
   *           type: object
   */
  router.get('/gettreenodes', async (req, res) => {
    const data = await prisma.Pems_MeterPosition.findMany();
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
    res.json({ treeData, message: 'Data obtained.' });
  });



  /**
   * @swagger
   * /api/pems/meterPosition/item/{id}:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: meter position's id.
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: login
   *         schema:
   *           type: object
   */
  router.get('/item/:id', async (req, res) => {
    const data = await prisma.Pems_MeterPosition.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ data, message: 'Data obtained.' });
  });

  /**
   * @swagger
   * /api/pems/meterPosition/count:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Get count for meter positions!
   *     tags: [pems]
   *     responses:
   *       200:
   *         description: Returns a mysterious string.
   */
  router.get('/count', async (req, res) => {
    const data = await prisma.Pems_MeterPosition.count();
    res.json({ data, message: 'Data obtained.' });
  });

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
   * /api/pems/meterPosition/pagination:
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
   *         description: meterPosition/pagination
   *         schema:
   *           type: object
   */
  router.get('/pagination', async (req, res) => {
    const page = Number(req.query.page) || 1;
    const row = Number(req.query.row) || 5;
    const count = await prisma.Pems_MeterPosition.count();

    if (count != null && count > 0) {
      const rstdata = await prisma.Pems_MeterPosition.findMany({
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

  /**
   * @swagger
   * /api/pems/meterPosition/count:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Get count for meter positions!
   *     tags: [pems]
   *     responses:
   *       200:
   *         description: Returns a mysterious string.
   */
  router.get('/count', async (req, res) => {
    const data = await prisma.Pems_MeterPosition.count();
    res.json({ data, message: 'Data obtained.' });
  });

  return router;

})();

controller.prefix = '/pems/meterPosition';

export default controller;
