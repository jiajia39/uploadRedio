import { Router } from 'express';
import influxservice from '../influx/service';
import prisma from '../core/prisma';
import service from './service';
const controller = (() => {
  const router = Router();
  router.get('/testCronService', function(req, res) {
    const dateTime = new Date(Date.now() + 8 * 60 * 60 * 1000);
    service.setMeterRecordingAndSave();
    res.json(dateTime);
  });

  /**
   * @swagger
   * /api/pems/meterValues/getall:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Get meterValues by Id or cMerterFk(根据条件（满足A或B条件）获取meterValues的数据)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: meterValues's id.
   *         in: query
   *         type: int
   *       - name: cMerterFk
   *         description: meterValues's cMerterFk
   *         in: query
   *         type: int
   *     responses:
   *       200:
   *         description: meterValues
   *         schema:
   *           type: object
   */
  router.get('/getall', async (req, res) => {
    const { id, cMerterFk } = req.query;
    const filter = { OR: [] };
    const select = {
      id: true,
      cValue: true,
      cRecordTime: true,
      cRecordDate: true,
      cRecordType: true,
      cMerterFk: true,
      cRecorder: true,
      Pems_Meter: {
        select: {
          id: true,
          cName: true,
          cType: true,
          cDesc: true,
          dAddTime: true,
        },
      },
    };

    if (id) filter.OR.push({ id: parseInt(id) });
    if (cMerterFk) filter.OR.push({ cMerterFk: parseInt(cMerterFk) });

    if (filter.OR.length < 1) {
      const data = await prisma.Pems_MeterValues.findMany({ select });
      res.json(data);
    } else {
      const data = await prisma.Pems_MeterValues.findMany({
        where: filter,
        select,
      });
      res.json(data);
    }
  });
  /**
   * @swagger
   * /api/pems/meterValues/pagination:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Pagination query(根据条件获取meterValues的分页数据)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cRecordType
   *         description: meterValues's cRecordType.
   *         in: query
   *         type: String
   *       - name: cMerterFk
   *         description: meterValues's cMerterFk
   *         in: query
   *         type: int
   *     responses:
   *       200:
   *         description: meterValues
   *         schema:
   *           type: object
   */
  router.get('/pagination', async (req, res) => {
    const { cRecordType, cMerterFk } = req.query;
    const filter = { AND: {} };
    if (cRecordType) filter.AND = { ...filter.AND, cRecordType: { contains: cRecordType } };
    if (cMerterFk) filter.AND = { ...filter.AND, cMerterFk: Number(cMerterFk) };

    const page = Number(req.query.page) || 1;
    const row = Number(req.query.row) || 5;

    const count = await prisma.Pems_MeterValues.count({
      where: filter,
    });

    const select = {
      id: true,
      cValue: true,
      cRecordTime: true,
      cRecordDate: true,
      cRecordType: true,
      cMerterFk: true,
      cRecorder: true,
      Pems_Meter: {
        select: {
          id: true,
          cName: true,
          cType: true,
          cDesc: true,
          dAddTime: true,
        },
      },
    };

    if (count != null && count > 0) {
      const rstdata = await prisma.Pems_MeterValues.findMany({
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

  return router;
})();

controller.prefix = '/pems/meterValues';

export default controller;
