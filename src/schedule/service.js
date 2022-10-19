import meterValue from '../pems/service';

const CronJob = require('node-cron');

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
