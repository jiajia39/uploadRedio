import { Router } from 'express';
import prisma from '../core/prisma';
import service from './service';
import catchAsync from '../utils/catchAsync';

var Decimal = require('decimal.js');
var moment = require('moment');
const controller = (() => {
  const router = Router();

  // Test Cron Purpose
  router.get(
    '/testCronService',
    catchAsync(async (req, res) => {
      await service.setMeterRecordingAndSave();
      res.json('save');
      // });
    }),
  );

  // Controller for GET Debug Test
  router.get(
    '/getMeterRecording',
    catchAsync(async (req, res) => {
      let { page, row, startDate, productLine } = req.query;
      const { id, cType, cPositionFk, cProductionLineFk, endDate } = req.query;
      let endTime;

      if (endDate == null || endDate == '') {
        endTime = new Date(
          new Date(moment().format('YYYY-MM-DD HH:mm:ss')).getTime() + 8 * 60 * 60 * 1000,
        );
      } else {
        endTime = new Date(
          new Date(moment(endDate).format('YYYY-MM-DD HH:mm:ss')).getTime() + 8 * 60 * 60 * 1000,
        );
      }

      if (startDate == null || startDate == '') {
        startDate = new Date(
          moment(endTime)
            .subtract(3, 'hours')
            .format('YYYY-MM-DD HH:mm:ss'),
        );
      } else {
        startDate = new Date(
          new Date(moment(startDate).format('YYYY-MM-DD HH:mm:ss')).getTime() + 8 * 60 * 60 * 1000,
        );
      }
      let meterIdsList = await service.getMeterId(
        id,
        cType,
        cPositionFk,
        cProductionLineFk,
        productLine,
      );
      let meterIds = [];
      meterIdsList.forEach(element => {
        meterIds.push(element.id);
      });
      const filter = {
        AND: {
          dRecordTime: { gte: startDate, lte: endTime },
          cMeterFk: { in: meterIds },
        },
      };

      page = Number(page) || 1;
      row = Number(row) || 5;
      const select = {
        id: true,
        dRecordTime: true,
        cRecordDate: true,
        cValue: true,
        cDiffValue: true,
        Pems_Meter: {
          select: {
            id: true,
            cName: true,
            cDesc: true,
          },
        },
      };
      const data = await prisma.Pems_MeterRecording.findMany({
        where: filter,
        select,
        skip: (page - 1) * row,
        take: row,
        orderBy: [
          {
            cMeterFk: 'asc',
          },
          {
            dRecordTime: 'asc',
          },
        ],
      });

      //获取meterId
      let meterIdList = [];
      console.log(filter);
      if (data != null && data.length > 0) {
        const count = await prisma.Pems_MeterRecording.count({
          where: filter,
        });
        const dataDiffSum = await prisma.Pems_MeterRecording.aggregate({
          where: filter,
          _sum: {
            cDiffValue: true,
          },
        });
        const totalEnergyConsumption = dataDiffSum._sum.cDiffValue;
        let feeSum = await prisma.Pems_MeterRecording.aggregate({
          where: filter,
          _sum: {
            cFeeValue: true,
          },
        });
        feeSum = feeSum._sum.cFeeValue;
        if (productLine == 'true' || (cProductionLineFk != null && cProductionLineFk != '')) {
          data.forEach(element => {
            element.productLine = true;
          });
        } else if (productLine == 'false' || (cPositionFk != null && cPositionFk != '')) {
          data.forEach(element => {
            element.productLine = false;
          });
        }
        res.json({
          data,
          total: count,
          totalEnergyConsumption: parseFloat(parseFloat(totalEnergyConsumption).toFixed(2)),
          feeSum: parseFloat(parseFloat(feeSum).toFixed(2)),
          message: 'Data obtained.',
        });
      } else {
        res.json({
          data: [],
          total: 0,
          totalEnergyConsumption: 0,
          feeSum: 0,
          message: 'Data Empty.',
        });
      }
    }),
  );

  return router;
})();

controller.prefix = '/pems/meterRecording';

export default controller;
