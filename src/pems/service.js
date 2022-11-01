import e from 'express';
import { forEach, reject } from 'lodash';
import prisma from '../core/prisma';
import influxservice from '../influx/service';
var Decimal = require('decimal.js');
var moment = require('moment');

async function setMeterValuesandSave() {
  const meters = await prisma.Pems_Meter.findMany();
  console.log('startig iteration.........');
  console.log(meters);
  for (let i = 0; i < meters.length; i++) {
    //从meter 中获取 measurement和field 来进行查询influxDb的数据
    const measurement = meters[i].cName + '-' + meters[i].cDesc;
    let cType = '';
    if (meters[i].cType == 'Electricity') {
      cType = 'EP';
    }
    if (meters[i].cType == 'Water' || meters[i].cType == 'Steam') {
      cType = 'TT';
    }
    const field = meters[i].cName + '.' + cType;
    const start = '-1h';
    const interval = '1h';
    const queryType = 'last';
    const dateTime = new Date(Date.now() + 8 * 60 * 60 * 1000);
    const time = new Date();
    const date = dateFmt(time, '');
    const cRecordType = isMorOrAft(time);
    // 查询infulxDb数据
    const result = await influxservice.getInfluxData(
      measurement,
      field,
      start,
      interval,
      queryType,
    );
    let influxValue = '';
    const valueLength = result.length;
    if (valueLength != 0) {
      const val = result[valueLength - 1].value;
      influxValue = parseFloat(val).toFixed(2);
    }
    const PemsMeterValuesDate = {
      cValue: parseFloat(influxValue),
      cRecordTime: dateTime,
      cRecordDate: date,
      cMerterFk: Number(meters[i].id),
      cRecordType,
      cRecorder: 'Test',
    };
    await prisma.Pems_MeterValues.create({
      data: PemsMeterValuesDate,
    });
  }
}

/**Baseline Version Do not use*/
// async function setMeterRecordingAndSave_Baseline() {
//   const meters = await prisma.Pems_Meter.findMany();
//   console.log('Meter Count:', meters.length);
//   // eslint-disable-next-line no-plusplus
//   for (let j = 0; j < meters.length; j++) {
//     //从meter 中获取 measurement和field 来进行查询influxDb的数据
//     const measurement = meters[j].cName + '-' + meters[j].cDesc;
//     console.log(measurement);
//     let cType = '';
//     if (meters[j].cType == 'Electricity') {
//       cType = 'EP';
//     }
//     if (meters[j].cType == 'Water' || meters[j].cType == 'Steam') {
//       cType = 'TT';
//     }
//     const field = meters[j].cName + '.' + cType;
//     let start = '-24h';
//     let interval = '1h';
//     const queryType = 'mean';
//     // 查询infulxDb数据
//     influxservice
//       .getInfluxData(measurement, field, start, interval, queryType)
//       .then(async result => {
//         let list = [];
//         let length = 0;
//         if (result.length > 24) {
//           length = result.length - 1;
//         } else {
//           length = result.length;
//         }
//         // 当前时间
//         const dateTime = new Date(Date.now() + 8 * 60 * 60 * 1000);
//         // console.log(`Length of Results for ${meters[j].id}:  ` + length);
//         if (result.length === 0) {
//           console.log(`No Influx Value for ${meters[j].id}`);
//           let date = this.dateFmt(new Date(), 1);
//           let listRes = this.gimePerHour(date);

//           listRes.forEach(gimePerHourTime => {
//             const endTime = new Date(new Date(gimePerHourTime).getTime() + 8 * 60 * 60 * 1000);

//             //开始时间
//             let startTime = new Date(new Date(gimePerHourTime).getTime() + 8 * 60 * 60 * 1000);
//             startTime = new Date(startTime.setHours(startTime.getHours() - 1));
//             list.push({
//               dStartTime: startTime,
//               dEndTime: endTime,
//               cRecordDate: dateTime,
//               cValue: null,
//               cMeterFk: Number(meters[j].id),
//             });
//           });
//         }

