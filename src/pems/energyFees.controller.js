import { Router } from 'express';
import prisma from '../core/prisma';

const controller = (() => {
  const router = Router();
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
    const filter = { AND: {} };
    const page = Number(req.query.page) || 1;
    const row = Number(req.query.row) || 5;

    const count = await prisma.Pems_EnergyFees.count({
      where: filter,
    });

    const select = {
      id: true,
      cPrice: true,
      cType: true,
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
