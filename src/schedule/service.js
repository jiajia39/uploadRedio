import meterValue from '../pems/service';

const CronJob = require('node-cron');

exports.initScheduledJobs = () => {
  const scheduledJobFunction = CronJob.schedule('17 8,13,20 * * *', () => {
    console.log("I'm executed on a schedule!");
    meterValue.getMeterValueList();
    // Add your custom logic here
  });
  scheduledJobFunction.start();
};
