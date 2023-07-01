import {
  InfluxDB,
  Point,
  flux,
  fluxDuration,
  fluxDateTime,
  fluxExpression,
  Log,
} from '@influxdata/influxdb-client';

// Init INFLUXDB configuration with defined env profile
const  INFLUX_URL  = process.env.INFLUX_URL;
const  INFLUX_TOKEN  = process.env.INFLUX_TOKEN;
const  INFLUX_ORG  = process.env.INFLUX_ORG;
const  INFLUX_BUCKET = process.env.INFLUX_BUCKET;

let client = null;
let clientOptions = null;
// let writeApi = null;
let queryApi = null;
const timeout = 120_000; // 30 seconds
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
  const intervalFormatted = fluxDuration(`${interval}`);
  const queryTypeFormatted = fluxExpression(`${queryType}`);
  return new Promise(function(resolve, reject) {
    const query = flux`from(bucket: ${INFLUX_BUCKET})
  |> range(start: ${startFormatted})
  |> filter(fn: (r) => r["_measurement"] == ${measurement})
  |> filter(fn: (r) => r["_field"] == ${field})
  |> aggregateWindow(every: ${intervalFormatted}, fn: ${queryTypeFormatted}, createEmpty: false)`;

    try {
      const result = [];
      queryApi.queryRows(query, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          // console.log(o);
          const date = new Date(o._time);
          const dateFormatted = dateFmt('yyyy-MM-dd hh:mm:ss', date);
          result.push({
            time: dateFormatted,
            value: o._value,
          });
        },
        error(error) {
          reject(error);
        },
        complete() {
          // value值按照时间正序排列
          result.sort(function(a, b) {
            return b.createTime < a.createTime ? -1 : 1;
          });
          resolve(result);
        },
      });
    } catch (error) {
      reject(error);
    }
  });
}
function getInfluxDataByTime(measurement, field, start, end, interval, queryType) {
  let startFormatted;
  let endFormatted;
  if (start.charAt(0) === '-') {
    startFormatted = fluxDuration(`${start}`);
  } else {
    startFormatted = fluxDateTime(`${start}`);
  }
  if (end != null && end != '') {
    if (end.charAt(0) === '-') {
      endFormatted = fluxDuration(`${end}`);
    } else {
      endFormatted = fluxDateTime(`${end}`);
    }
  }
  const intervalFormatted = fluxDuration(`${interval}`);
  const queryTypeFormatted = fluxExpression(`${queryType}`);
  return new Promise(function(resolve, reject) {
    let query;
    if (endFormatted == null) {
      query = flux`from(bucket: ${INFLUX_BUCKET})
  |> range(start: ${startFormatted})
  |> filter(fn: (r) => r["_measurement"] == ${measurement})
  |> filter(fn: (r) => r["_field"] == ${field})
  |> aggregateWindow(every: ${intervalFormatted}, fn: ${queryTypeFormatted}, createEmpty: false, offset:-8h)`;
    } else {
      query = flux`from(bucket: ${INFLUX_BUCKET})
      |> range(start: ${startFormatted},stop: ${endFormatted})
      |> filter(fn: (r) => r["_measurement"] == ${measurement})
      |> filter(fn: (r) => r["_field"] == ${field})
      |> aggregateWindow(every: ${intervalFormatted}, fn: ${queryTypeFormatted}, createEmpty: false, offset:-8h)`;
    }
    console.log(query);
    try {
      const result = [];
      queryApi.queryRows(query, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          const date = new Date(o._time);
          const dateFormatted = dateFmt('yyyy-MM-dd hh:mm:ss', date);
          result.push({
            time: dateFormatted,
            value: o._value,
          });
        },
        error(error) {
          reject(error);
        },
        complete() {
          // value值按照时间正序排列
          result.sort(function(a, b) {
            return b.createTime < a.createTime ? -1 : 1;
          });
          resolve(result);
        },
      });
    } catch (error) {
      reject(error);
    }
  });
}
function getInfluxDifferenceData(measurement, field, start, end, interval, queryType) {
  let startFormatted;
  let endFormatted;
  if (start.charAt(0) === '-') {
    startFormatted = fluxDuration(`${start}`);
  } else {
    startFormatted = fluxDateTime(`${start}`);
  }
  if (end != null && end != '') {
    if (end.charAt(0) === '-') {
      endFormatted = fluxDuration(`${end}`);
    } else {
      endFormatted = fluxDateTime(`${end}`);
    }
  }
  const intervalFormatted = fluxDuration(`${interval}`);
  const queryTypeFormatted = fluxExpression(`${queryType}`);
  return new Promise(function(resolve, reject) {
    let query;
    if (endFormatted == null) {
      query = flux`from(bucket: ${INFLUX_BUCKET})
  |> range(start: ${startFormatted})
  |> filter(fn: (r) => r["_measurement"] == ${measurement})
  |> filter(fn: (r) => r["_field"] == ${field})
  |> aggregateWindow(every: ${intervalFormatted}, fn: ${queryTypeFormatted}, createEmpty: false, offset:-8h)
  |> difference()`;
    } else {
      query = flux`from(bucket: ${INFLUX_BUCKET})
      |> range(start: ${startFormatted},stop: ${endFormatted})
      |> filter(fn: (r) => r["_measurement"] == ${measurement})
      |> filter(fn: (r) => r["_field"] == ${field})
      |> aggregateWindow(every: ${intervalFormatted}, fn: ${queryTypeFormatted}, createEmpty: false, offset:-8h)
      |> difference()`;
    }
    console.log(query);
    try {
      const result = [];
      queryApi.queryRows(query, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          const date = new Date(o._time);
          const dateFormatted = dateFmt('yyyy-MM-dd hh:mm:ss', date);
          result.push({
            time: dateFormatted,
            value: o._value,
          });
        },
        error(error) {
          reject(error);
        },
        complete() {
          // value值按照时间正序排列
          result.sort(function(a, b) {
            return b.createTime < a.createTime ? -1 : 1;
          });
          resolve(result);
        },
      });
    } catch (error) {
      reject(error);
    }
  });
}

function queryInfluxMeasurement() {
  return new Promise(function(resolve, reject) {
    let query;
    query = flux`import "influxdata/influxdb/schema"
                   schema.measurements(bucket: ${INFLUX_BUCKET})`;
    try {
      const result = [];
      queryApi.queryRows(query, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          result.push({
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
  });
}

function dateFmt(fmt, date) {
  const o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds(), // 毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, `${date.getFullYear()}`.substr(4 - RegExp.$1.length));
  for (const k in o)
    if (new RegExp(`(${k})`).test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length),
      );
  return fmt;
}

export default {
  getInfluxData,
  getInfluxDifferenceData,
  queryInfluxMeasurement,
  getInfluxDataByTime,
};
