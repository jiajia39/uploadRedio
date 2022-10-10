import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import service from './service';
import prisma from '../core/prisma';

const controller = (() => {
  const router = Router();

  /**
   * @swagger
   * /api/sys/syslog/getall:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: syslog get all
   *     tags: [syslog]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: _id
   *         description: syslog's id.
   *         in: query
   *         type: string
   *       - name: cOrgCode
   *         description: syslog's cOrgCode.
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: sysmenus
   *         schema:
   *           type: object
   */
  router.get('/getall', async (req, res) => {
    const { cGuid, cModule } = req.query;

    const filter = { OR: [] };

    if (cGuid) filter.OR.push({ cGuid });
    if (cModule) filter.OR.push({ cModule });

    if (filter.OR.length < 1) {
      const data = await prisma.Sys_Log.findMany();
      res.json(data);
    } else {
      const data = await prisma.Sys_Log.findMany({
        where: filter,
      });
      res.json(data);
    }
  });

  /**
   * @swagger
   * /api/sys/syslog/item/{id}:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [syslog]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: syslog's id.
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
    const data = await prisma.Sys_Log.findFirst({
      where: { cGuid: req.params.cGuid },
    });
    res.json({ data, message: 'Data obtained.' });
  });

  /**
   * @swagger
   * /api/sys/syslog/count:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Welcome to swagger-jsdoc!
   *     tags: [syslog]
   *     responses:
   *       200:
   *         description: Returns a mysterious string.
   */
  router.get('/count', async (req, res) => {
    const data = await prisma.Sys_Log.count();
    res.json({ data, message: 'Data obtained.' });
  });

  /**
   * @swagger
   * /api/sys/syslog/pagination:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [syslog]
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
   *         description: syslog/pagination
   *         schema:
   *           type: object
   */
  router.get('/pagination', async (req, res) => {
    const page = Number(req.query.page) || 1;
    const row = Number(req.query.row) || 5;
    const count = await prisma.Sys_Log.count();

    if (count != null && count > 0) {
      const rstdata = await prisma.Sys_Log.findMany({
        skip: (page - 1) * row,
        take: row,
        orderBy: {
          dTimeStamp: 'desc',
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
   * /api/sys/syslog/add:
   *   post:
   *     security:
   *       - Authorization: []
   *     description: SysLog Add
   *     tags: [syslog]
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
   *         description: add syslog
   *         schema:
   *           type: object
   */
  router.post('/add', async (req, res) => {
    if (!req.body.cModule) {
      res.status(400).json({ isok: false, message: 'Please pass cModule.' });
      return;
    }
    req.body.cGuid = uuidv4();
    await prisma.Sys_Log.create({ data: req.body });

    res.json({ isok: true, message: 'SysLog saved' });
  });

  /**
   * @swagger
   * /api/sys/syslog/item/{cGuid}:
   *   put:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [syslog]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cGuid
   *         description: syslog's cGuid.
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
    const message = await prisma.Sys_Log.update({
      where: { cGuid: req.params.cGuid },
      data: req.body,
    }).then(() => 'List updated');

    res.json({ isok: true, message });
  });

  /**
   * @swagger
   * /api/sys/syslog/delete/{cGuid}:
   *   delete:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [syslog]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cGuid
   *         description: syslog's id.
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
    const message = await prisma.Sys_Log.delete({
      where: {
        cGuid: req.params.cGuid,
      },
    }).then(() => 'SysLog deleted');

    res.json({ message });
  });

  /**
   * @swagger
   * /api/sys/syslog/deleteids:
   *   delete:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [syslog]
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
    const message = await prisma.Sys_Log.delete({
      where: { cGuid: { hasSome: selected } },
    }).then(() => 'SysLog deleted');

    res.json({ message });
  });

  return router;
})();

controller.prefix = '/sys/syslog';

export default controller;
