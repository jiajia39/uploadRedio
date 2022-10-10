import { Router } from 'express';
import service from './service';
import { CfProdSummaryColl } from './model/cfprodsummary';
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
   * /api/cofco/prodsummary/getall:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: prodsummary get all
   *     tags: [prodsummary]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: _id
   *         description: prodsummary's id.
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

    const data = await CfProdSummaryColl.find(find).exec();

    res.json(data);
  });

  /**
   * @swagger
   * /api/cofco/prodsummary/getbyDateAssetAndProduct:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: prodsummary get all
   *     tags: [prodsummary]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: dDate
   *         description: prodsummary's id.
   *         in: query
   *         type: date
   *       - name: cAssetGuid
   *         description: prodsummary's id.
   *         in: query
   *         type: string
   *       - name: cProduct
   *         description: prodsummary's id.
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: cofcomenus
   *         schema:
   *           type: object
   */
  router.get('/getbyDateAssetAndProduct', async (req, res) => {
    const dDateTom = new Date(req.query.dDate);
    const dDateToday = new Date(dDateTom);
    const cAssetGuid = String(req.query.cAssetGuid);
    const cProduct = String(req.query.cProduct);
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
          {
            cAssetGuid,
          },
          {
            cProduct,
          },
        ],
      };
    }
    const data = await CfProdSummaryColl.find(find).exec();

    res.json(data);
  });

  /**
   * @swagger
   * /api/cofco/prodsummary/getallbydate:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: prodsummary get all
   *     tags: [prodsummary]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: dDate
   *         description: prodsummary's id.
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: cofcomenus
   *         schema:
   *           type: object
   */
  router.get('/getallbydate', async (req, res) => {
    const dDateTom = new Date(req.query.dDate);
    const dDateToday = new Date(dDateTom);
    // const cOrgGuid = String(req.query.cOrgGuid);
    dDateTom.setDate(dDateTom.getDate() + 1);

    let find = {};
    if (dDateToday) {
      find = {
        dDate: {
          $gte: dDateToday,
          $lt: dDateTom,
        },
      };
    }
    const data = await CfProdSummaryColl.find(find).exec();

    res.json(data);
  });

  /**
   * @swagger
   * /api/cofco/prodsummary/gettop5Prodbydate:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: prodsummary get all
   *     tags: [prodsummary]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: dDate
   *         description: prodsummary's id.
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: cofcomenus
   *         schema:
   *           type: object
   */
  router.get('/gettop5Prodbydate', async (req, res) => {
    const dDateTom = new Date(req.query.dDate);
    const dDateToday = new Date(dDateTom);
    dDateTom.setDate(dDateTom.getDate() + 1);

    let find = {};
    if (dDateToday) {
      find = [
        {
          $match: {
            dDate: {
              $gte: dDateToday,
              $lt: dDateTom,
            },
          },
        },
        {
          $sort: { iProd: -1 },
        },
        {
          $limit: 5,
        },
      ];
    }
    const data = await CfProdSummaryColl.aggregate(find).exec();

    res.json(data);
  });

  /**
   * @swagger
   * /api/cofco/prodsummary/gettop5Loadbydate:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: prodsummary get all
   *     tags: [prodsummary]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: dDate
   *         description: prodsummary's id.
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: cofcomenus
   *         schema:
   *           type: object
   */
  router.get('/gettop5Loadbydate', async (req, res) => {
    const dDateTom = new Date(req.query.dDate);
    const dDateToday = new Date(dDateTom);
    dDateTom.setDate(dDateTom.getDate() + 1);

    let find = {};
    if (dDateToday) {
      find = [
        {
          $match: {
            dDate: {
              $gte: dDateToday,
              $lt: dDateTom,
            },
          },
        },
        {
          $sort: { iLoad: -1 },
        },
        {
          $limit: 5,
        },
      ];
    }
    const data = await CfProdSummaryColl.aggregate(find).exec();

    res.json(data);
  });

  /**
   * @swagger
   * /api/cofco/prodsummary/getProdLoadAnlyProductbydate:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: prodsummary get all
   *     tags: [prodsummary]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: dDate
   *         description: prodsummary's id.
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: cofcomenus
   *         schema:
   *           type: object
   */
  router.get('/getProdLoadAnlyProductbydate', async (req, res) => {
    const dDateTom = new Date(req.query.dDate);
    const dDateToday = new Date(dDateTom);
    dDateTom.setDate(dDateTom.getDate() + 1);

    let find = {};
    if (dDateToday) {
      find = [
        {
          $match: {
            dDate: {
              $gte: dDateToday,
              $lt: dDateTom,
            },
          },
        },
        {
          $group: {
            _id: '$cProduct', // 按照产品进行分组
            iProd: { $sum: '$iProd' },
            iLoad: { $avg: '$iLoad' },
          },
        },
      ];
    }
    const data = await CfProdSummaryColl.aggregate(find).exec();

    res.json(data);
  });

  /**
   * @swagger
   * /api/cofco/prodsummary/item/{id}:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [prodsummary]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: prodsummary's id.
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
    const data = await CfProdSummaryColl.find({ _id: req.params.id }).exec();
    res.json({ data, message: 'Data obtained.' });
  });

  /**
   * @swagger
   * /api/cofco/prodsummary/count:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Welcome to swagger-jsdoc!
   *     tags: [prodsummary]
   *     responses:
   *       200:
   *         description: Returns a mysterious string.
   */
  router.get('/count', async (req, res) => {
    const data = await CfProdSummaryColl.count().exec();
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
   * /api/cofco/prodsummary/pagination:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [prodsummary]
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
   *         description: prodsummary/pagination
   *         schema:
   *           type: object
   */
  router.get('/pagination', async (req, res) => {
    const data = [];

    const page = Number(req.query.page) || 1;
    const row = Number(req.query.row) || 5;
    const count = await CfProdSummaryColl.count().exec();

    for (let i = 0, l = count; i < l / row; i += 1) {
      if (page === i + 1) {
        data.push(
          CfProdSummaryColl.find({})
            .skip(i * row)
            .limit(row)
            .sort({ dDate: -1 }),
        );
      }
    }
    const rst = await Promise.all(data);
    res.json({
      data: rst[0],
      total: count,
      message: 'Data obtained.',
    });
  });

  /**
   * @swagger
   * /api/cofco/prodsummary/add:
   *   post:
   *     security:
   *       - Authorization: []
   *     description: prodsummary Add
   *     tags: [prodsummary]
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
   *         description: add prodsummary
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

    const dataAsset = await prisma.Sys_Org.findUnique({ where: { cGuid: req.body.cOrgGuid } });
    req.body.cAssetCode = dataAsset.cOrgCode;
    req.body.cAssetName = dataAsset.cOrgName;
    const list = await new CfProdSummaryColl(req.body);
    const message = await list.save().then(() => 'prodsummary saved');

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
   * /api/cofco/prodsummary/item/{id}:
   *   put:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [prodsummary]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: prodsummary's id.
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
    const message = await CfProdSummaryColl.findOneAndUpdate({ _id: req.params.id }, req.body).then(
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
   * /api/cofco/prodsummary/delete/{id}:
   *   delete:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [prodsummary]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: prodsummary's id.
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
    const message = await CfProdSummaryColl.findByIdAndRemove(req.params.id).then(
      () => 'prodsummary deleted',
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
   * /api/cofco/prodsummary/deleteids:
   *   delete:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [prodsummary]
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
    const message = await CfProdSummaryColl.remove({ _id: { $in: selected } }).then(
      () => 'prodsummary deleted',
    );

    res.json({ message });
  });

  return router;
})();

controller.prefix = '/cofco/prodsummary';

export default controller;
