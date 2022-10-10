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
   * /api/sys/sysrole/getall:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: sysrole get all
   *     tags: [sysrole]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cGuid
   *         description: sysrole's id.
   *         in: query
   *         type: string
   *       - name: cRoleCode
   *         description: sysrole's cRoleCode.
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
      const data = await prisma.Sys_Role.findMany();
      res.json(data);
    } else {
      const data = await prisma.Sys_Role.findMany({
        where: filter,
      });
      res.json(data);
    }
  });

  /**
   * @swagger
   * /api/sys/sysrole/gettreenodes:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: sysrole get all
   *     tags: [sysrole]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: sysmenus
   *         schema:
   *           type: object
   */
  router.get('/gettreenodes', async (req, res) => {
    const data = await prisma.Sys_Role.findMany();

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
      '',
      'children',
      treeOption,
    );
    res.json({ treeData, message: 'Data obtained.' });
  });

  /**
   * @swagger
   * /api/sys/sysrole/item/{cGuid}:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sysrole]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cGuid
   *         description: sysrole's id.
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
    const data = await prisma.Sys_Role.findUnique({ cGuid: req.params.cGuid }).exec();
    res.json({ data, message: 'Data obtained.' });
  });

  /**
   * @swagger
   * /api/sys/sysrole/count:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Welcome to swagger-jsdoc!
   *     tags: [sysrole]
   *     responses:
   *       200:
   *         description: Returns a mysterious string.
   */
  router.get('/count', async (req, res) => {
    const data = await prisma.Sys_Role.count();
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
   * /api/sys/sysrole/pagination:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sysrole]
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
   *         description: sysrole/pagination
   *         schema:
   *           type: object
   */
  router.get('/pagination', async (req, res) => {
    const page = Number(req.query.page) || 1;
    const row = Number(req.query.row) || 5;
    const count = await prisma.Sys_Role.count();

    if (count != null && count > 0) {
      const rstdata = await prisma.Sys_Role.findMany({
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
   * /api/sys/sysrole/add:
   *   post:
   *     security:
   *       - Authorization: []
   *     description: SysRole Add
   *     tags: [sysrole]
   *     produces:
   *       - application/json
   *     requestBody:    #编写参数接收体
   *          required: true  #是否必传
   *          content:
   *              application/json:
   *                  schema:     #参数备注
   *                      type: object    #参数类型
   *                      properties:
   *                          cRoleCode:
   *                                  type: string    #参数类型
   *                                  description: cRoleCode     #参数描述
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
   *                      cRoleCode: ""
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
   *         description: add sysrole
   *         schema:
   *           type: object
   */
  router.post('/add', async (req, res) => {
    if (!req.body.cRoleCode) {
      res.status(400).json({ message: 'Please pass text.' });
    }
    req.body.cGuid = uuidv4();
    await prisma.Sys_Role.create({ data: req.body });

    res.json({ isok: true, message: 'SysRole saved' });
  });

  /**
   * @name update - update a item
   * @return {Object<{ message: string }>}
   *
   * @example PUT /crud-operations/${id}
   */

  /**
   * @swagger
   * /api/sys/sysrole/item/{cGuid}:
   *   put:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sysrole]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cGuid
   *         description: sysrole's id.
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
    const message = await prisma.Sys_Role.update({
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
   * /api/sys/sysrole/delete/{cGuid}:
   *   delete:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sysrole]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cGuid
   *         description: sysrole's id.
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
    const message = await prisma.Sys_Role.delete({
      where: { cGuid: req.params.cGuid },
    }).then(() => 'SysRole deleted');

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
   * /api/sys/sysrole/deleteids:
   *   delete:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sysrole]
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
    const message = await prisma.Sys_Role.delete({
      where: { cGuid: { hasSome: selected } },
    }).then(() => 'SysRole deleted');

    res.json({ message });
  });

  return router;
})();

controller.prefix = '/sys/sysrole';

export default controller;