//         for (let i = 0; i < length; i++) {
//           //获取infulxDb的value
//           const value = result[i].value;
//           const influxValue = parseFloat(value).toFixed(2);
//           //结束时间
//           // console.log(result[i].time);
//           // console.log(new Date(result[i].time));
//           const endTime = new Date(new Date(result[i].time).getTime() + 8 * 60 * 60 * 1000);
//           //开始时间
//           let startTime = new Date(new Date(result[i].time).getTime() + 8 * 60 * 60 * 1000);
//           startTime = new Date(startTime.setHours(startTime.getHours() - 1));
//           // const PemsMeterRecording = {
//           //   dStartTime: startTime,
//           //   dEndTime: endTime,
//           //   cRecordDate: dateTime,
//           //   cValue: parseFloat(influxValue),
//           //   cMeterFk: Number(meters[j].id),
//           // };
//           list.push({
//             dStartTime: startTime,
//             dEndTime: endTime,
//             cRecordDate: dateTime,
//             cValue: parseFloat(influxValue),
//             cMeterFk: Number(meters[j].id),
//           });
//         }
//         if (list.length > 0) {
//           await prisma.Pems_MeterRecording.createMany({
//                 data: list,
//           })
//         }
//       })
//       .catch(error => {
//         reject(error);
//       })
//   }
// }

async function setMeterRecordingAndSave() {
  const meters = await prisma.Pems_Meter.findMany();
  console.log('Meter Count:', meters.length);
  // eslint-disable-next-line no-plusplus
  for (let j = 0; j < meters.length; j++) {
    //从meter 中获取 measurement和field 来进行查询influxDb的数据
    const measurement = meters[j].cName + '-' + meters[j].cDesc;
    console.log(measurement);
    let cType = '';
    if (meters[j].cType == 'Electricity') {
      cType = 'EP';
    }
    if (meters[j].cType == 'Water' || meters[j].cType == 'Steam') {
      cType = 'TT';
    }
    const field = meters[j].cName + '.' + cType;
    let start = '-24h';
    let interval = '1h';
    const queryType = 'mean';
    let list = [];
    // 查询infulxDb数据
    const influxData = await influxservice.getInfluxData(
      measurement,
      field,
      start,
      interval,
      queryType,
    );
    let length = 0;
    if (influxData.length > 24) {
      length = influxData.length - 1;
    } else {
      length = influxData.length;
    }
    // 当前时间
    const dateTime = new Date(Date.now() + 8 * 60 * 60 * 1000);
    if (influxData.length === 0) {
      console.log(`No Influx Value for ${meters[j].id}`);
      let date = this.dateFmt(new Date(), 1);
      let listRes = this.gimePerHour(date);

      listRes.forEach(gimePerHourTime => {
        const endTime = new Date(new Date(gimePerHourTime).getTime() + 8 * 60 * 60 * 1000);

        //开始时间
        let startTime = new Date(new Date(gimePerHourTime).getTime() + 8 * 60 * 60 * 1000);
        startTime = new Date(startTime.setHours(startTime.getHours() - 1));
        list.push({
          dStartTime: startTime,
          dEndTime: endTime,
          cRecordDate: dateTime,
          cValue: null,
          cMeterFk: Number(meters[j].id),
        });
      });
    }
    for (let i = 0; i < length; i++) {
      //获取infulxDb的value
      const value = influxData[i].value;
      const influxValue = parseFloat(value).toFixed(2);
      //结束时间
      const endTime = new Date(new Date(influxData[i].time).getTime() + 8 * 60 * 60 * 1000);
      //开始时间
      let startTime = new Date(new Date(influxData[i].time).getTime() + 8 * 60 * 60 * 1000);
      startTime = new Date(startTime.setHours(startTime.getHours() - 1));
      list.push({
        dStartTime: startTime,
        dEndTime: endTime,
        cRecordDate: dateTime,
        cValue: parseFloat(influxValue),
        cMeterFk: Number(meters[j].id),
      });
    }
    if (list.length > 0) {
      await prisma.Pems_MeterRecording.createMany({
        data: list,
      });
    }
  }
  console.log('Service Invoked');
}

/**
 * 根据条件查询meter的Id
 * @param {*} id meterId
 * @param {*} cType 类型
 * @param {*} cPositionFk PositionId
 * @returns meterId
 */
