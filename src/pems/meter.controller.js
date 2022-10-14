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

  return router;
})();

controller.prefix = '/pems/meter';

export default controller;
