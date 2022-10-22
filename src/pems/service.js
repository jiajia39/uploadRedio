import { reject } from 'lodash';
import prisma from '../core/prisma';
import influxservice from '../influx/service';

async function setMeterValuesandSave() {
  const meters = await prisma.Pems_Meter.findMany();
  console.log('startig iteration.........');
  console.log(meters);
  meters.forEach(eleItem => {
    //从meter 中获取 measurement和field 来进行查询influxDb的数据
    const measurement = eleItem.cName + '-' + eleItem.cDesc;
    let cType = '';
    if (eleItem.cType == 'Electricity') {
      cType = 'EP';
    }
    if (eleItem.cType == 'Water' || eleItem.cType == 'Steam') {
      cType = 'TT';
    }
    const field = eleItem.cName + '.' + cType;
    let start = '-1h';
    let interval = '1h';
    const queryType = 'last';
    let dateTime = new Date(Date.now() + 8 * 60 * 60 * 1000);
    let time = new Date();
    let date = dateFmt(time, '');
    let cRecordType = isMorOrAft(time);
    influxservice
      .getInfluxData(measurement, field, start, interval, queryType)
      .then(async result => {
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
          cMerterFk: Number(eleItem.id),
          cRecordType,
          cRecorder: 'Test',
        };
        await prisma.Pems_MeterValues.create({
          data: PemsMeterValuesDate,
        });
      })
      .catch(error => {
        reject(error);
      });
  });
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
};
