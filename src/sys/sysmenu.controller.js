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
   * /api/sys/sysmenu/getall:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: sysmenu get all
   *     tags: [sysmenu]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: _id
   *         description: sysmenu's id.
   *         in: query
   *         type: string
   *       - name: text
   *         description: sysmenu's text.
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: sysmenus
   *         schema:
   *           type: object
   */
  router.get('/getall', async (req, res) => {
    const data = await prisma.Sys_Menu.findMany();
    res.json({ data, message: 'Data obtained.' });
  });

  /**
   * @swagger
   * /api/sys/sysmenu/getmenuparent:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: sysorg get all
   *     tags: [sysmenu]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: role
   *         description: user's role.
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: sysmenus
   *         schema:
   *           type: object
   */
  router.get('/getmenuparent', async (req, res) => {
    const find = { cParentGuid: null };
    const data = await prisma.Sys_Menu.findMany({
      where: find,
    });

    res.json(data);
  });

  /**
   * @swagger
   * /api/sys/sysmenu/gettreenodes:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: sysorg get all
   *     tags: [sysmenu]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: sysmenus
   *         schema:
   *           type: object
   */
  router.get('/gettreenodes', async (req, res) => {
    const data = await prisma.Sys_Menu.findMany({
      orderBy: {
        sort: 'asc',
      },
    });

    const treeOption = {
      enable: true, // 是否开启转tree插件数据
      keyField: 'key', // 标识字段名称
      valueField: 'value', // 值字段名称
      titleField: 'title', // 标题字段名称

      keyFieldBind: 'cGuid', // 标识字段绑定字段名称
      valueFieldBind: 'cGuid', // 值字段名称绑定字段名称
      titleFieldBind: 'text', // 标题字段名称绑定字段名称
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
   * /api/sys/sysmenu/item/{id}:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sysmenu]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: sysmenu's id.
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
    console.log(req.params.id);
    const data = await prisma.Sys_Menu.findUnique({
      where: {
        cGuid: req.params.id,
      },
    });
    res.json({ data, message: 'Data obtained.' });
  });

  /**
   * @swagger
   * /api/sys/sysmenu/count:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Welcome to swagger-jsdoc!
   *     tags: [sysmenu]
   *     responses:
   *       200:
   *         description: Returns a mysterious string.
   */
  router.get('/count', async (req, res) => {
    const rst = await prisma.Sys_Menu.count();
    if (rst != null && rst > 0) {
      res.json({ data: rst, message: 'Data obtained.' });
    } else {
      res.json({ data: 0, message: 'DB Error.' });
    }
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
   * /api/sys/sysmenu/pagination:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sysmenu]
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
   *         description: sysmenu/pagination
   *         schema:
   *           type: object
   */
  router.get('/pagination', async (req, res) => {
    const { ctext, parentid } = req.query;

    const filter = { AND: {} };

    if (ctext) filter.AND = { ...filter.AND, text: ctext };
    if (parentid) filter.AND = { ...filter.AND, cParentGuid: parentid };

    const page = Number(req.query.page) || 1;
    const row = Number(req.query.row) || 5;
    const count = await prisma.Sys_Menu.count({
      where: filter,
    });

    if (count != null && count > 0) {
      const rstdata = await prisma.Sys_Menu.findMany({
        where: filter,
        skip: (page - 1) * row,
        take: row,
        orderBy: {
          sort: 'asc',
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
   * /api/sys/sysmenu/add:
   *   post:
   *     security:
   *       - Authorization: []
   *     description: SysMenu Add
   *     tags: [sysmenu]
   *     produces:
   *       - application/json
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
   *                          dAddTime:
   *                                  type: Date    #参数类型
   *                                  description: dAddTime     #参数描述
   *
   *
   *
   *                  example:        #请求参数样例。
   *                      text: "username"
   *                      link: "username"
   *                      i18n: "username"
   *                      icon: "username"
   *                      memo: "username"
   *                      status: 1
   *                      sort: 1
   *                      cParentGuid: "cParentGuid"
   *                      dAddTime: "username"
   *     responses:
   *       200:
   *         description: add sysmenu
   *         schema:
   *           type: object
   */
  router.post('/add', async (req, res) => {
    if (!req.body.text) {
      res.status(400).json({ message: 'Please pass text.' });
    }
    req.body.cGuid = uuidv4();
    req.body.dAddTime = new Date();
    await prisma.Sys_Menu.create({
      data: req.body,
    });

    res.json({ isok: true, message: 'SysMenu saved' });
  });

  /**
   * @name update - update a item
   * @return {Object<{ message: string }>}
   *
   * @example PUT /crud-operations/${id}
   */

  /**
   * @swagger
   * /api/sys/sysmenu/item/{id}:
   *   put:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sysmenu]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cGuid
   *         description: sysmenu's id.
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
    const message = await prisma.Sys_Menu.update({
      where: { cGuid: req.params.cGuid },
      data: req.body,
    }).then(() => 'List updated');
    const { cGuid, ...params } = req.body;

    await prisma.Sys_RoleMenu.updateMany({
      where: { cMenuGuid: req.params.cGuid },
      data: params,
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
   * /api/sys/sysmenu/delete/{id}:
   *   delete:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sysmenu]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cGuid
   *         description: sysmenu's id.
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
    const message = await prisma.Sys_Menu.delete({
      where: { cGuid: req.params.cGuid },
    }).then(() => 'SysMenu deleted');

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
   * /api/sys/sysmenu/deleteids:
   *   delete:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sysmenu]
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
    const message = await prisma.Sys_Menu.delete({
      where: { cGuid: { hasSome: selected } },
    }).then(() => 'SysMenu deleted');

    res.json({ message });
  });

  return router;
})();

controller.prefix = '/sys/sysmenu';

export default controller;
