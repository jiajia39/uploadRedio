import { Router } from 'express';
import { ListColl } from './model';

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
  router.get('/', async (req, res) => {
    const { _id, text } = req.query;

    const find = {};

    if (_id) find._id = _id;
    if (text) find.text = { $regex: text, $options: 'i' };

    const data = await ListColl.find(find).exec();

    res.json({ data, message: 'Data obtained.' });
  });

  /**
   * @swagger
   * /api/crud-operations/item/{id}:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [CURD]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: list's id.
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
    const data = await ListColl.find({ _id: req.params.id }).exec();
    res.json({ data, message: 'Data obtained.' });
  });

  /**
   * @swagger
   * /api/crud-operations/count:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Welcome to swagger-jsdoc!
   *     tags: [CURD]
   *     responses:
   *       200:
   *         description: Returns a mysterious string.
   */
  router.get('/count', async (req, res) => {
    const data = await ListColl.count().exec();
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
  router.get('/pagination', async (req, res) => {
    const data = [];

    const page = Number(req.query.page) || 1;
    const row = Number(req.query.row) || 5;
    const count = await ListColl.count().exec();

    for (let i = 0, l = count; i < l / row; i += 1) {
      if (page === i + 1) {
        data.push(
          ListColl.find({})
            .skip(i * row)
            .limit(row),
        );
      }
    }

    res.json({
      data: [...(await Promise.all(data))],
      total: count,
      message: 'Data obtained.',
    });
  });

  /**
   * @swagger
   * /api/crud-operations:
   *   post:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [CURD]
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
   *                                  description: 发送者钱包地址     #参数描述
   *                          password:
   *                                  type: string    #参数类型
   *                                  description: 发送者钱包地址     #参数描述
   *                  example:        #请求参数样例。
   *                      text: "username"
   *     responses:
   *       200:
   *         description: login
   *         schema:
   *           type: object
   */
  router.post('/', async (req, res) => {
    if (!req.body.text) {
      res.status(400).json({ message: 'Please pass text.' });
    }

    const list = await new ListColl(req.body);
    const message = await list.save().then(() => 'List saved');

    res.json({ message });
  });

  /**
   * @name update - update a item
   * @return {Object<{ message: string }>}
   *
   * @example PUT /crud-operations/${id}
   */
  router.put('/:id', async (req, res) => {
    const message = await ListColl.findOneAndUpdate({ _id: req.params.id }, req.body).then(
      () => 'List updated',
    );

    res.json({ message });
  });

  /**
   * @name delete - remove a item
   * @return {Object<{ message: string }>}
   *
   * @example DELETE /crud-operations/${id}
   */
  router.delete('/:id', async (req, res) => {
    const message = await ListColl.findByIdAndRemove(req.params.id).then(() => 'List deleted');

    res.json({ message });
  });

  /**
   * @name delete-multiple - remove selected items
   * @return {Object<{ message: string }>}
   *
   * @example DELETE /crud-operations { selected: [${id}, ${id}, ${id}...] }
   */
  router.delete('/', async (req, res) => {
    const { selected } = req.body;

    const message = await ListColl.remove({ _id: { $in: selected } }).then(() => 'List deleted');

    res.json({ message });
  });

  return router;
})();

controller.prefix = '/crud-operations';

export default controller;
