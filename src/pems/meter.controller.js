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
        }
      }
    }

    if (id) filter.OR.push({ id: parseInt(id) });
    if (cType) filter.OR.push({ cType });
    if (cPositionFk) filter.OR.push({ cPositionFk: parseInt(cPositionFk) });

    if (filter.OR.length < 1) {
      const data = await prisma.Pems_Meter.findMany(
        { select, }
      );
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
   * /api/pems/meterPosition/pagination:
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
   *         description: meterPosition/pagination
   *         schema:
   *           type: object
   */
  router.get('/pagination', async (req, res) => {

    const { cPositionFk } = req.query;

    const filter = { AND: {} };

    if (cPositionFk) filter.AND = { ...filter.AND, cPositionFk: Number(cPositionFk) };

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

  return router;
})();

controller.prefix = '/pems/meter';

export default controller;
