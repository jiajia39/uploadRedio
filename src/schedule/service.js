import meterValue from '../pems/service';
import prisma from '../core/prisma';

const CronJob = require('node-cron');

const getMeterPositions = async () => {
  const select = {
    id: true,
    cName: true,
    parentId: true,
    dAddTime: true,
    Pems_Meter: {
      select: {
        cName: true,
        cType: true,
        cDesc: true,
        dAddTime: true,
      },
    },
  };
  const data = await prisma.Pems_MeterPosition.findMany({ select });
  console.log(data);
};

exports.initScheduledJobs = () => {
  const scheduledJobFunction = CronJob.schedule('0 8,23 * * *', () => {
    console.log("I'm executed on a schedule!");
    meterValue.getMeterValueList();
    // Add your custom logic here
  });
  scheduledJobFunction.start();

  const scheduledJobOfPMR  = CronJob.schedule('56 16 * * *', () => {
    console.log("I'm executed on a schedule!");
    meterValue.getPemsMeterRecordingAndSave();
    // Add your custom logic here
  });
  scheduledJobOfPMR.start();
};

// exports.initScheduledJobs = () => {
//   const scheduledJobFunction = CronJob.schedule('56 16 * * *', () => {
//     console.log("I'm executed on a schedule!!!!!");
//     meterValue.getPemsMeterRecordingAndSave();
//   });
//   scheduledJobFunction.start();
// };
