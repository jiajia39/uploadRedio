import prisma from '../core/prisma';
import influxservice from '../influx/service';

async function getMeterValueList() {
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
    let start = '-12h';
    let interval = '1h';
    const queryType = 'mean';
    let dateTime = new Date(Date.now() + 8 * 60 * 60 * 1000);
    let time = new Date(Date.now());
    let date = dateFmt(time);
    let cRecordType = isMorOrAft(time);
    influxservice
      .getInfluxData(measurement, field, start, interval, queryType)
      .then(async result => {
        const valueLength = result.length;
        const val = result[valueLength - 1].value;
        const influxValue = parseFloat(val).toFixed(2);
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
      });
  });
}

async function getPemsMeterRecordingAndSave() {
  const meters = await prisma.Pems_Meter.findMany();
  // eslint-disable-next-line no-plusplus
  for (let j = 0; j < meters.length; j++) {
    //从meter 中获取 measurement和field 来进行查询influxDb的数据
    const measurement = meters[j].cName + '-' + meters[j].cDesc;
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
    // 查询infulxDb数据
    influxservice
      .getInfluxData(measurement, field, start, interval, queryType)
      .then(async result => {
        for (let i = 0; i < result.length; i++) {
          //获取infulxDb的value
          const value = result[i].value;
          const influxValue = parseFloat(value).toFixed(2);
          //结束时间
          console.log(result[i].time);
          console.log(new Date(result[i].time));
          const endTime = new Date(new Date(result[i].time).getTime() + 8 * 60 * 60 * 1000);
          // 当前时间
          const dateTime = new Date(Date.now() + 8 * 60 * 60 * 1000);
          //开始时间
          let startTime = new Date(new Date(result[i].time).getTime() + 8 * 60 * 60 * 1000);
          startTime = new Date(startTime.setHours(startTime.getHours() - 1));
          const PemsMeterRecording = {
            dStartTime: startTime,
            dEndTime: endTime,
            cRecordDate: dateTime,
            cValue: parseFloat(influxValue),
            cMeterFk: Number(meters[j].id),
          };
          console.log(PemsMeterRecording);
          await prisma.Pems_MeterRecording.create({
            data: PemsMeterRecording,
          });
        }
      });
  }
  console.log('|||||||||||||||||||Execution completed');
}
/**
 * 设置当前时间的格式yyyy-mm-dd
 * @param {*} date 日期
 * @returns yyyy-mm-dd
 */
function dateFmt(date) {
  let year = date.getFullYear();
  let dateStr = year + '-';
  let month = date.getMonth() + 1;
  let day = date.getDate();
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
  return new Date(dateStr);
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
    state = `白天`;
  } else {
    state = `晚上`;
  }
  return state;
}

export default {
  getMeterValueList,
  getPemsMeterRecordingAndSave,
  isMorOrAft,
  dateFmt,
};
