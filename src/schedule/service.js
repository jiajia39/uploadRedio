const CronJob = require('node-cron');
import prisma from '../core/prisma';

exports.initScheduledJobs = () => {
  const scheduledJobFunction = CronJob.schedule('*/1 * * * *', async res => {
    console.log("I'm executed on a schedule!");
    // Add your custom logic here
  });
  scheduledJobFunction.start();
};