async function getMeterId(id, cType, cPositionFk) {
  const filter = { AND: [] };
  if (id) filter.AND.push({ id: parseInt(id) });
  if (cType) filter.AND.push({ cType });
  if (cPositionFk) filter.AND.push({ cPositionFk: parseInt(cPositionFk) });

  if (filter.AND.length < 1) {
    const data = await prisma.Pems_Meter.groupBy({ by: ['id'] });
    return data;
  } else {
    const data = await prisma.Pems_Meter.groupBy({
      where: filter,
      by: ['id'],
    });
    return data;
  }
}
/**Baseline Version Do not use*/
// /**
//  * 根据meterId和cRecordType 获取meterValue的数据
//  * @param {*} meterId meterId
//  * @param {*} cRecordType 班次
//  * @returns meterValue的数据
//  */
// async function getMeterValuesData(cRecordType, meterId) {
//   const filter = { AND: [] };
//   if (cRecordType) filter.AND.push({ cRecordType });
//   const select = {
//     cRecordTime: true,
//     cRecordDate: true,
//     cRecordType: true,
//     cValue: true,
//     cMerterFk: true,
//     Pems_Meter: {
//       select: {
//         id: true,
//         cName: true,
//       },
//     },
//   };
//   const list = [];

//   if (cRecordType != null) {
//     list.push({
//       cMerterFk: meterId,
//       cRecordType,

//       // cMerterFk: 199,
//     });
//   } else {
//     list.push({
//       cMerterFk: meterId,
//       // cMerterFk: 199,
//     });
//   }
//   let rstdata;
//   if (list.length != 0) {
//     rstdata = await prisma.Pems_MeterValues.findMany({
//       where: {
//         OR: list,
//       },
//       select,
//       orderBy: {
//         cRecordTime: 'asc',
//       },
//     });
//   } else {
//     rstdata = await prisma.Pems_MeterValues.findMany({
//       where: filter,
//       select,
//       orderBy: {
//         cRecordTime: 'asc',
//       },
//     });
//     // console.log('++++++++++++++++++++=------------' + rstdata);
//   }
//   return rstdata;
// }

/**
 * 根据meterId和cRecordType 获取meterValue的数据
 * @param {*} meterId meterId
 * @param {*} cRecordType 班次
 * @returns meterValue的数据
 */
async function getMeterValuesData(cRecordDate, cRecordType, meterIdList) {
  let meterIds = [];
  meterIdList.forEach(element => {
    meterIds.push(element.id);
  });

  const filter = { AND: [] };
  filter.AND = { ...filter.AND, cRecordDate: { in: cRecordDate } };
  filter.AND = { ...filter.AND, cMerterFk: { in: meterIds } };
  const select = {
    cRecordTime: true,
    cRecordDate: true,
    cRecordType: true,
    cValue: true,
    cMerterFk: true,
    Pems_Meter: {
      select: {
        id: true,
        cName: true,
      },
    },
  };
  const rstdata = await prisma.Pems_MeterValues.findMany({
    where: filter,
    select,
    orderBy: {
      cRecordTime: 'asc',
    },
  });
  return rstdata;
}

/**
 * 展示meterValue数据并计算每个班次耗能情况
 * @param {*} id meterId
 * @param {*} cType  类型
 * @param {*} cPositionFk  PositionId
 * @param {*} cRecordType 班次
 * @returns meterValue数据
 */
