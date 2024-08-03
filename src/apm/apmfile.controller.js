import { Router } from 'express';
import multer1 from 'multer';
import fs from 'fs';
import multer from '~/core/multer';

const controller = (() => {
  const router = Router();

  const storage = multer1.diskStorage({
    destination(req, file, done) {
      const dist = './uploads/video/';
      if (!fs.existsSync(dist)) fs.mkdirSync(dist);
      return done(null, dist);
    },
    filename(req, file, done) {
      done(null, file.originalname);
    },
  });
  const upload = multer1({ storage });

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
   *                file:
   *                  # default Content-Type for string/binary is `application/octet-stream`
   *                  type: string
   *                  format: binary
   *     responses:
   *       200:
   *         description: multer upload
   *         schema:
   *           type: object
   */
  router.post('/upload', multer.single('file'), (req, res) => {
    const { file } = req;
    console.log(JSON.stringify(file));

    // Prepare the file data object
    const fileData = {
      uid: file.filename,
      name: file.filename,
      status: 'done',
      url: `/api/${file.path}`,
      response: {
        resource_id: 1,
      },
    };

    res.json(fileData);
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
    const { files } = req;
    console.log(JSON.stringify(files));

    // Extract the first file from the array
    const file = files[0];

    // Prepare the file data object
    const fileData = {
      uid: file.filename,
      name: file.filename,
      status: 'done',
      url: `/api/${file.path}`,
      response: {
        resource_id: 1,
      },
    };

    console.log(JSON.stringify(fileData));

    res.json(fileData);
  });

  router.post('/video/upload', upload.single('file'), (req, res) => {
    const { file } = req;
    console.log(JSON.stringify(file));

    // Prepare the file data object
    const fileData = {
      uid: file.filename,
      name: file.filename,
      status: 'done',
      url: `/api/${file.path}`,
      response: {
        resource_id: 1,
      },
    };

    res.json(fileData);
  });

  return router;
})();

controller.prefix = '/apm/file-upload';

export default controller;
