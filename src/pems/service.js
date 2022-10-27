import { forEach, reject } from 'lodash';
import prisma from '../core/prisma';
import influxservice from '../influx/service';
var Decimal = require('decimal.js');

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
async function getMeterValuesData(cRecordType, meterIdList) {
  // const filter = { AND: [] };
  // if (cRecordType) filter.AND.push({ cRecordType });
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
  const list = [];
  meterIdList.forEach(meter => {
    if (cRecordType != null) {
      list.push({
        cMerterFk: meter.id,
        cRecordType,
      });
    } else {
      list.push({
        cMerterFk: meter.id,
      });
    }
  });

  let rstdata;
  rstdata = await prisma.Pems_MeterValues.findMany({
    where: {
      OR: list,
    },
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
async function statisticalMeterData(id, cType, cPositionFk, cRecordType) {
  let meterIdList = await getMeterId(id, cType, cPositionFk);
  const meterValueDateList = await getMeterValuesData(null, meterIdList);
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
            console.log(value);
            // console.log(meterValueDate[i].Pems_Meter.id);
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
              console.log(value);
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
  return statisticalMeter;
}
// /**
//  * 展示meterValue数据并计算每个班次耗能情况
//  * @param {*} id meterId
//  * @param {*} cType  类型
//  * @param {*} cPositionFk  PositionId
//  * @param {*} cRecordType 班次
//  * @returns meterValue数据
//  */
// async function statisticalMeterData(id, cType, cPositionFk, cRecordType) {
//   let meterIdList = await getMeterId(id, cType, cPositionFk);
//   let statisticalMeter = [];
//   let totalEnergyConsumption = 0.0;
//   for (let i = 0; i < meterIdList.length; i++) {
//     const meterValueDate = await getMeterValuesData(null, meterIdList[i].id);
//     if (meterValueDate != null && meterValueDate.length > 0) {
//       for (let i = 0; i < meterValueDate.length; i++) {
//         if (meterValueDate[i].cRecordType == '晚班') {
//           if (
//             i != 0 &&
//             meterValueDate[i - 1].cRecordDate.getTime() == meterValueDate[i].cRecordDate.getTime()
//           ) {
//             let value = new Decimal(meterValueDate[i].cValue)
//               .sub(new Decimal(meterValueDate[i - 1].cValue))
//               .toNumber();
//             totalEnergyConsumption = new Decimal(totalEnergyConsumption)
//               .add(new Decimal(value))
//               .toNumber();
//             statisticalMeter.push(
//               Object.assign(
//                 {},
//                 meterValueDate[i],
//                 { energyConsumption: value },
//                 { totalEnergyConsumption: totalEnergyConsumption },
//               ),
//             );
//           } else {
//             statisticalMeter.push(
//               Object.assign(
//                 {},
//                 meterValueDate[i],
//                 { energyConsumption: '' },
//                 { totalEnergyConsumption: totalEnergyConsumption },
//               ),
//             );
//           }
//         }
//         if (meterValueDate[i].cRecordType == '白班') {
//           if (i != 0) {
//             console.log(meterValueDate[i].cRecordDate);
//             //前一天的数据
//             let date = meterValueDate[i].cRecordDate;
//             let afterDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
//             let cRecordDate = meterValueDate[i - 1].cRecordDate;
//             if (
//               cRecordDate.getTime() == afterDate.getTime() &&
//               meterValueDate[i - 1].cRecordType == '晚班'
//             ) {
//               let value = new Decimal(meterValueDate[i].cValue)
//                 .sub(new Decimal(meterValueDate[i - 1].cValue))
//                 .toNumber();
//               console.log(value);
//               totalEnergyConsumption = new Decimal(totalEnergyConsumption)
//                 .add(new Decimal(value))
//                 .toNumber();
//               statisticalMeter.push(
//                 Object.assign(
//                   {},
//                   meterValueDate[i],
//                   { energyConsumption: value },
//                   { totalEnergyConsumption: totalEnergyConsumption },
//                 ),
//               );
//             } else {
//               statisticalMeter.push(
//                 Object.assign(
//                   {},
//                   meterValueDate[i],
//                   { energyConsumption: '' },
//                   { totalEnergyConsumption: totalEnergyConsumption },
//                 ),
//               );
//             }
//           } else {
//             statisticalMeter.push(
//               Object.assign(
//                 {},
//                 meterValueDate[i],
//                 { energyConsumption: '' },
//                 { totalEnergyConsumption: totalEnergyConsumption },
//               ),
//             );
//           }
//         }
//       }
//     }
//   }
//   return statisticalMeter;
// }
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
  console.log(hour);
  if (hour >= 5 && hour < 23) {
    state = `白班`;
  } else {
    state = `晚班`;
  }
  return state;
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
};
