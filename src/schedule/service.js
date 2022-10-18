const CronJob = require('node-cron');
import prisma from '../core/prisma';

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
  const scheduledJobFunction = CronJob.schedule('*/1 * * * *', res => {
    console.log("I'm executed on a schedule!");
    // Add your custom logic here
  });
  scheduledJobFunction.start();
};
