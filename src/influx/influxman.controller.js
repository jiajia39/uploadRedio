import { Router } from 'express';
import service from './service';
import catchAsync from './../utils/catchAsync';

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
   * /api/influx/influxman/getInfluxData:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: influxman get all
   *     tags: [influxman]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: measurement
   *         description: Meassurement in Influxdb Bucket.
   *         in: query
   *         type: string
   *       - name: field
   *         description: Field in Influxdb Meassurement.
   *         in: query
   *         type: string
   *       - name: start
   *         description: Start time to query, -1h means starting 1 hour before.
   *         in: query
   *         type: date
   *       - name: interval
   *         description: Query time interval, 1h means starting 1 hour.
   *         in: query
   *         type: date
   *       - name: queryType
   *         description: Mean or Last data to return
   *     responses:
   *       200:
   *         description: Influxdb data by query conditions
   *         schema:
   *           type: object
   */
  router.get('/getInfluxData', async (req, res) => {
    const measurement = String(req.query.measurement);
    const field = String(req.query.field);
    const start = req.query.start;
    const interval = req.query.interval || '10s';
    const queryType = req.query.queryType || 'mean';
    const data = await service.getInfluxData(measurement, field, start, interval, queryType);

    res.json({
      Key: field,
      TimeRange: start,
      TimeInterval: interval,
      QueryType: queryType,
      Values: data,
    });
  });

  /**
   * @swagger
   * /api/influx/influxman/getInfluxDifferenceData:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: influxman get all
   *     tags: [influxman]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: measurement
   *         description: Meassurement in Influxdb Bucket.
   *         in: query
   *         type: string
   *       - name: field
   *         description: Field in Influxdb Meassurement.
   *         in: query
   *         type: string
   *       - name: start
   *         description: Start time to query, -1h means starting 1 hour before.
   *         in: query
   *         type: date
   *       - name: interval
   *         description: Query time interval, 1h means starting 1 hour.
   *         in: query
   *         type: date
   *       - name: queryType
   *         description: Mean or Last data to return
   *     responses:
   *       200:
   *         description: Influxdb difference data by query conditions
   *         schema:
   *           type: object
   */
  router.get('/getInfluxDifferenceData', async (req, res) => {
    const measurement = String(req.query.measurement);
    const field = String(req.query.field);
    const start = req.query.start;
    const end = req.query.end;
    const interval = req.query.interval || '10s';
    const queryType = req.query.queryType || 'mean';
    const data = await service.getInfluxDifferenceData(
      measurement,
      field,
      start,
      end,
      interval,
      queryType,
    );

    res.json({
      Key: field,
      TimeRange: start,
      TimeInterval: interval,
      QueryType: queryType,
      Values: data,
    });
  });

  /**
   * @swagger
   * /api/influx/influxman/getMeassurements:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Get all the influxdb measurements
   *     tags: [influxman]
   *     produces:
   *       - application/json
   *     parameters:
   *     responses:
   *       200:
   *         description: influxdb measurements
   *         schema:
   *           type: object
   */
  router.get('/getInfluxMeasurements', catchAsync(async(req, res) => {
    const data = await service.queryInfluxMeasurement();
    
    res.json({
      measurement: data,
    });
  })
  )

  return router;
})();

controller.prefix = '/influx/influxman';

export default controller;
