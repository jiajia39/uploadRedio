import { InfluxDB, Point, flux } from '@influxdata/influxdb-client';
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

function getDaqValue(tagid, fromts, tots) {
  return new Promise(function(resolve, reject) {
    const query = flux`from(bucket: "${INFLUX_BUCKET}") |> range(start: ${new Date(
      fromts,
    )}, stop: ${new Date(tots)}) |> filter(fn: (r) => r._measurement == "${tagid}")`;

    try {
      const result = [];
      queryApi.queryRows(query, {
        next(row, tableMeta) {
          const o = tableMeta.toObject(row);
          result.push([new Date(o._time).getTime(), o._value]);
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

export default {
  getDaqValue,
};
