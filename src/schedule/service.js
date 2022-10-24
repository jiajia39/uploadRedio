import meterValue from '../pems/service';

const CronJob = require('node-cron');

exports.initScheduledJobs = () => {
  const scheduledJobFunction = CronJob.schedule('0 0 5,23 * * * ', () => {
    console.log("I'm executed on a schedule!");
    meterValue.setMeterValuesandSave();
    // Add your custom logic here
  });
  scheduledJobFunction.start();

  const scheduledJobForPMR = CronJob.schedule('0 0 0 * * *', () => {
    console.log("I'm executed on a schedule!!!!!!!!");
    meterValue.setMeterRecordingAndSave();
    // Add your custom logic here
  });
  scheduledJobForPMR.start();
};