async function statisticalMeterData(id, cType, cPositionFk, cRecordDate, cRecordType) {
  let meterIdList = await getMeterId(id, cType, cPositionFk);

  const dateStr = moment(new Date()).format('YYYY-MM-DD');
  cRecordDate = new Date(moment(cRecordDate).format('YYYY-MM-DD'));
  let preDate = new Date(
    moment(cRecordDate)
      .subtract(1, 'days')
      .format('YYYY-MM-DD'),
  );
  const dateList = [];
  dateList.push(cRecordDate);
  dateList.push(preDate);
  console.log(cRecordDate + '--' + preDate);
  const meterValueDateList = await getMeterValuesData(dateList, null, meterIdList);
  console.log(',,,,,,,,,');
  console.log(meterValueDateList);
  let statisticalMeter = [];
  let totalEnergyConsumption = 0.0;
  for (let i = 0; i < meterIdList.length; i++) {
    let meterValueDate = [];
    if (meterValueDateList != null && meterValueDateList.length > 0) {
      meterValueDateList.forEach(element => {
        if (element.cMerterFk == meterIdList[i].id) {
          meterValueDate.push(element);
        }
      });
    }
    if (meterValueDate != null && meterValueDate.length > 0) {
      for (let i = 0; i < meterValueDate.length; i++) {
        if (new Date(cRecordDate).getTime() == meterValueDate[i].cRecordDate.getTime()) {
          if (meterValueDate[i].cRecordType == '晚班') {
            if (
              i != 0 &&
              meterValueDate[i - 1].cRecordDate.getTime() ==
                meterValueDate[i].cRecordDate.getTime() &&
              meterValueDate[i].cValue != null &&
              meterValueDate[i - 1].cValue != null
            ) {
              let value = new Decimal(meterValueDate[i].cValue)
                .sub(new Decimal(meterValueDate[i - 1].cValue))
                .toNumber();
              totalEnergyConsumption = new Decimal(totalEnergyConsumption)
                .add(new Decimal(value))
                .toNumber();
              statisticalMeter.push(
                Object.assign(
                  {},
                  meterValueDate[i],
                  { energyConsumption: value },
                  { totalEnergyConsumption: totalEnergyConsumption },
                ),
              );
            } else {
              statisticalMeter.push(
                Object.assign(
                  {},
                  meterValueDate[i],
                  { energyConsumption: '' },
                  { totalEnergyConsumption: totalEnergyConsumption },
                ),
              );
            }
          }
          if (meterValueDate[i].cRecordType == '白班') {
            if (i != 0) {
              //前一天的数据
              let date = meterValueDate[i].cRecordDate;
              let afterDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
              let cRecordDate = meterValueDate[i - 1].cRecordDate;
              if (
                cRecordDate.getTime() == afterDate.getTime() &&
                meterValueDate[i - 1].cRecordType == '晚班' &&
                meterValueDate[i].cValue != null &&
                meterValueDate[i - 1].cValue != null
              ) {
                let value = new Decimal(meterValueDate[i].cValue)
                  .sub(new Decimal(meterValueDate[i - 1].cValue))
                  .toNumber();
                totalEnergyConsumption = new Decimal(totalEnergyConsumption)
                  .add(new Decimal(value))
                  .toNumber();
                statisticalMeter.push(
                  Object.assign(
                    {},
                    meterValueDate[i],
                    { energyConsumption: value },
                    { totalEnergyConsumption: totalEnergyConsumption },
                  ),
                );
              } else {
                statisticalMeter.push(
                  Object.assign(
                    {},
                    meterValueDate[i],
                    { energyConsumption: '' },
                    { totalEnergyConsumption: totalEnergyConsumption },
                  ),
                );
              }
            } else {
              statisticalMeter.push(
                Object.assign(
                  {},
                  meterValueDate[i],
                  { energyConsumption: '' },
                  { totalEnergyConsumption: totalEnergyConsumption },
                ),
              );
            }
          }
        }
      }
    }
  }
  return statisticalMeter;
}

/**
 * 计算两个日期的耗能情况
 * @param {*} id meterId
 * @param {*} cType  类型
 * @param {*} cPositionFk  PositionId
 * @param {*} cRecordType 班次
 * @returns meterValue数据
 */
async function statisticalMeter(meterIdList, meterValueDateList, timeList) {
  let statisticalMeter = [];
  let totalEnergyConsumption = 0.0;
  //计算每周耗能情况
  if (meterValueDateList != null && meterValueDateList.length > 0) {
    for (let i = 0; i < meterIdList.length; i++) {
      for (let j = 1; j < timeList.length; j++) {
        let nowDate;
        let preDate;
        let meterValueDate;

        meterValueDateList.forEach(element => {
          if (element.cMerterFk == meterIdList[i].id) {
            if (element.cRecordDate.getTime() <= new Date(timeList[j].endSun).getTime()) {
              meterValueDate = element;
              console.log(element);
              if (element.cValue != null) {
                nowDate = element.cValue;
              }
            }
            if (
              element.cRecordDate.getTime() <= new Date(timeList[j - 1].endSun).getTime() &&
              element.cValue != null
            ) {
              preDate = element.cValue;
            }
          }
        });
        const date = timeList[j].startTime + '---' + timeList[j].endSun;
        let name;
        let energyConsumption = null;
        if (meterValueDate != null) {
          name = meterValueDate.Pems_Meter.cName;
        }
        if (preDate != null && nowDate != null) {
          console.log(nowDate);
          energyConsumption = new Decimal(nowDate).sub(new Decimal(preDate)).toNumber();
          totalEnergyConsumption = new Decimal(totalEnergyConsumption)
            .add(new Decimal(energyConsumption))
            .toNumber();
        }
        statisticalMeter.push({
          date,
          cname: name,
          energyConsumption,
          totalEnergyConsumption,
        });
      }
    }
  }
  return statisticalMeter;
}
/**
 * 按周计算Meter的耗能
 * @param {*} startWeek 开始时间
 * @param {*} endWeek 结束时间
 * @param {*} id meterID
 * @param {*} cType 类型
 * @param {*} cPositionFk poitionId
 * @param {*} cRecordType 班次
 * @returns meterValue的耗能信息
 */
