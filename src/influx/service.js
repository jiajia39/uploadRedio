import { InfluxDB, Point, flux, fluxDuration, fluxExpression } from '@influxdata/influxdb-client';
import { INFLUX_URL, INFLUX_TOKEN, INFLUX_ORG, INFLUX_BUCKET } from '~/env';

let client = null;
let clientOptions = null;
// let writeApi = null;
let queryApi = null;
const timeout = 30_000; // 30 seconds
clientOptions = {
  url: INFLUX_URL,
  // rejectUnauthorized: n.rejectUnauthorized,
  token: INFLUX_TOKEN,
  timeout,
};
client = new InfluxDB(clientOptions);
// writeApi = client.getWriteApi(INFLUX_ORG, INFLUX_BUCKET, 's');
queryApi = client.getQueryApi(INFLUX_ORG);

function getInfluxData(measurement, field, start, interval, queryType) {
  const startFormatted = fluxDuration(`${start}`);
  const intervalFormatted = fluxDuration(`${interval}`)
  const queryTypeFormatted = fluxExpression(`${queryType}`);
  return new Promise(function(resolve, reject) {
    const query = flux`from(bucket: ${INFLUX_BUCKET})
  |> range(start: ${startFormatted})
  |> filter(fn: (r) => r["_measurement"] == ${measurement})
  |> filter(fn: (r) => r["_field"] == ${field})
  |> aggregateWindow(every: ${intervalFormatted}, fn: ${queryTypeFormatted}, createEmpty: false)`;

  console.log(query);

    try {
      const result = [];
      queryApi.queryRows(query, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          let date = new Date(o._time);
          let dateFormatted = dateFmt('yyyy-MM-dd hh:mm:ss', date);
          result.push({
            time: dateFormatted,
            value: o._value,
          });
        },
        error(error) {
          reject(error);
        },
        complete() {
          resolve(result);
        },
      });
    } catch (error) {
      reject(error);
    }
  })
};

function dateFmt(fmt, date) {
  var o = {
    'M+': date.getMonth() + 1, //月份
    'd+': date.getDate(), //日
    'h+': date.getHours(), //小时
    'm+': date.getMinutes(), //分
    's+': date.getSeconds(), //秒
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度
    S: date.getMilliseconds(), //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length),
      );
  return fmt;
} 

export default {
  getInfluxData,
};
