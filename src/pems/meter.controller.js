import { Router } from 'express';
import service from './../sys/service';
import prisma from '../core/prisma';

const controller = (() => {
  const router = Router();

  return router;
})();

controller.prefix = '/pems/meter';

export default controller;