async function statisticalMeterWeek(startWeek, endWeek, id, cType, cPositionFk, cRecordType) {
  //获取meter的数据
  let meterIdList = await getMeterId(id, cType, cPositionFk);
  if (meterIdList == null || meterIdList.length == 0) {
    return null;
  }
  let preDate = new Date(
    moment(startWeek)
      .subtract(1, 'days')
      .format('YYYY-MM-DD'),
  );
  let endDate = new Date(moment(endWeek).format('YYYY-MM-DD'));
  startWeek = new Date(moment(startWeek).format('YYYY-MM-DD'));
  let timeList = getMonAndSunDay(preDate, endDate);
  // let list = [preDate, endDate];
  //获取meterValue的数据
  let list = getAllDays(preDate, endDate);
  const meterValueDateList = await getMeterValuesData(list, null, meterIdList);
  return await statisticalMeter(meterIdList, meterValueDateList, timeList);
}
/**
 * 按月计算meterValue的耗能
 * @param {*} startWeek 开始时间
 * @param {*} endWeek 结束时间
 * @param {*} id meterID
 * @param {*} cType 类型
 * @param {*} cPositionFk poitionId
 * @param {*} cRecordType 班次
 * @returns meterValue的耗能信息
 */
async function statisticalMeterMon(startMonth, endMonth, id, cType, cPositionFk, cRecordType) {
  //获取meter的数据
  let meterIdList = await getMeterId(id, cType, cPositionFk);
  //获取开始时间上月1日的日期
  let preDate = moment(startMonth)
    .month(moment(startMonth).month() - 1)
    .startOf('month')
    .format('YYYY-MM-DD');

  let endDate = new Date(moment(endMonth).format('YYYY-MM-DD'));
  let list = getAllDays(preDate, endDate);
  console.log('==============');
  console.log(list);
  //获取meterValue的数据
  const meterValueDateList = await getMeterValuesData(list, null, meterIdList);

  // let startDate = meterValueDateList[0].cRecordDate;
  // let endDate = meterValueDateList[meterValueDateList.length - 1].cRecordDate;
  startMonth = new Date(moment(startMonth).format('YYYY-MM-DD'));

  let timeList = getStaAndEndMon(preDate, endDate);
  return await statisticalMeter(meterIdList, meterValueDateList, timeList);
}
/**
 * 获取开始结束时间 每个月份的月初、月末
 * @param {*} startDate 开始时间
 * @param {*} endDate 结束时间
 * @returns 日期
 */
function getStaAndEndMon(startDate, endDate) {
  startDate = moment(startDate);
  endDate = moment(endDate);
  const allYearMonth = []; // 接收所有年份和月份的数组
  while (endDate > startDate || startDate.format('M') === endDate.format('M')) {
    let start = startDate.format('YYYY-MM-01');
    let end = moment(start)
      .endOf('month')
      .format('YYYY-MM-DD');
    allYearMonth.push({
      startTime: start,
      endSun: end,
    });
    startDate.add(1, 'month');
  }
  return allYearMonth;
}
/**
 * 根据开始结束时间获取每周的周一和周日
 * @param {*} startDate 开始时间
 * @param {*} endTime 结束时间
 */
