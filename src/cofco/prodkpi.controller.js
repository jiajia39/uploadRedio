import { Router } from 'express';
import service from './service';
import { CfProdKPIColl } from './model/cfprodkpi';
import { CfProdKPIFactorColl } from './model/cfprodkpifactor';
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
   * /api/cofco/prodkpi/getall:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: prodkpi get all
   *     tags: [prodkpi]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: _id
   *         description: prodkpi's id.
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: cofcomenus
   *         schema:
   *           type: object
   */
  router.get('/getfactorall', async (req, res) => {
    const { _id } = req.query;

    const find = {};

    if (_id) find._id = _id;

    const data = await CfProdKPIFactorColl.find(find).exec();

    res.json(data);
  });

  /**
   * @swagger
   * /api/cofco/prodkpi/getfactorbyDateAndOrgName:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: prodkpi get all
   *     tags: [prodkpi]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cOrgName
   *         description: cOrgName.
   *         in: query
   *         type: string
   *       - name: dDate
   *         description: dDate.
   *         in: query
   *         type: date
   *       - name: cKPIType
   *         description: dDate.
   *         in: query
   *         type: date
   *     responses:
   *       200:
   *         description: cofcomenus
   *         schema:
   *           type: object
   */
  router.get('/getfactorbyDateAndOrgName', async (req, res) => {
    const cOrgName = String(req.query.cOrgName);
    const cKPIType = String(req.query.cKPIType);
    const dDateTom = new Date(req.query.dDate);
    const dDateToday = new Date(dDateTom);
    // const cOrgGuid = String(req.query.cOrgGuid);
    dDateTom.setDate(dDateTom.getDate() + 1);

    let find = {};
    if (dDateToday) {
      find = {
        $and: [
          {
            dDate: {
              $gte: dDateToday,
              $lt: dDateTom,
            },
          },
          { cOrgName },
          { cKPIType },
        ],
      };
    }

    console.log(JSON.stringify(find));
    const data = await CfProdKPIColl.find(find).exec();

    res.json(data);
  });

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
   * /api/cofco/prodkpi/getall:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: prodkpi get all
   *     tags: [prodkpi]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: _id
   *         description: prodkpi's id.
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: cofcomenus
   *         schema:
   *           type: object
   */
  router.get('/getall', async (req, res) => {
    const { _id } = req.query;

    const find = {};

    if (_id) find._id = _id;

    const data = await CfProdKPIColl.find(find).exec();

    res.json(data);
  });

  /**
   * @swagger
   * /api/cofco/prodkpi/item/{id}:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [prodkpi]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: prodkpi's id.
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
    const data = await CfProdKPIColl.find({ _id: req.params.id }).exec();
    res.json({ data, message: 'Data obtained.' });
  });

  /**
   * @swagger
   * /api/cofco/prodkpi/count:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Welcome to swagger-jsdoc!
   *     tags: [prodkpi]
   *     responses:
   *       200:
   *         description: Returns a mysterious string.
   */
  router.get('/count', async (req, res) => {
    const data = await CfProdKPIColl.count().exec();
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
   * /api/cofco/prodkpi/pagination:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [prodkpi]
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
   *         description: prodkpi/pagination
   *         schema:
   *           type: object
   */
  router.get('/pagination', async (req, res) => {
    const data = [];

    const page = Number(req.query.page) || 1;
    const row = Number(req.query.row) || 5;
    const dDateTom = new Date(req.query.dDate);
    const dDateToday = new Date(dDateTom);
    const cOrgGuid = String(req.query.cOrgGuid);
    dDateTom.setDate(dDateTom.getDate() + 1);
    let find = {};
    if (dDateToday && cOrgGuid) {
      find = {
        $and: [
          {
            dDate: {
              $gte: dDateToday,
              $lt: dDateTom,
            },
          },
          { cOrgGuid },
        ],
      };
    }

    const count = await CfProdKPIColl.find(find)
      .count()
      .exec();

    for (let i = 0, l = count; i < l / row; i += 1) {
      if (page === i + 1) {
        data.push(
          CfProdKPIColl.find(find)
            .skip(i * row)
            .limit(row),
        );
      }
    }
    const rst = await Promise.all(data);
    res.json({
      data: rst[0] ?? [],
      total: count,
      message: 'Data obtained.',
    });
  });

  /**
   * @swagger
   * /api/cofco/prodkpi/add:
   *   post:
   *     security:
   *       - Authorization: []
   *     description: prodkpi Add
   *     tags: [prodkpi]
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
   *         description: add prodkpi
   *         schema:
   *           type: object
   */
  router.post('/add', async (req, res) => {
    if (!req.body.cOrgGuid) {
      res.status(400).json({ message: 'Please pass cOrgGuid.' });
    }

    const dataOrg = await prisma.Sys_Org.findUnique({ where: { cGuid: req.body.cOrgGuid } });
    req.body.cOrgCode = dataOrg.cOrgCode;
    req.body.cOrgName = dataOrg.cOrgName;
    req.body.cOrgType = dataOrg.cOrgCode;
    req.body.cParentGuid = dataOrg.cOrgName;
    req.body.cParentOrgCode = dataOrg.cOrgCode;
    req.body.cParentOrgName = dataOrg.cOrgName;

    const list = await new CfProdKPIColl(req.body);
    const message = await list.save().then(() => 'prodkpi saved');

    res.json({ isok: true, message });
  });

  /**
   * @swagger
   * /api/cofco/prodkpi/addwithallfactor:
   *   post:
   *     security:
   *       - Authorization: []
   *     description: prodkpi Add
   *     tags: [prodkpi]
   *     produces:
   *       - application/json
   *     requestBody:    #编写参数接收体
   *          required: true  #是否必传
   *          content:
   *              application/json:
   *                  schema:     #参数备注
   *                      type: object    #参数类型
   *                      properties:
   *                          cOrgGuid:
   *                                  type: string    #参数类型
   *                                  description: cRoleCode     #参数描述
   *                          dDate:
   *                                  type: date    #参数类型
   *                                  description: cOrgName     #参数描述
   *                  example:        #请求参数样例。
   *                      cOrgGuid: ""
   *                      dDate: ""
   *
   *     responses:
   *       200:
   *         description: add prodkpi
   *         schema:
   *           type: object
   */
  router.post('/addwithallfactor', async (req, res) => {
    if (!req.body.cOrgGuid || !req.body.dDate) {
      res.status(400).json({ message: 'Please pass cOrgGuid and dDate.' });
    }

    const bExistList = await CfProdKPIColl.find({
      $and: [{ dDate: req.body.dDate }, { cOrgGuid: req.body.cOrgGuid }],
    });

    if (bExistList.length > 0) {
      res.json({ isok: false, message: '已有' });
      return;
    }

    const allfactor = await CfProdKPIFactorColl.find().exec();

    const dataOrg = await prisma.Sys_Org.findUnique({ where: { cGuid: req.body.cOrgGuid } });

    let batchList = JSON.parse(JSON.stringify(allfactor));

    batchList = allfactor.map(item => {
      return {
        dDate: req.body.dDate,
        cOrgGuid: dataOrg.cGuid,
        cOrgCode: dataOrg.cOrgCode,
        cOrgName: dataOrg.cOrgName,
        cOrgType: dataOrg.cOrgType,
        cParentGuid: dataOrg.cParentGuid,
        cParentOrgCode: dataOrg.cParentOrgCode,
        cParentOrgName: dataOrg.cParentOrgName,
        cKPIType: item.cKPIType,
        cKPIFactorGuid: item.cGuid,
        cKPIFactor: item.cKPIFactor,
        cKPIFactorDesc: item.cKPIFactorDesc,
        cKPIFactorUnit: item.cKPIFactorUnit,
        iKPI: 0,
      };
    });

    const message = await CfProdKPIColl.insertMany(batchList).then(() => 'prodkpi saved');
    res.json({ isok: true, message });
  });

  /**
   * @name update - update a item
   * @return {Object<{ message: string }>}
   *
   * @example PUT /crud-operations/${id}
   */

  /**
   * @swagger
   * /api/cofco/prodkpi/item/{id}:
   *   put:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [prodkpi]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: prodkpi's id.
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
  router.put('/item/:id', async (req, res) => {
    const message = await CfProdKPIColl.findOneAndUpdate({ _id: req.params.id }, req.body).then(
      () => 'List updated',
    );

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
   * /api/cofco/prodkpi/delete/{id}:
   *   delete:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [prodkpi]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: prodkpi's id.
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: login
   *         schema:
   *           type: object
   */
  router.delete('/delete/:id', async (req, res) => {
    const message = await CfProdKPIColl.findByIdAndRemove(req.params.id).then(
      () => 'prodkpi deleted',
    );

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
   * /api/cofco/prodkpi/deleteids:
   *   delete:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [prodkpi]
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
    const message = await CfProdKPIColl.remove({ _id: { $in: selected } }).then(
      () => 'prodkpi deleted',
    );

    res.json({ message });
  });

  return router;
})();

controller.prefix = '/cofco/prodkpi';

export default controller;
