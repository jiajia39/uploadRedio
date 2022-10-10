import { Router } from 'express';
import service from './service';

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
   * /api/influx/influxman/getDaqValue:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: influxman get all
   *     tags: [influxman]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: tagid
   *         description: prodkpi's id.
   *         in: query
   *         type: string
   *       - name: dStart
   *         description: prodkpi's id.
   *         in: query
   *         type: date
   *       - name: dEnd
   *         description: prodkpi's id.
   *         in: query
   *         type: date
   *     responses:
   *       200:
   *         description: cofcomenus
   *         schema:
   *           type: object
   */
  router.get('/getDaqValue', async (req, res) => {
    const tagid = String(req.query.tagid);
    const dStart = new Date(req.query.dStart);
    const dEnd = new Date(req.query.dEnd);
    const data = await service.getDaqValue(tagid, dStart, dEnd);

    res.json(data);
  });

  return router;
})();

controller.prefix = '/influx/influxman';

export default controller;
