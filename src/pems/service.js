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
    let start = '-2h';
    let interval = '1h';
    const queryType = 'mean';
    let dateTime = new Date(Date.now() + 8 * 60 * 60 * 1000);
    let time = new Date();
    let date = dateFmt(time);
    let cRecordType = isMorOrAft(time);
    influxservice
      .getInfluxData(measurement, field, start, interval, queryType)
      .then(async result => {
        const valueLength = result.length;
        const val = result[valueLength - 1].value;
        const PemsMeterValuesDate = {
          cValue: parseFloat(val),
          cRecordTime: dateTime,
          cRecordDate: date,
          cMerterFk: Number(eleItem.id),
          cRecordType,
          cRecorder: 'A',
        };
        await prisma.Pems_MeterValues.create({
          data: PemsMeterValuesDate,
        });
      });
  });
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
  if (hour >= 5 && hour <= 23) {
    state = `白天`;
  } else {
    state = `晚上`;
  }
  return state;
}

export default {
  getMeterValueList,
  isMorOrAft,
  dateFmt,
};
