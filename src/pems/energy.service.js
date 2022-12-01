import prisma from '../core/prisma';
import influxservice from '../influx/service';
var Decimal = require('decimal.js');
var moment = require('moment');

/**
 * 根据所传仪表以及能源费用类型关联查询计算能源费用
 * @param {*} meter 传入的仪表对象
 * @param {*} energyFeesEle  能源费率对象
 * @param {*} date 日期
 * @returns 所耗费用
 */
async function getEnergyFeeValues(meters, energyFeesEle, date) {
  let energyFeeValues = [];
  for (let me = 0; me < meters.length; me++) {
    let valueSum = null;
    const meter = meters[me];
    let influxDate;
    for (let en = 0; en < energyFeesEle.length; en++) {
      const fees = energyFeesEle[en];
      let cStartTime = fees.cStartTime;
      let price = fees.cPrice;
      const startTime = ' ' + cStartTime + ':00';
      const endTime = ' ' + fees.cEndTime + ':00';
      const start = new Date(
        moment(date + startTime)
          .subtract(1, 'hour')
          .format('YYYY-MM-DD  HH:mm:ss'),
      ).toISOString();
      const end = new Date(moment(date + endTime).format('YYYY-MM-DD  HH:mm:ss')).toISOString();
      let hour = parseInt(moment(end).diff(start, 'hours')) - 1 + 'h';
      const measurement = meter.cName + '-' + meter.cDesc;
      let cType = '';
      if (meter.cType == 'Electricity' || meter.cType == '电表') {
        cType = 'EP';
      }
      if (meter.cType == 'Water' || meter.cType == 'Steam' || meter.cType == '水表') {
        cType = 'TT';
      }
      const field = meter.cName + '.' + cType;
      let interval = hour;
      const queryType = 'last';
      // 查询infulxDb数据
      influxDate = await influxservice.getInfluxDifferenceData(
        measurement,
        field,
        start,
        end,
        interval,
        queryType,
      );

      if (influxDate != null && influxDate != '' && influxDate.length > 0) {
        let value = influxDate[0].value;
        // if (value != null && value != '') {
        //   console.log('/////');
        if (valueSum == null) {
          valueSum = 0;
        }
        if (value != null) {
          // value = parseFloat(value).toFixed(2);
          value = new Decimal(price).mul(new Decimal(value)).toNumber();

          valueSum = new Decimal(valueSum).add(new Decimal(value)).toNumber();
          valueSum = parseFloat(valueSum).toFixed(2);
        }
        // }
      }
    }
    energyFeeValues.push({
      cValue: parseFloat(valueSum),
      cRecordDate: new Date(date),
      cMeterFk: meter.id,
    });
  }
  return energyFeeValues;
}
/**
 * 获取并保存不同类型所耗费用
 * @param {*} date 日期
 */
async function saveValue(date) {
  await prisma.Pems_EnergyFeeValues.deleteMany({
    where: { cRecordDate: new Date(date) },
  });
  const energySubstituteList = await prisma.Pems_Energy_Substitute.findMany();
  let list;
  for (let i = 0; i < energySubstituteList.length; i++) {
    let energySubstitute = energySubstituteList[i];
    const energyFilter = { AND: {} };
    energyFilter.AND = {
      ...energyFilter.AND,
      cEnergySubstituteFk: energySubstitute.id,
    };
    const energyFeesList = await prisma.Pems_EnergyFees.findMany({
      where: energyFilter,
    });
    const pemsMeterList = await prisma.Pems_Meter.findMany({
      where: energyFilter,
    });
    list = await getEnergyFeeValues(pemsMeterList, energyFeesList, date);
    console.log(list);
    if (list != null && list.length > 0) {
      await prisma.Pems_EnergyFeeValues.createMany({
        data: list,
      });
    }
  }
}
/**
 * 保存历史每日耗能所需费用
 */
async function setEnergyFeeValuesAndSaveHistory() {
  const isExist = await prisma.Pems_EnergyFeeValues.findFirst();
  let date = moment()
    .subtract(1, 'day')
    .format('YYYY-MM-DD');
  if (isExist != null && isExist != '') {
    await saveValue(date);
  } else {
    let meterValue = await prisma.Pems_MeterValues.findMany({
      orderBy: {
        cRecordDate: 'asc',
      },
    });
    const start = moment(meterValue[0].cRecordDate).format('YYYY-MM-DD');
    const days = getAllDays(start, date);
    for (let i = 0; i < days.length; i++) {
      await saveValue(days[i]);
    }
    console.log('end');
  }
}
/**
 * 获取耗能所需要的费用
 * @param {*} meterIds meterId
 * @param {*} startDate 开始时间
 * @param {*} endDate 结束时间
 * @returns 费用
 */

async function getFeeSum(meterIds, startDate, endDate) {
  const filter = { AND: [] };
  let cRecordDate;
  //查询某天耗能
  if (endDate == null) {
    cRecordDate = new Date(moment(startDate).format('YYYY-MM-DD'));
    if (cRecordDate) filter.AND.push({ cRecordDate });
  } else {
    //查询某个时间段的耗能
    let start = new Date(moment(startDate).format('YYYY-MM-DD'));
    let end = new Date(moment(endDate).format('YYYY-MM-DD'));
    if (start) filter.AND.push({ cRecordDate: { gte: start } });
    if (end) filter.AND.push({ cRecordDate: { lte: end } });
  }
  if (meterIds) filter.AND.push({ cMeterFk: { in: meterIds } });
  const value = await prisma.Pems_EnergyFeeValues.aggregate({
    where: filter,
    _sum: {
      cValue: true,
    },
  });
  return parseFloat(value._sum.cValue).toFixed(2);
}

/**
 * 获取开始结束时间中每天的日期
 * @param {*} startDate 开始时间
 * @param {*} endDate 结束时间
 * @returns 日期
 */
function getAllDays(startDate, endDate) {
  let tempTimestamp = moment(startDate).format('YYYYMMDD');
  let endTimestamp = moment(endDate).format('YYYYMMDD');
  let resultArr = [];
  while (tempTimestamp <= endTimestamp) {
    resultArr.push(moment(tempTimestamp).format('YYYY-MM-DD'));
    // 增加一天
    tempTimestamp = moment(tempTimestamp)
      .add(1, 'd')
      .format('YYYYMMDD');
  }
  return resultArr;
}
export default {
  setEnergyFeeValuesAndSaveHistory,
  getFeeSum,
  getAllDays,
};
