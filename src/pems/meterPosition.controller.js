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
   *     description: meterPosition get all
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: meterPosition's id.
   *         in: query
   *         type: int
   *       - name: cType
   *         description: meterPosition's cType.
   *         in: query
   *         type: int
   *     responses:
   *       200:
   *         description: sysmenus
   *         schema:
   *           type: object
   */
  router.get('/getall', async (req, res) => {
    const { id, cType } = req.query;
    const filter = { OR: [] };

    if (id) filter.OR.push({ id });
    if (cType) filter.OR.push({ cType });

    if (filter.OR.length < 1) {
      const data = await prisma.Pems_MeterPosition.findMany();
      res.json(data);
    } else {
      const data = await prisma.Pems_MeterPosition.findMany({
        where: filter,
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

  return router;

})();

controller.prefix = '/pems/meterPosition';

export default controller;
