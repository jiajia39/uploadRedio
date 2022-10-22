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

  return router;
})();

controller.prefix = '/pems/meterValues';

export default controller;
