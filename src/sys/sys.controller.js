import { Router } from 'express';
import parser from 'ua-parser-js';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../core/prisma';

const controller = (() => {
  const router = Router();

  /**
   * @swagger
   * /api/sys/user/getall:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: sysloginlog get all
   *     tags: [sys]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: sysloginlog
   *         schema:
   *           type: object
   */
  router.get('/user/getall', async (req, res) => {
    const data = await prisma.Sys_User.findMany();
    res.json(data);
  });

  /**
   * @swagger
   * /api/sys/user/pagination:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sys]
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
   *         description: user/pagination
   *         schema:
   *           type: object
   */
  router.get('/user/pagination', async (req, res) => {
    const page = Number(req.query.page) || 1;
    const row = Number(req.query.row) || 5;
    const count = await prisma.Sys_User.count();
    if (count != null && count > 0) {
      const rstdata = await prisma.Sys_User.findMany({
        skip: (page - 1) * row,
        take: row,
        orderBy: {
          userid: 'asc',
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
   * /api/sys/user/item/{cGuid}:
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
  router.put('/user/item/:cGuid', async (req, res) => {
    const message = await prisma.Sys_User.update({
      where: { cGuid: req.params.cGuid },
      data: req.body,
    }).then(() => 'User updated');

    res.json({ message });
  });

  /**
   * @swagger
   * /api/sys/loginlog/getall:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: sysloginlog get all
   *     tags: [sys]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: _id
   *         description: sysloginlog's id.
   *         in: query
   *         type: string
   *       - name: cRoleCode
   *         description: sysloginlog's cRoleCode.
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: sysloginlog
   *         schema:
   *           type: object
   */
  router.get('/loginlog/getall', async (req, res) => {
    const { cGuid, userid } = req.query;
    const filter = { OR: [] };

    if (cGuid) filter.OR.push({ cGuid });
    if (userid) filter.OR.push({ userid });

    if (filter.OR.length < 1) {
      const data = await prisma.Sys_Login_Log.findMany();

      res.json({ data, message: 'Data obtained.' });
    } else {
      const data = await prisma.Sys_Login_Log.findMany({ where: filter });

      res.json({ data, message: 'Data obtained.' });
    }
  });
  /**
   * @swagger
   * /api/sys/sysloginlog/count:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Welcome to swagger-jsdoc!
   *     tags: [sys]
   *     responses:
   *       200:
   *         description: Returns a mysterious string.
   */
  router.get('/sysloginlog/count', async (req, res) => {
    const data = await prisma.Sys_Login_Log.count();
    res.json({ data, message: 'Data obtained.' });
  });

  /**
   * @swagger
   * /api/sys/sysloginlog/pagination:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sys]
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
   *         description: sysloginlog/pagination
   *         schema:
   *           type: object
   */
  router.get('/sysloginlog/pagination', async (req, res) => {
    const page = Number(req.query.page) || 1;
    const row = Number(req.query.row) || 5;
    const count = await prisma.Sys_Login_Log.count();
    if (count != null && count > 0) {
      const rstdata = await prisma.Sys_Login_Log.findMany({
        skip: (page - 1) * row,
        take: row,
        orderBy: {
          login_time: 'desc',
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
   * /api/sys/sysloginlog/add:
   *   post:
   *     security:
   *       - Authorization: []
   *     description: SysLoginLog Add
   *     tags: [sys]
   *     produces:
   *       - application/json
   *     requestBody:    #编写参数接收体
   *          required: true  #是否必传
   *          content:
   *              application/json:
   *                  schema:     #参数备注
   *                      type: object    #参数类型
   *                      properties:
   *                          browser:
   *                                  type: string    #参数类型
   *                                  description: browser     #参数描述
   *                          device_type:
   *                                  type: string    #参数类型
   *                                  description: device_type     #参数描述
   *                          ip:
   *                                  type: string    #参数类型
   *                                  description: ip     #参数描述
   *                          login_time:
   *                                  type: string    #参数类型
   *                                  description: login_time     #参数描述
   *                                  format: date
   *                          region:
   *                                  type: string    #参数类型
   *                                  description: region     #参数描述
   *                          system_name:
   *                                  type: string    #参数类型
   *                                  description: system_name     #参数描述
   *                          token:
   *                                  type: string    #参数类型
   *                                  description: token     #参数描述
   *                          userid:
   *                                  type: string    #参数类型
   *                                  description: userid     #参数描述
   *
   *
   *
   *                  example:        #请求参数样例。
   *                      browser: ""
   *                      device_type: ""
   *                      ip: ""
   *                      login_time: "2022-04-05 22:57:21.000"
   *                      system_name: ""
   *                      token: ""
   *                      userid: ""
   *
   *     responses:
   *       200:
   *         description: add sysloginlog
   *         schema:
   *           type: object
   */
  router.post('/sysloginlog/add', async (req, res) => {
    const ua = parser(req.headers['user-agent']);
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress; // 判断是否有反向代理 IP // 判断后端的 socket 的 IP
    const llog = {
      cGuid: uuidv4(),
      browser: ua.browser.name,
      device_type: ua.device.vendor,
      ip,
      login_time: new Date(),
      region: ua.os.version,
      system_name: ua.os.name,
      token: req.body.token,
      userid: req.body.userid,
    };

    await prisma.Sys_Login_Log.create({ data: llog });

    res.json({ message: 'SysLoginLog saved' });
  });

  /**
   * @name delete - remove a item
   * @return {Object<{ message: string }>}
   *
   * @example DELETE /crud-operations/${id}
   */

  /**
   * @swagger
   * /api/sys/sysloginlog/delete/{cGuid}:
   *   delete:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sys]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cGuid
   *         description: sysloginlog's id.
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: login
   *         schema:
   *           type: object
   */
  router.delete('/sysloginlog/delete/:cGuid', async (req, res) => {
    const message = await prisma.Sys_Login_Log.delete({
      where: { cGuid: req.params.cGuid },
    }).then(() => 'SysLoginLog deleted');

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
   * /api/sys/sysloginlog/deleteids:
   *   delete:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [sys]
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
  router.delete('/sysloginlog/deleteids', async (req, res) => {
    const { selected } = req.body;
    const message = await prisma.Sys_Login_Log.delete({
      where: { cGuid: { hasSome: selected } },
    }).then(() => 'SysRole deleted');

    res.json({ message });
  });

  return router;
})();

controller.prefix = '/sys';

export default controller;
