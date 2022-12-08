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
      let { page, row, startDate } = req.query;
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
      let meterIdsList = await service.getMeterId(id, cType, cPositionFk, cProductionLineFk);
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

      const count = await prisma.Pems_MeterRecording.count({
        where: filter,
      });
      //获取meterId
      let meterIdList = [];
      console.log(filter);
      if (data != null && data.length > 0) {
        data.forEach(element => {
          meterIdList.push(element.Pems_Meter.id);
        });
        meterIdList = [...new Set(meterIdList)];
        let list = [];
        // meterIdList.forEach(meterId => {
        for (let j = 0; j < meterIdList.length; j++) {
          let meterId = meterIdList[j];
          let ele = [];
          data.forEach(record => {
            if (record.Pems_Meter.id == meterId) {
              ele.push(record);
            }
          });
          let energyConsumption = null;
          for (let i = 0; i < ele.length; i++) {
            let meterRecord = ele[i];
            if (i == 0) {
              let time = new Date(
                moment(meterRecord.dRecordTime)
                  .subtract(1, 'hours')
                  .format('YYYY-MM-DD HH:mm:ss'),
              );
              const preFilter = {
                AND: {
                  dRecordTime: time,
                  cMeterFk: meterRecord.Pems_Meter.id,
                },
              };
              let recordingDate = await prisma.Pems_MeterRecording.findFirst({
                where: preFilter,
              });
              console.log(preFilter);
              if (recordingDate != null && recordingDate != '') {
                if (recordingDate.cValue != null) {
                  energyConsumption = new Decimal(meterRecord.cValue)
                    .sub(new Decimal(recordingDate.cValue))
                    .toNumber();
                }
              }
              list.push({ meterRecord, energyConsumption });
            } else {
              const predate = new Date(
                moment(meterRecord.dRecordTime)
                  .subtract(1, 'hour')
                  .format('YYYY-MM-DD HH:mm:ss'),
              ).getTime();

              if (new Date(ele[i - 1].dRecordTime).getTime() == predate) {
                energyConsumption = new Decimal(meterRecord.cValue)
                  .sub(new Decimal(ele[i - 1].cValue))
                  .toNumber();
                list.push({ meterRecord, energyConsumption });
              } else {
                list.push({ meterRecord, energyConsumption: null });
              }
            }
          }
        }
        // });
        // res.json(list);
        res.json({
          data: list,
          total: count,
          message: 'Data obtained.',
          productLine: true,
        });
      } else {
        res.json({
          data: [],
          total: count,
          message: 'Data Empty.',
        });
      }
    }),
  );

  return router;
})();

controller.prefix = '/pems/meterRecording';

export default controller;
