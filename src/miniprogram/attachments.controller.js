import { Router } from 'express';

import prisma from '../core/prisma';

const controller = (() => {
  const router = Router();

  router.get('/pagination', async (req, res) => {
    const page = Number(req.query.page) || 1;
    const row = Number(req.query.row) || 5;

    const count = await prisma.basic_video_attachments.count({
      where: {
        reviewedStatus: 1
      }
    });

    if (count != null && count > 0) {
      const rstdata = await prisma.basic_video_attachments.findMany({
        where: {
          reviewedStatus: 1
        },
        skip: (page - 1) * row,
        take: row,
        orderBy: {
          dAddTime: 'asc',
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

  router.get('/current/user/pagination', async (req, res) => {
    const page = Number(req.query.page) || 1;
    const row = Number(req.query.row) || 5;
    const filter = { AND: [] };
    const { cUploader, attachmentsStatus } = req.query;
    if (cUploader == undefined || cUploader == null || cUploader == '') {
      return res.json({ isok: false, message: '上传人不能为空' });
    }
    filter.AND.push({ cUploader: { contains: cUploader } });
    if (attachmentsStatus !== undefined && attachmentsStatus != null && attachmentsStatus !== '') {

      if (
        attachmentsStatus == 1
      ) {
        filter.AND.push({ attachmentsStatus: 1 });
      }
      else if (
        attachmentsStatus != 1
      ) {
        console.log("attachmentsStatus", attachmentsStatus);
        filter.AND.push({
          attachmentsStatus: {
            in: [0, 2]
          }
        });
      }
    }
    const count = await prisma.basic_video_attachments.count({
      where: {
        reviewedStatus: 1
      }
    });

    if (count != null && count > 0) {
      const rstdata = await prisma.basic_video_attachments.findMany({
        where: {
          reviewedStatus: 1
        },
        skip: (page - 1) * row,
        take: row,
        orderBy: {
          dAddTime: 'asc',
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
  router.post('/add', async (req, res) => {
    const { cUploader, name, url } = req.body;
    if (name == undefined || name == null || name == '') {
      return res.json({ isok: false, message: '文件名不能为空' });
    }
    if (cUploader == undefined || cUploader == null || cUploader == '') {
      return res.json({ isok: false, message: '上传人不能为空' });
    }
    if (url == undefined || url == null || url == '') {
      return res.json({
        isok: false, message: '上传地址不能为空'
      });
    }
    const installJson = {
      cFileName: name,
      cFileMemo: url,
      cFilePath: url,
      dAddTime: new Date(),
      cUploader,
      cRepository: '/api/uploads/',
      reviewedStatus: 0,
    };
    const result = await prisma.basic_video_attachments.create({ data: installJson });
    res.json({ isok: true, message: 'upload file success', data: result });
  });

  router.post('/submit', async (req, res) => {
    const { id } = req.body;
    if (id == undefined || id == null || id == '') {
      return res.json({
        isok: false, message: '视频id不能为空'
      })
    }
    await prisma.basic_video_attachments.update({
      where: {
        id: id
      },
      data: {
        attachmentsStatus: 2
      }
    });
    res.json({ isok: true, message: 'update video success' });
  });



  return router;
})();

controller.prefix = '/miniprogram/basicattachments';

export default controller;
