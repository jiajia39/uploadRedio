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

  const scheduledJobForSaveDay = CronJob.schedule('0 10 0 * * *', () => {
    console.log("I'm executed on a schedule!!!!!!!!");
    meterValue.saveReportDay();
    // Add your custom logic here
  });
  scheduledJobForSaveDay.start();
  const scheduledJobForSaveWeekHistory = CronJob.schedule('0 20 0 * * MON', () => {
    console.log("I'm executed on a schedule!!!!!!!!");
    meterValue.saveReoprtWeekHistory();
    // Add your custom logic here
  });
  scheduledJobForSaveWeekHistory.start();

  const scheduledJobForSaveCurrentWeek = CronJob.schedule('0 15 0 * * *', () => {
    console.log("I'm executed on a schedule!!!!!!!!");
    meterValue.saveReoprtCurrentWeek();
    // Add your custom logic here
  });
  scheduledJobForSaveCurrentWeek.start();

  const scheduledJobForSaveMonHistory = CronJob.schedule('0 30 0 1 * *', () => {
    console.log("I'm executed on a schedule!!!!!!!!");
    meterValue.saveReoprtMonHistory();
    // Add your custom logic here
  });
  scheduledJobForSaveMonHistory.start();

  const scheduledJobForSaveCurrentMon = CronJob.schedule('0 25 0 * * *', () => {
    console.log("I'm executed on a schedule!!!!!!!!");
    meterValue.saveReoprtCurrentMon();
    // Add your custom logic here
  });
  scheduledJobForSaveCurrentMon.start();
};