function getMonAndSunDay(startDate, endTime) {
  const StartWeekOfday = moment(startDate).format('E');
  const endWeekOfday = moment(endTime).format('E');
  //开始时间的周一
  const endTimeFor = moment(endTime).format('YYYYMMDD');
  const startMon = moment(startDate)
    .subtract(StartWeekOfday - 1, 'days')
    .format('YYYYMMDD');
  //周日
  const endSun = moment(endTime)
    .add(7 - endWeekOfday, 'days')
    .format('YYYYMMDD');
  let arr = [];
  let i = startMon;
  while (i <= endSun) {
    if (i == startMon) {
      //开始时间的周日
      const startSun = moment(startDate)
        .add(7 - StartWeekOfday, 'days')
        .format('YYYY-MM-DD');
      arr.push({
        startTime: moment(startDate).format('YYYY-MM-DD'),
        endSun: startSun,
      });
      i = moment(startSun)
        .add(1, 'days')
        .format('YYYYMMDD');

      continue;
    } else {
      let j = String(i);
      const startTime = j.slice(0, 4) + '-' + j.slice(4, 6) + '-' + j.slice(6, 8);
      const start = moment(startTime).format('E');
      const endSun = moment(startTime)
        .add(7 - start, 'days')
        .format('YYYY-MM-DD');
      i = moment(endSun)
        .add(1, 'days')
        .format('YYYYMMDD');
      if (i > endTimeFor) {
        arr.push({
          startTime,
          endSun: moment(endTime).format('YYYY-MM-DD'),
        });
        break;
      }
      arr.push({
        startTime,
        endSun,
      });
    }
  }
  return arr;
}
/**
 * 设置当前时间的格式yyyy-mm-dd
 * @param {*} date 日期
 * @returns yyyy-mm-dd
 */
function dateFmt(date, hour) {
  let year = date.getFullYear();
  let dateStr = year + '-';
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hours = date.getHours();
  if (month < 10) {
    dateStr = dateStr + '0' + month + '-';
  } else {
    dateStr = dateStr + month + '-';
  }
  if (day < 10) {
    dateStr = dateStr + '0' + day;
  } else {
    dateStr = dateStr + day;
  }
  if (hour == 1) {
    dateStr = dateStr + ' ' + hours + ':00:00';
  }
  return new Date(dateStr);
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
    resultArr.push(new Date(moment(tempTimestamp).format('YYYY-MM-DD')));
    // 增加一天
    tempTimestamp = moment(tempTimestamp)
      .add(1, 'd')
      .format('YYYYMMDD');
  }
  return resultArr;
}
/**
 * 获取日期前24小时每个小时的数据
 * @param {} date 日期
 * @returns
 */
function gimePerHour(date) {
  let timeList = [];
  timeList.push(date);
  for (let i = 0; i < 23; i++) {
    date = new Date(date.getTime() - 60 * 60 * 1000);
    timeList.push(date);
  }
  return timeList;
}
/**
 * 判断当前时间是上午还是下午
 * @param {*} date 日期
 */
function isMorOrAft(date) {
  let state = '';
  const hour = date.getHours();
  if (hour >= 5 && hour < 23) {
    state = `白班`;
  } else {
    state = `晚班`;
  }
  return state;
}
/**
 * 分页
 * @param {*} dateList 数据
 * @param {*} row  展示的行数
 * @param {*} page 展示的页数
 * @returns 数据
 */
function getPageDate(dateList, row, page) {
  let count = Number(dateList.length);
  let pageCount = 0;
  if (count % row == 0) {
    //取余计算总页数
    pageCount = count / row;
  } else {
    pageCount = count / row + 1;
  }
  let fromIndex = 0;
  let toIndex = 0;
  if (page != pageCount) {
    fromIndex = (Number(page) - 1) * Number(row); //从第几个数据开始查
    toIndex = Number(fromIndex) + Number(row);
  } else {
    fromIndex = (Number(page) - 1) * Number(row);
    toIndex = count;
  }
  console.log(fromIndex);
  console.log(row);
  console.log(toIndex);
  return dateList.slice(fromIndex, toIndex);
}

export default {
  setMeterValuesandSave,
  setMeterRecordingAndSave,
  isMorOrAft,
  dateFmt,
  gimePerHour,
  statisticalMeterData,
  getMeterValuesData,
  getMeterId,
  getMonAndSunDay,
  statisticalMeterWeek,
  statisticalMeterMon,
  getPageDate,
};
