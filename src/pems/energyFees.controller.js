import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../core/prisma';

const controller = (() => {
  const router = Router();
  /**
   * @swagger
   * /api/pems/energyFees/add:
   *   post:
   *     security:
   *       - Authorization: []
   *     description: add energyFees  (新增)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cPrice
   *         description: energyFees's cPrice.
   *         in: query
   *         type: float
   *       - name: cType
   *         description: energyFees's cType
   *         in: query
   *         type: string
   *       - name: cModel
   *         description: energyFees's cModel
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: energyFees
   *         schema:
   *           type: object
   */
  router.post('/add', async (req, res) => {
    if (!req.body.cPrice) {
      res.status(400).json({ message: 'Please pass price.' });
    }
    await prisma.Pems_EnergyFees.create({
      data: req.body,
    });
    res.json({ isok: true, message: 'EnergyFees saved' });
  });
  /**
   * @swagger
   * /api/pems/energyFees/edit/:id:
   *   put:
   *     security:
   *       - Authorization: []
   *     description : edit energyFees  (编辑)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cPrice
   *         description: energyFees's cPrice.
   *         in: query
   *         type: float
   *       - name: cType
   *         description: energyFees's cType
   *         in: query
   *         type: string
   *       - name: cModel
   *         description: energyFees's cModel
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: energyFees
   *         schema:
   *           type: object
   */
  router.put('/edit/:id', async (req, res) => {
    const data = {
      cPrice: parseFloat(req.body.cPrice),
      cType: req.body.cType,
      cStartTime: req.body.cStartTime,
      cEndTime: req.body.cEndTime,
      cModel: req.body.cModel,
    };
    const message = await prisma.Pems_EnergyFees.update({
      where: { id: Number(req.params.id) },
      data: data,
    }).then(() => 'List updated');
    res.json({ isok: true, updatedData: data, message });
  });
  /**
   * @swagger
   * /api/pems/energyFees/pagination:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Pagination query(根据条件获取energyfee的分页数据)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cRecordType
   *         description: energyfee's cRecordType.
   *         in: query
   *         type: String
   *       - name: cMerterFk
   *         description: energyfee's cMerterFk
   *         in: query
   *         type: int
   *     responses:
   *       200:
   *         description: Get Energy Fees Pagination
   *         schema:
   *           type: object
   */
  router.get('/pagination', async (req, res) => {
    const { cType, cType1, cType2 } = req.query;
    const filter = { AND: {} };
    const page = Number(req.query.page) || 1;
    const row = Number(req.query.row) || 5;
    let type = [];
    if (cType != null && cType != '') {
      type.push(cType);
    }
    if (cType1 != null && cType1 != '') {
      type.push(cType1);
    }
    if (cType2 != null && cType2 != '') {
      type.push(cType2);
    }
    if (cType) filter.AND = { ...filter.AND, cType: { in: type } };
    const count = await prisma.Pems_EnergyFees.count({
      where: filter,
    });

    const select = {
      id: true,
      cPrice: true,
      cType: true,
      cStartTime: true,
      cEndTime: true,
      cModel: true,
    };

    if (count != null && count > 0) {
      const rstdata = await prisma.Pems_EnergyFees.findMany({
        where: filter,
        select,
        skip: (page - 1) * row,
        take: row,
        orderBy: {
          id: 'asc',
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
   * /api/pems/energyFees/getType:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Get the meterValues type(获取meterValues的类型值)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: meterValues
   *         schema:
   *           type: object
   */
  router.get('/getType', async (req, res) => {
    // const select = {
    //   cType: true,
    // };
    const rstdata = await prisma.Pems_EnergyFees.groupBy({
      by: ['cType'],
    });
    res.json(rstdata);
  });
  return router;
})();

controller.prefix = '/pems/energyFees';

export default controller;
