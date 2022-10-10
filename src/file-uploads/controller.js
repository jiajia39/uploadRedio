import { Router } from 'express';

import multer from '~/core/multer';

const controller = (() => {
  const router = Router();

  /**
   * @example POST /file-uploads/single
   *
   * const formData = new FormData();
   * formData.append('photo', <FILE>)
   */

  /**
   * @swagger
   * /api/file-uploads/single:
   *   post:
   *     security:
   *       - Authorization: []
   *     description: file upload
   *     tags: [file-uploads]
   *     produces:
   *       - application/json
   *     requestBody:
   *       content:
   *          multipart/form-data:
   *            schema:
   *              type: object
   *              properties:
   *                id:
   *                  type: string
   *                  format: uuid
   *                address:
   *                   # default Content-Type for objects is `application/json`
   *                  type: object
   *                  properties: {}
   *                photo:
   *                  # default Content-Type for string/binary is `application/octet-stream`
   *                  type: string
   *                  format: binary
   *     responses:
   *       200:
   *         description: multer upload
   *         schema:
   *           type: object
   */
  router.post('/single', multer.single('photo'), (req, res) => {
    res.json({ file: req.file });
  });

  /**
   * @example POST /file-uploads/multiple
   */

  /**
   * @swagger
   * /api/file-uploads/multiple:
   *   post:
   *     security:
   *       - Authorization: []
   *     description: file upload
   *     tags: [file-uploads]
   *     produces:
   *       - application/json
   *     requestBody:
   *       content:
   *          multipart/form-data:
   *            schema:
   *              type: object
   *              properties:
   *                id:
   *                  type: string
   *                  format: uuid
   *                address:
   *                   # default Content-Type for objects is `application/json`
   *                  type: object
   *                  properties: {}
   *                photos:
   *                  # default Content-Type for string/binary is `application/octet-stream`
   *                  type: array
   *                  items:
   *                    type: string
   *                    format: binary
   *     responses:
   *       200:
   *         description: multer upload
   *         schema:
   *           type: object
   */
  router.post('/multiple', multer.array('photos', 10), (req, res) => {
    res.json({ files: req.files });
  });

  return router;
})();

controller.prefix = '/file-uploads';

export default controller;
