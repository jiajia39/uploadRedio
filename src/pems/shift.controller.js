import { Router } from 'express';
import prisma from '../core/prisma';

const controller = (() => {
  const router = Router();
  /**
   * @swagger
   * /api/pems/shift/edit/:cDesc:
   *   put:
   *     security:
   *       - Authorization: []
   *     description : edit shift  (编辑)
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cDesc
   *         description: Shift's cDesc
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: Edit Shifts
   *         schema:
   *           type: object
   */
  router.put('/edit/:id', async (req, res) => {
    let startTime = req.body.cStartTime;
    let endTime = req.body.cEndTime;
    const data = {
      cStartTime: startTime,
      cEndTime: endTime,
    };
    const message = await prisma.Pems_Shift.update({
      where: { id: Number(req.params.id) },
      data: data,
    }).then(() => 'List updated');
    res.json({ isok: true, updatedData: data, message });
  });

  /**
   * @swagger
   * /api/pems/shift/getall:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Get All the Shifts
   *     tags: [pems]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: shift's id.
   *         in: query
   *         type: int
   *       - name: cDesc
   *         description: shift's desc.
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: get all shift data
   *         schema:
   *           type: object
   */
  router.get('/getall', async (req, res) => {
    const { id, cDesc } = req.query;
    const filter = { OR: [] };

    const select = {
      id: true,
      cDesc: true,
      cStartTime: true,
      cEndTime: true,
    };

    if (id) filter.OR.push({ id: parseInt(id) });
    if (cDesc) filter.OR.push({ cDesc });

    if (filter.OR.length < 1) {
      const date = await prisma.Pems_Shift.findMany({ select });
      res.json({ data: date });
    } else {
      const date = await prisma.Pems_Shift.findMany({
        where: filter,
        select,
      });
      res.json({ data: date });
    }
  });

  return router;
})();

controller.prefix = '/pems/shift';

export default controller;
