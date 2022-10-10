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
   * /api/sys/sysrolemenu/getall:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: sysrolemenu get all
   *     tags: [sysrolemenu]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: _id
   *         description: sysrolemenu's id.
   *         in: query
   *         type: string
   *       - name: cRoleCode
   *         description: sysrolemenu's cRoleCode.
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: sysmenus
   *         schema:
   *           type: object
   */
  router.get('/getall', async (req, res) => {
    const { cGuid, cRoleCode } = req.query;

    const filter = { OR: [] };

    if (cGuid) filter.OR.push({ cGuid });
    if (cRoleCode) filter.OR.push({ cRoleCode });

    if (filter.OR.length < 1) {
      const data = await prisma.Sys_RoleMenu.findMany();

      res.json({ data, message: 'Data obtained.' });
    } else {
      const data = await prisma.Sys_RoleMenu.findMany({ where: filter });

      res.json({ data, message: 'Data obtained.' });
    }
  });

  /**
   * @swagger
   * /api/sys/sysrolemenu/gettreenodesbyrole:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: sysrolemenu gettreenodesbyrole
   *     tags: [sysrolemenu]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cRoleGuid
   *         description: role's id.
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: sysmenus
   *         schema:
   *           type: object
   */
  router.get('/gettreenodesbyrole', async (req, res) => {
    const find = {};
    find.cRoleGuid = req.query.cRoleGuid;
    const data = await prisma.Sys_RoleMenu.findMany({
      where: find,
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
    const treeData = service.toSysRoleMenuTreeByRecursion(
      data,
      'cMenuGuid',
      'cParentGuid',
      null,
      'children',
      treeOption,
    );
    res.json({ treeData, message: 'Data obtained.' });
  });

  /**
   * @swagger
   * /api/sys/sysrolemenu/item/{cGuid}:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sysrolemenu]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cGuid
   *         description: sysrolemenu's id.
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
    const data = await prisma.Sys_RoleMenu.find({ cGuid: req.params.cGuid }).exec();
    res.json({ data, message: 'Data obtained.' });
  });

  /**
   * @swagger
   * /api/sys/sysrolemenu/count:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Welcome to swagger-jsdoc!
   *     tags: [sysrolemenu]
   *     responses:
   *       200:
   *         description: Returns a mysterious string.
   */
  router.get('/count', async (req, res) => {
    const data = await prisma.Sys_RoleMenu.count();
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
   * /api/sys/sysrolemenu/pagination:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sysrolemenu]
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
   *         description: sysrolemenu/pagination
   *         schema:
   *           type: object
   */
  router.get('/pagination', async (req, res) => {
    const page = Number(req.query.page) || 1;
    const row = Number(req.query.row) || 5;
    const count = await prisma.Sys_RoleMenu.count();
    if (count != null && count > 0) {
      const rstdata = await prisma.Sys_RoleMenu.findMany({
        skip: (page - 1) * row,
        take: row,
        orderBy: {
          cRoleCode: 'asc',
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
   * /api/sys/sysrolemenu/add:
   *   post:
   *     security:
   *       - Authorization: []
   *     description: SysRoleMenu Add
   *     tags: [sysrolemenu]
   *     produces:
   *       - application/json
   *     requestBody:    #编写参数接收体
   *          required: true  #是否必传
   *          content:
   *              application/json:
   *                  schema:     #参数备注
   *                      type: object    #参数类型
   *                      properties:
   *                          cMenuGuid:
   *                                  type: string    #参数类型
   *                                  description: cMenuGuid     #参数描述
   *                          cRoleGuid:
   *                                  type: string    #参数类型
   *                                  description: cRoleGuid     #参数描述
   *                          bSelect:
   *                                  type: string    #参数类型
   *                                  description: bSelect     #参数描述
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
   *                                  type: integer    #参数类型
   *                                  description: status     #参数描述
   *                          sort:
   *                                  type: integer    #参数类型
   *                                  description: sort     #参数描述
   *                          cParentGuid:
   *                                  type: string    #参数类型
   *                                  description: cParentGuid     #参数描述
   *
   *                  example:        #请求参数样例。
   *                      cMenuGuid: ""
   *                      cRoleGuid: ""
   *                      bSelect: ""
   *                      text: ""
   *                      link: ""
   *                      i18n: ""
   *                      icon: ""
   *                      status: ""
   *                      sort: 1
   *                      cParentGuid: ""
   *
   *     responses:
   *       200:
   *         description: add sysrolemenu
   *         schema:
   *           type: object
   */
  router.post('/add', async (req, res) => {
    if (!req.body.cRoleCode) {
      res.status(400).json({ message: 'Please pass text.' });
    }
    req.body.cGuid = uuidv4();
    const list = await prisma.Sys_RoleMenu.create({ data: req.body });
    const message = await list.save().then(() => 'SysRoleMenu saved');

    res.json({ message });
  });

  /**
   * @swagger
   * /api/sys/sysrolemenu/syncsysmenubyrole:
   *   delete:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sysrolemenu]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cRoleGuid
   *         description: role's cRoleGuid.
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: login
   *         schema:
   *           type: object
   */
  router.get('/syncsysmenubyrole', async (req, res) => {
    if (!req.query.cRoleGuid) {
      res.status(400).json({ message: 'Please pass cRoleGuid.' });
    }
    const rst = await prisma.$queryRaw`exec usp_Sys_RoleMenu_InitSync ${req.query.cRoleGuid}`;

    if (rst != null && rst.length > 0) {
      if (rst[0].isOK) {
        res.status(200).json({ isok: true, message: 'Sync Success' });
      } else {
        res.status(200).json({ isok: false, message: rst[0].cErrorMessage });
      }
    } else {
      res.status(200).json({ isok: false, message: 'DB Error' });
    }
  });

  /**
   * @name update - update a item
   * @return {Object<{ message: string }>}
   *
   * @example PUT /crud-operations/${id}
   */

  /**
   * @swagger
   * /api/sys/sysrolemenu/item/{cGuid}:
   *   put:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sysrolemenu]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cGuid
   *         description: sysrolemenu's id.
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
   *                      _id: "string"
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
    console.log(req.body);
    const message = prisma.$queryRaw`exec usp_Sys_RoleMenu_UpdateWithcRoleMenuGuid ${req.body.cGuid},${req.body.bSelect}`.then(
      () => {
        res.json({ message });
      },
    );
  });

  /**
   * @name delete - remove a item
   * @return {Object<{ message: string }>}
   *
   * @example DELETE /crud-operations/${id}
   */

  /**
   * @swagger
   * /api/sys/sysrolemenu/delete/{cGuid}:
   *   delete:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sysrolemenu]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cGuid
   *         description: sysrolemenu's id.
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
    const message = await prisma.Sys_RoleMenu.delete({
      where: { cGuid: req.params.cGuid },
    }).then(() => 'SysRoleMenu deleted');

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
   * /api/sys/sysrolemenu/deleteids:
   *   delete:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sysrolemenu]
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
    const message = await prisma.Sys_RoleMenu.delete({
      where: { cGuid: { hasSome: selected } },
    }).then(() => 'SysRole deleted');

    res.json({ message });
  });

  return router;
})();

controller.prefix = '/sys/sysrolemenu';

export default controller;
