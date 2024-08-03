import { Router } from 'express';

import prisma from '../core/prisma';

const controller = (() => {
  const router = Router();


  router.get('/getall', async (req, res) => {
    const { cGuid, cModule } = req.query;

    const filter = { OR: [] };

    // Add conditions to the filter based on the presence of the query parameters
    if (cGuid) filter.OR.push({ cGuid });
    if (cModule) filter.OR.push({ cModule });

    // Check if the filter has any conditions
    if (filter.OR.length < 1) {
      // If no conditions are specified, retrieve all records from the 'basic_video_attachments' table
      const data = await prisma.basic_video_attachments.findMany();
      res.json(data);
    } else {
      // If conditions are specified, retrieve records from the 'basic_video_attachments' table based on the filter
      const data = await prisma.basic_video_attachments.findMany({
        where: filter,
      });
      res.json(data);
    }
  });

  router.get('/count', async (req, res) => {
    const data = await prisma.basic_video_attachments.count();
    res.json({ data, message: 'Data obtained.' });
  });

  router.get('/pagination', async (req, res) => {
    const page = Number(req.query.page) || 1;
    const row = Number(req.query.row) || 5;
    const filter = { AND: [] }
    const attachmentsStatus = parseInt(req.query.attachmentsStatus)
    filter.AND.push({
      attachmentsStatus: {
        in: [1, 2]
      }
    })
    if (attachmentsStatus) {
      filter.AND.push({
        attachmentsStatus: attachmentsStatus
      })
    }
    const count = await prisma.basic_video_attachments.count({ where: filter });

    if (count != null && count > 0) {
      const rstdata = await prisma.basic_video_attachments.findMany({
        where: filter,
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

  router.post('/review/pass', async (req, res) => {
    const { reviewUserId } = req.body;
    const id = parseInt(req.body.id)
    if (id == undefined || id == null || id == '') {
      return res.json({
        isok: false,
        message: "视频id不能为空"
      })
    }
    if (reviewUserId == undefined || reviewUserId == null || reviewUserId == '') {
      return res.json({
        isok: false,
        message: "审核人不能为空"
      })
    }
    const attachment = await prisma.basic_video_attachments.findFirst({
      where: {
        id
      }
    })
    if (attachment == null) {
      return res.json({
        isok: false,
        message: "视频id不存在"
      })
    }
    if (attachment.reviewedStatus != 0) {
      return res.json({
        isok: false,
        message: "审核状态不是待审核，不能进行审核操作"
      })
    }
    await prisma.basic_video_attachments.update({
      where: {
        id: id
      },
      data: {
        attachmentsStatus: 1,
        reviewedStatus: 1,
        reviewedAdminId: reviewUserId,
        reviewedTime: new Date()
      }
    });
    res.json({ isok: true, message: 'update video success' });
  });

  router.post('/review/no/pass', async (req, res) => {
    const { reviewUserId, reviewedCover, reviewedReason } = req.body;
    const id = parseInt(req.body.id)
    if (id == undefined || id == null || id == '') {
      return res.json({
        isok: false,
        message: "视频id不能为空"
      })
    }
    if (reviewUserId == undefined || reviewUserId == null || reviewUserId == '') {
      return res.json({
        isok: false,
        message: "审核人不能为空"
      })
    }
    if (reviewedReason == undefined || reviewedReason == null || reviewedReason == '') {
      return res.json({
        isok: false,
        message: "不通过原因不能为空"
      })
    }
    const attachment = await prisma.basic_video_attachments.findFirst({
      where: {
        id
      }
    })
    if (attachment == null) {
      return res.json({
        isok: false,
        message: "视频id不存在"
      })
    }
    if (attachment.reviewedStatus != 0) {
      return res.json({
        isok: false,
        message: "审核状态不是待审核，不能进行审核操作"
      })
    }
    await prisma.basic_video_attachments.update({
      where: {
        id: id
      },
      data: {
        attachmentsStatus: 2,
        reviewedStatus: 2,
        reviewedAdminId: reviewUserId,
        reviewedTime: new Date(),
        reviewedCover: reviewedCover
      }
    });
    res.json({ isok: true, message: 'update video success' });
  });

  router.post('/update/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    const attach = await prisma.basic_video_attachments.findFirst({
      where: {
        id: id
      }
    })
    if (attach == null) {
      return res.json({ isok: false, message: '视频文件id不正确' });
    } else {
      if (attach.reviewedStatus != 2 && attach.attachmentsStatus != 0) {
        return res.json({ isok: false, message: '视频文件是审核失败或者待审核才能重新编辑' });
      }
    }
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
    const message = await prisma.basic_video_attachments.update({
      where: {
        id: id,
      },
      data: {
        cFileName: name,
        cFileMemo: url,
        cFilePath: url,
        cUploader,
        cRepository: '/api/uploads/',
        reviewedStatus: 0,
        attachmentsStatus: 0,
      }
    }).then(() => 'BasicAttachments update');

    res.json({ isok: true, message });
  });
  router.delete('/delete/:cGuid', async (req, res) => {
    const message = await prisma.basic_video_attachments.delete({
      where: {
        cGuid: req.params.cGuid,
      },
    }).then(() => 'BasicAttachments deleted');

    res.json({ message });
  });

  router.delete('/deleteids', async (req, res) => {
    const { selected } = req.body;
    const message = await prisma.basic_video_attachments.delete({
      where: { cGuid: { hasSome: selected } },
    }).then(() => 'BasicAttachments deleted');

    res.json({ message });
  });

  return router;
})();

controller.prefix = '/apm/basicattachments';

export default controller;
