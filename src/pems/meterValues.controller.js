import { Router } from 'express';
import prisma from '../core/prisma';

const controller = (() => {
  const router = Router();

  return router;
})();

controller.prefix = '/pems/meterValues';

export default controller;