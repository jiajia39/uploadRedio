import meterValue from '../pems/service';
import energyService from '../pems/energy.service';
const CronJob = require('node-cron');

/**
 * Automatically Recording Meter Values Every Shift
 */
exports.initScheduledJobs = async function() {
  const hour = await meterValue.getShiftTime();
  if (hour != '') {
    const sch = `0 0 ${hour} * * * `;
    const scheduledJobFunction = CronJob.schedule(sch, () => {
      console.log("I'm executed on a schedule!");
      meterValue.setMeterValuesandSave();
      // Add your custom logic here
    });
    scheduledJobFunction.start();
  }

  // Meter Recording per Day to Store Meter's Hourly Data
  // const scheduledJobForPMR = CronJob.schedule('0 0 0 * * *', () => {
  //   console.log("I'm executed on a schedule!!!!!!!!");
  //   meterValue.setMeterRecordingAndSave();
  //   // Add your custom logic here
  // });
  // scheduledJobForPMR.start();

  /**
   * Automatically Recording Meter Daily Consumption
   */
  const scheduledJobForSaveDay = CronJob.schedule('0 20 0 * * *', () => {
    console.log('Automatically Recording Meter Daily Consumption');
    meterValue.saveReportDay();
    // Add your custom logic here
  });
  scheduledJobForSaveDay.start();

  /**
   * Automatically Recording Meter Weekly Consumption for History Week
   */
  const scheduledJobForSaveWeekHistory = CronJob.schedule('0 35 0 * * MON', () => {
    console.log('Automatically Recording Meter Weekly Consumption for History Week');
    meterValue.saveReoprtWeekHistory();
    // Add your custom logic here
  });
  scheduledJobForSaveWeekHistory.start();

  /**
   * Automatically Update Meter Weekly Consumption for Current Week
   */
  const scheduledJobForSaveCurrentWeek = CronJob.schedule('0 15 0 * * *', () => {
    console.log('Automatically Update Meter Weekly Consumption for Current Week');
    meterValue.saveReoprtCurrentWeek();
  });
  scheduledJobForSaveCurrentWeek.start();

  /**
   * Automatically Recording Meter Monthly Consumption for History Month
   */
  const scheduledJobForSaveMonHistory = CronJob.schedule('0 30 0 1 * *', () => {
    console.log('Automatically Recording Meter Monthly Consumption for History Month');
    meterValue.saveReoprtMonHistory();
    // Add your custom logic here
  });
  scheduledJobForSaveMonHistory.start();

  /**
   * Automatically Update Meter Monthly Consumption for Current Month
   */
  const scheduledJobForSaveCurrentMon = CronJob.schedule('0 25 0 * * *', () => {
    console.log('Automatically Update Meter Monthly Consumption for Current Month');
    meterValue.saveReoprtCurrentMon();
    // Add your custom logic here
  });
  scheduledJobForSaveCurrentMon.start();

  /**
   * Automatically record the cost of daily energy consumption
   */
  const scheduledJobForSaveEnergyFeeValues = CronJob.schedule('0 05 0 * * *', () => {
    console.log('Automatically record the cost of daily energy consumption');
    energyService.setEnergyFeeValuesAndSaveHistory();
  });
  scheduledJobForSaveEnergyFeeValues.start();

  /**
   * Automatically Recording Historical daily energy consumption
   */
  const scheduledJobForSaveDayHistory = CronJob.schedule('0 10 0 * * *', () => {
    console.log('Automatically Recording Historical daily energy consumption');
    meterValue.saveReoprtHistoryDay();
    // Add your custom logic here
  });
  scheduledJobForSaveDayHistory.start();
};
