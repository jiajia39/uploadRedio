import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import service from './service';
import prisma from '../core/prisma';

const controller = (() => {
  const router = Router();

  /**
   * @name list - get a list
   * @param {string} [_id] - get a item by ID in list
   * @param {string} [text] - search a text in list
   * @return {Object<{ data: ListColl[], message: string }>}
   *
   * @example GET /crud-operations
   * @example GET /crud-operations?_id=${_id}
   * @example GET /crud-operations?text=${text}
   */

  /**
   * @swagger
   * /api/sys/sysorg/getall:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: sysorg get all
   *     tags: [sysorg]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: _id
   *         description: sysorg's id.
   *         in: query
   *         type: string
   *       - name: cOrgCode
   *         description: sysorg's cOrgCode.
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: sysmenus
   *         schema:
   *           type: object
   */
  router.get('/getall', async (req, res) => {
    const { cGuid, cOrgCode } = req.query;

    const filter = { OR: [] };

    if (cGuid) filter.OR.push({ cGuid });
    if (cOrgCode) filter.OR.push({ cOrgCode });

    if (filter.OR.length < 1) {
      const data = await prisma.Sys_Org.findMany();
      res.json(data);
    } else {
      const data = await prisma.Sys_Org.findMany({
        where: filter,
      });
      res.json(data);
    }
  });

  /**
   * @swagger
   * /api/sys/sysorg/getbyparentid:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: sysorg getbyparentid
   *     tags: [sysorg]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cParentGuid
   *         description: sysorg's id.
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: sysmenus
   *         schema:
   *           type: object
   */
  router.get('/getbyparentid', async (req, res) => {
    const { cParentGuid } = req.query;

    const find = {};

    if (cParentGuid) find.cParentGuid = cParentGuid;

    const data = await prisma.Sys_Org.findMany({
      where: find,
    });

    res.json({ data, message: 'Data obtained.' });
  });

  /**
   * @swagger
   * /api/sys/sysorg/gettreenodes:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: sysorg get all
   *     tags: [sysorg]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: sysmenus
   *         schema:
   *           type: object
   */
  router.get('/gettreenodes', async (req, res) => {
    const data = await prisma.Sys_Org.findMany();

    const treeOption = {
      enable: true, // 是否开启转tree插件数据
      keyField: 'key', // 标识字段名称
      valueField: 'value', // 值字段名称
      titleField: 'title', // 标题字段名称

      keyFieldBind: 'cGuid', // 标识字段绑定字段名称
      valueFieldBind: 'cGuid', // 值字段名称绑定字段名称
      titleFieldBind: 'cOrgName', // 标题字段名称绑定字段名称
    };
    const treeData = service.toTreeByRecursion(
      data,
      'cGuid',
      'cParentGuid',
      null,
      'children',
      treeOption,
    );
    res.json({ treeData, message: 'Data obtained.' });
  });

  /**
   * @swagger
   * /api/sys/sysorg/gettreenodes:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: sysorg get all
   *     tags: [sysorg]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: sysmenus
   *         schema:
   *           type: object
   */
  router.get('/getcompanytreenodes', async (req, res) => {
    const data = await prisma.Sys_Org.findMany({
      where: {
        OR: [
          {
            cOrgType: '公司',
          },
          { cOrgType: '工厂' },
        ],
      },
    });

    const treeOption = {
      enable: true, // 是否开启转tree插件数据
      keyField: 'key', // 标识字段名称
      valueField: 'value', // 值字段名称
      titleField: 'title', // 标题字段名称

      keyFieldBind: 'cGuid', // 标识字段绑定字段名称
      valueFieldBind: 'cGuid', // 值字段名称绑定字段名称
      titleFieldBind: 'cOrgName', // 标题字段名称绑定字段名称
    };
    const treeData = service.toTreeByRecursion(
      data,
      'cGuid',
      'cParentGuid',
      null,
      'children',
      treeOption,
    );
    res.json({ treeData, message: 'Data obtained.' });
  });

  /**
   * @swagger
   * /api/sys/sysorg/item/{id}:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sysorg]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: sysorg's id.
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: login
   *         schema:
   *           type: object
   */
  router.get('/item/:cGuid', async (req, res) => {
    const data = await prisma.Sys_Org.findFirst({
      where: { cGuid: req.params.cGuid },
    });
    res.json({ data, message: 'Data obtained.' });
  });

  /**
   * @swagger
   * /api/sys/sysorg/count:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Welcome to swagger-jsdoc!
   *     tags: [sysorg]
   *     responses:
   *       200:
   *         description: Returns a mysterious string.
   */
  router.get('/count', async (req, res) => {
    const data = await prisma.Sys_Org.count();
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
   * /api/sys/sysorg/pagination:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sysorg]
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
   *         description: sysorg/pagination
   *         schema:
   *           type: object
   */
  router.get('/pagination', async (req, res) => {
    const page = Number(req.query.page) || 1;
    const row = Number(req.query.row) || 5;
    const count = await prisma.Sys_Org.count();

    if (count != null && count > 0) {
      const rstdata = await prisma.Sys_Org.findMany({
        skip: (page - 1) * row,
        take: row,
        orderBy: {
          cOrgCode: 'asc',
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
   * /api/sys/sysorg/add:
   *   post:
   *     security:
   *       - Authorization: []
   *     description: SysOrg Add
   *     tags: [sysorg]
   *     produces:
   *       - application/json
   *     requestBody:    #编写参数接收体
   *          required: true  #是否必传
   *          content:
   *              application/json:
   *                  schema:     #参数备注
   *                      type: object    #参数类型
   *                      properties:
   *                          cOrgCode:
   *                                  type: string    #参数类型
   *                                  description: cOrgCode     #参数描述
   *                          cOrgName:
   *                                  type: string    #参数类型
   *                                  description: cOrgName     #参数描述
   *                          cOrgType:
   *                                  type: string    #参数类型
   *                                  description: cOrgType     #参数描述
   *                          cParentGuid:
   *                                  type: string    #参数类型
   *                                  description: cParentGuid     #参数描述
   *                          cParentOrgCode:
   *                                  type: string    #参数类型
   *                                  description: cParentOrgCode     #参数描述
   *                          cParentOrgName:
   *                                  type: string    #参数类型
   *                                  description: cParentOrgName     #参数描述
   *                          cHead:
   *                                  type: string    #参数类型
   *                                  description: cHead     #参数描述
   *                          cHeadUserGuid:
   *                                  type: string    #参数类型
   *                                  description: cHeadUserGuid     #参数描述
   *                          cHeadUserId:
   *                                  type: string    #参数类型
   *                                  description: cHeadUserId     #参数描述
   *                          iStatus:
   *                                  type: integer    #参数类型
   *                                  description: iStatus     #参数描述
   *
   *
   *                  example:        #请求参数样例。
   *                      cOrgCode: ""
   *                      cOrgName: ""
   *                      cOrgType: ""
   *                      cParentGuid: ""
   *                      cParentOrgCode: ""
   *                      cParentOrgName: ""
   *                      cHead: ""
   *                      cHeadUserGuid: ""
   *                      iStatus: 1
   *
   *     responses:
   *       200:
   *         description: add sysorg
   *         schema:
   *           type: object
   */
  router.post('/add', async (req, res) => {
    if (!req.body.cOrgCode) {
      res.status(400).json({ isok: false, message: 'Please pass cOrgCode.' });
      return;
    }
    req.body.cGuid = uuidv4();
    await prisma.Sys_Org.create({ data: req.body });

    res.json({ isok: true, message: 'SysOrg saved' });
  });

  /**
   * @name update - update a item
   * @return {Object<{ message: string }>}
   *
   * @example PUT /crud-operations/${id}
   */

  /**
   * @swagger
   * /api/sys/sysorg/item/{cGuid}:
   *   put:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sysorg]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cGuid
   *         description: sysorg's cGuid.
   *         in: path
   *         required: true
   *         type: string
   *     requestBody:    #编写参数接收体
   *          required: true  #是否必传
   *          content:
   *              application/json:
   *                  schema:     #参数备注
   *                      type: object    #参数类型
   *                      properties:
   *                          text:
   *                                  type: string    #参数类型
   *                                  description: text     #参数描述
   *                          link:
   *                                  type: string    #参数类型
   *                                  description: link     #参数描述
   *                          i18n:
   *                                  type: string    #参数类型
   *                                  description: i18n     #参数描述
   *                          icon:
   *                                  type: string    #参数类型
   *                                  description: icon     #参数描述
   *                          memo:
   *                                  type: string    #参数类型
   *                                  description: memo     #参数描述
   *                          status:
   *                                  type: string    #参数类型
   *                                  description: status     #参数描述
   *                          sort:
   *                                  type: string    #参数类型
   *                                  description: sort     #参数描述
   *                          cParentGuid:
   *                                  type: string    #参数类型
   *                                  description: cParentGuid     #参数描述
   *                          createdtime:
   *                                  type: Date    #参数类型
   *                                  description: createdtime     #参数描述
   *
   *
   *
   *                  example:        #请求参数样例。
   *                      cGuid: "string"
   *                      text: "username"
   *                      link: "username"
   *                      i18n: "username"
   *                      icon: "username"
   *                      memo: "username"
   *                      status: 1
   *                      sort: 1
   *                      cParentGuid: "username"
   *                      createdtime: "username"
   *     responses:
   *       200:
   *         description: login
   *         schema:
   *           type: object
   */
  router.put('/item/:cGuid', async (req, res) => {
    // console.log(req.body);
    if (req.body.cParentGuid !== undefined && req.body.cParentGuid !== '') {
      const data = await prisma.Sys_Org.findUnique({
        where: req.body.cParentGuid,
      }).exec();
      req.body.cParentOrgCode = data.cOrgCode;
      req.body.cParentOrgName = data.cOrgName;
    }

    const message = await prisma.Sys_Org.update({
      where: { cGuid: req.params.cGuid },
      data: req.body,
    }).then(() => 'List updated');

    res.json({ isok: true, message });
  });

  /**
   * @name delete - remove a item
   * @return {Object<{ message: string }>}
   *
   * @example DELETE /crud-operations/${id}
   */

  /**
   * @swagger
   * /api/sys/sysorg/delete/{cGuid}:
   *   delete:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sysorg]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cGuid
   *         description: sysorg's id.
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: login
   *         schema:
   *           type: object
   */
  router.delete('/delete/:cGuid', async (req, res) => {
    const message = await prisma.Sys_Org.delete({
      where: {
        cGuid: req.params.cGuid,
      },
    }).then(() => 'SysOrg deleted');

    res.json({ message });
  });

  /**
   * @name delete-multiple - remove selected items
   * @return {Object<{ message: string }>}
   *
   * @example DELETE /crud-operations { selected: [${id}, ${id}, ${id}...] }
   */

  /**
   * @swagger
   * /api/sys/sysorg/deleteids:
   *   delete:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sysorg]
   *     produces:
   *       - application/json
   *     requestBody:    #编写参数接收体
   *          required: true  #是否必传
   *          content:
   *              application/json:
   *                  schema:     #参数备注
   *                    type: object    #参数类型
   *                    properties:
   *                      selected:
   *                        type: array
   *                        items:
   *                          type: string
   *                  example:        #请求参数样例。
   *                      {'selected':['628c76628470902aec4182eb','628c76628470902aec4182e1']}
   *     responses:
   *       200:
   *         description: login
   *         schema:
   *           type: object
   */
  router.delete('/deleteids', async (req, res) => {
    const { selected } = req.body;
    const message = await prisma.Sys_Org.delete({
      where: { cGuid: { hasSome: selected } },
    }).then(() => 'SysOrg deleted');

    res.json({ message });
  });

  return router;
})();

controller.prefix = '/sys/sysorg';

export default controller;
