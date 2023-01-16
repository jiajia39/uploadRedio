import { Router } from 'express';
import prisma from '../core/prisma';
import influxservice from '../influx/service';
import catchAsync from '../utils/catchAsync';

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
  router.get(
    '/getall',
    catchAsync(async (req, res) => {
      const { id, cType, cPositionFk, productLine } = req.query;
      const filter = { OR: [] };
      const select = {
        id: true,
        cName: true,
        cType: true,
        cDesc: true,
        dAddTime: true,
        Pems_MeterProductionLine: true,
        Pems_Energy_Substitute: true,
        Pems_MeterPosition: true,
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
    }),
  );

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
  router.get(
    '/count',
    catchAsync(async (req, res) => {
      const data = await prisma.Pems_Meter.count();
      res.json({ data, message: 'Data obtained.' });
    }),
  );

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
  router.get(
    '/pagination',
    catchAsync(async (req, res) => {
      const { cPositionFk, cDesc, cProductionLineFk, cEnergySubstituteFk, productLine } = req.query;
      console.log(productLine == true);
      const filter = { AND: {} };
      if (productLine == 'true' && (cProductionLineFk == null || cProductionLineFk == '')) {
        filter.AND = {
          ...filter.AND,
          cProductionLineFk: {
            not: null,
          },
        };
      } else {
        if (cProductionLineFk)
          filter.AND = { ...filter.AND, cProductionLineFk: Number(cProductionLineFk) };
      }

      if (productLine == 'false' && (cPositionFk == null || cPositionFk == '')) {
        filter.AND = {
          ...filter.AND,
          cPositionFk: {
            not: null,
          },
        };
      } else {
        if (cPositionFk) filter.AND = { ...filter.AND, cPositionFk: Number(cPositionFk) };
      }

      if (cEnergySubstituteFk)
        filter.AND = { ...filter.AND, cEnergySubstituteFk: Number(cEnergySubstituteFk) };
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
        Pems_MeterProductionLine: true,
        Pems_Energy_Substitute: true,
        Pems_MeterPosition: true,
        cProductionLineFk: true,
        cEnergySubstituteFk: true,
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
        if (productLine == 'true' || (cProductionLineFk != null && cProductionLineFk != '')) {
          rstdata.forEach(element => {
            element.productLine = true;
          });
        } else if (productLine == 'false' || (cPositionFk != null && cPositionFk != '')) {
          rstdata.forEach(element => {
            element.productLine = false;
          });
        }

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
    }),
  );

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
  router.post(
    '/add',
    catchAsync(async (req, res) => {
      if (!req.body.cName) {
        res.status(200).json({ message: 'Please pass cName.' });
      }
      if (!req.body.cType) {
        res.status(200).json({ message: 'Please pass cType.' });
      }
      if (!req.body.cDesc) {
        res.status(200).json({ message: 'Please pass cDesc.' });
      }
      const cPositionFk = req.body.cPositionFk;
      if (cPositionFk != null) {
        const positionFk = await prisma.Pems_MeterPosition.findFirst({
          where: { id: Number(cPositionFk) },
        });
        if (positionFk == null) {
          res.status(200).json({ message: 'Please pass cPositionFk.' });
        } else {
          req.body.cPositionFk = Number(cPositionFk);
        }
      }
      const cProductionLineFk = req.body.cProductionLineFk;
      if (cProductionLineFk != null) {
        const productionLineFk = await prisma.Pems_MeterProductionLine.findFirst({
          where: { id: Number(cProductionLineFk) },
        });
        if (productionLineFk == null) {
          res.status(200).json({ message: 'Please pass cProductionLineFk.' });
        } else {
          req.body.cProductionLineFk = Number(cProductionLineFk);
        }
      }

      const cEnergySubstituteFk = req.body.cEnergySubstituteFk;
      if (cEnergySubstituteFk != null) {
        const energySubstituteFk = await prisma.Pems_Energy_Substitute.findFirst({
          where: { id: Number(cEnergySubstituteFk) },
        });
        if (energySubstituteFk == null) {
          res.status(200).json({ message: 'Please pass cEnergySubstituteFk.' });
        } else {
          req.body.cEnergySubstituteFk = Number(cEnergySubstituteFk);
        }
      }
      req.body.dAddTime = new Date();
      await prisma.Pems_Meter.create({
        data: req.body,
      });
      res.json({ isok: true, message: 'EnergyFees saved' });
    }),
  );

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
  router.put(
    '/edit/:id',
    catchAsync(async (req, res) => {
      const cPositionFk = req.body.cPositionFk;
      const cProductionLineFk = req.body.cProductionLineFk;
      if (cPositionFk) {
        const positionFk = await prisma.Pems_MeterPosition.findFirst({
          where: { id: Number(cPositionFk) },
        });
        if (positionFk == null) {
          res.status(200).json({ message: 'Please pass cPositionFk.' });
        } else {
          req.body.cPositionFk = Number(cPositionFk);
        }
      }
      if (cProductionLineFk) {
        const productionLineFk = await prisma.Pems_MeterPosition.findFirst({
          where: { id: Number(cProductionLineFk) },
        });
        if (productionLineFk == null) {
          res.status(200).json({ message: 'Please pass cPositionFk.' });
        } else {
          req.body.cProductionLineFk = Number(cProductionLineFk);
        }
      }
      const cEnergySubstituteFk = req.body.cEnergySubstituteFk;
      if (cEnergySubstituteFk != null) {
        const energySubstituteFk = await prisma.Pems_Energy_Substitute.findFirst({
          where: { id: Number(cEnergySubstituteFk) },
        });
        if (energySubstituteFk == null) {
          res.status(200).json({ message: 'Please pass cEnergySubstituteFk.' });
        } else {
          req.body.cEnergySubstituteFk = Number(cEnergySubstituteFk);
        }
      }
      const date = {
        cName: req.body.cName,
        cType: req.body.cType,
        cDesc: req.body.cDesc,
        cPositionFk: req.body.cPositionFk,
        cProductionLineFk: req.body.cProductionLineFk,
        cEnergySubstituteFk: req.body.cEnergySubstituteFk,
        dAddTime: new Date(),
      };
      const message = await prisma.Pems_Meter.update({
        where: { id: Number(req.params.id) },
        data: date,
      }).then(() => 'List updated');
      res.json({ isok: true, message });
    }),
  );

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
  router.delete(
    '/delete/:id',
    catchAsync(async (req, res) => {
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
      await prisma.Pems_MeterRecording.deleteMany({
        where: { cMeterFk: Number(id) },
      });
      const message = await prisma.Pems_Meter.delete({
        where: { id: Number(id) },
      }).then(() => 'Pems_Meter deleted');

      res.json({ isok: true, message });
    }),
  );

  router.get(
    '/running',
    catchAsync(async (req, res) => {
      const totalMeterValue = await prisma.Pems_Meter.count();
      const data = await influxservice.queryInfluxMeasurement();
      console.log(data.length);
      const runningSum = data.length;
      let runningRate = runningSum / totalMeterValue;

      runningRate = (runningRate * 100).toFixed(2) + '%';

      const date = {
        totalMeterValue,
        runningSum,
        runningRate,
      };
      res.json({
        data: date,
      });
    }),
  );

  return router;
})();

controller.prefix = '/pems/meter';

export default controller;
