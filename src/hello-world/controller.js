import { Router } from 'express';

import service from './service';

const controller = (() => {
  const router = Router();

  /**
   * @openapi
   * /hello-world:
   *   post:
   *     description: Welcome to swagger-jsdoc!
   *     responses:
   *       200:
   *         description: Returns a mysterious string.
   */
  router.post('/', (req, res) => {
    res.json({ data: service.sayHello(req.body.data) });
  });

  return router;
})();

controller.prefix = '/hello-world';

export default controller;
