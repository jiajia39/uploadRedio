import { Router } from 'express';
import prisma from '../core/prisma';

const controller = (() => {
  const router = Router();

  /**
   * @swagger
   * /api/pems/meter/getall:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Get Meters by Id and Type and Position
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: meter's id.
   *         in: query
   *         type: int
   *       - name: cType
   *         description: meter's type(electricity, water or steam).
   *         in: query
   *         type: int
   *       - name: cPositionFk
   *         description: Position Foriegn Key
   *         in: query
   *         type: int
   *     responses:
   *       200:
   *         description: meters
   *         schema:
   *           type: object
   */
  router.get('/getall', async (req, res) => {
    const { id, cType, cPositionFk } = req.query;
    const filter = { OR: [] };

    const select = {
      id: true,
      cName: true,
      cType: true,
      cDesc: true,
      dAddTime: true,
      Pems_MeterPosition: {
        select: {
          id: true,
          cName: true,
          dAddTime: true,
        },
      },
    };

    if (id) filter.OR.push({ id: parseInt(id) });
    if (cType) filter.OR.push({ cType });
    if (cPositionFk) filter.OR.push({ cPositionFk: parseInt(cPositionFk) });

    if (filter.OR.length < 1) {
      const data = await prisma.Pems_Meter.findMany({ select });
      res.json(data);
    } else {
      const data = await prisma.Pems_Meter.findMany({
        where: filter,
        select,
      });
      res.json(data);
    }
  });

  /**
   * @swagger
   * /api/pems/meter/count:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Get count for meters!
   *     tags: [pems]
   *     responses:
   *       200:
   *         description: Returns a mysterious string.
   */
  router.get('/count', async (req, res) => {
    const data = await prisma.Pems_Meter.count();
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
   * /api/pems/meter/pagination:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [pems]
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
   *         description: meter/pagination
   *         schema:
   *           type: object
   */
  router.get('/pagination', async (req, res) => {
    const { cPositionFk, cDesc } = req.query;

    const filter = { AND: {} };

    if (cPositionFk) filter.AND = { ...filter.AND, cPositionFk: Number(cPositionFk) };
    if (cDesc) filter.AND = { ...filter.AND, cDesc: { contains: cDesc } };

    const page = Number(req.query.page) || 1;
    const row = Number(req.query.row) || 5;
    const count = await prisma.Pems_Meter.count({
      where: filter,
    });

    const select = {
      id: true,
      cName: true,
      cType: true,
      cDesc: true,
      cPositionFk: true,
      dAddTime: true,
      Pems_MeterPosition: {
        select: {
          id: true,
          cName: true,
          dAddTime: true,
        },
      },
    };

    if (count != null && count > 0) {
      const rstdata = await prisma.Pems_Meter.findMany({
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
   * /api/pems/Pems_Meter/add:
   *   put:
   *     security:
   *       - Authorization: []
   *     description : add Pems_Meter  (新增)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cPositionFk
   *         description: Pems_Meter's cPositionFk.
   *         in: query
   *         type: int
   *       - name: cType
   *         description: Pems_Meter's cType
   *         in: query
   *         type: string
   *       - name: cName
   *         description: Pems_Meter's cName
   *         in: query
   *         type: string
   *       - name: cDesc
   *         description: Pems_Meter's cDesc
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: Pems_Meter
   *         schema:
   *           type: object
   */
  router.post('/add', async (req, res) => {
    if (!req.body.cName) {
      res.status(400).json({ message: 'Please pass cName.' });
    }
    if (!req.body.cType) {
      res.status(400).json({ message: 'Please pass cType.' });
    }
    if (!req.body.cDesc) {
      res.status(400).json({ message: 'Please pass cDesc.' });
    }
    const cPositionFk = req.body.cPositionFk;
    if (cPositionFk != null) {
      const positionFk = await prisma.Pems_MeterPosition.findFirst({
        where: { id: Number(cPositionFk) },
      });
      if (positionFk == null) {
        res.status(400).json({ message: 'Please pass cPositionFk.' });
      }
    }
    req.body.dAddTime = new Date();
    await prisma.Pems_Meter.create({
      data: req.body,
    });
    res.json({ isok: true, message: 'EnergyFees saved' });
  });

  /**
   * @swagger
   * /api/pems/Pems_Meter/edit/:id:
   *   put:
   *     security:
   *       - Authorization: []
   *     description : edit Pems_Meter  (编辑)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cPositionFk
   *         description: Pems_Meter's cPositionFk.
   *         in: query
   *         type: int
   *       - name: cType
   *         description: Pems_Meter's cType
   *         in: query
   *         type: string
   *       - name: cName
   *         description: Pems_Meter's cName
   *         in: query
   *         type: string
   *       - name: cDesc
   *         description: Pems_Meter's cDesc
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: Pems_Meter
   *         schema:
   *           type: object
   */
  router.put('/edit/:id', async (req, res) => {
    const cPositionFk = req.body.cPositionFk;
    if (cPositionFk) {
      const positionFk = await prisma.Pems_MeterPosition.findFirst({
        where: { id: Number(cPositionFk) },
      });
      if (positionFk == null) {
        res.status(400).json({ message: 'Please pass cPositionFk.' });
      } else {
        req.body.cPositionFk = Number(req.body.cPositionFk);
      }
    }
    const date = {
      cName: req.body.cName,
      cType: req.body.cType,
      cDesc: req.body.cDesc,
      cPositionFk: req.body.cPositionFk,
      dAddTime: new Date(),
    };
    const message = await prisma.Pems_Meter.update({
      where: { id: Number(req.params.id) },
      data: date,
    }).then(() => 'List updated');
    res.json({ isok: true, message });
  });

  /**
   * @swagger
   * /api/pems/Meter/delete/:id:
   *   put:
   *     security:
   *       - Authorization: []
   *     description : delete Meter  (删除)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Meter's id.
   *         in: query
   *         type: int
   *     responses:
   *       200:
   *         description: Meter
   *         schema:
   *           type: object
   */
  router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await prisma.Pems_MeterValues.deleteMany({
      where: { cMeterFk: Number(id) },
    });
    await prisma.Pems_MeterReporting_Week.deleteMany({
      where: { cMeterFk: Number(id) },
    });
    await prisma.Pems_MeterReporting_Month.deleteMany({
      where: { cMeterFk: Number(id) },
    });

    await prisma.Pems_MeterReporting_Day.deleteMany({
      where: { cMeterFk: Number(id) },
    });

    await prisma.Pems_MeterReportHistory_Day.deleteMany({
      where: { cMeterFk: Number(id) },
    });

    await prisma.Pems_EnergyFeeValues.deleteMany({
      where: { cMeterFk: Number(id) },
    });
    const message = await prisma.Pems_Meter.delete({
      where: { id: Number(id) },
    }).then(() => 'Pems_Meter deleted');

    res.json({ message });
  });

  return router;
})();

controller.prefix = '/pems/meter';

export default controller;
