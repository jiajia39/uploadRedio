import { Log } from '@influxdata/influxdb-client';
import prisma from '../core/prisma';
import influxservice from '../influx/service';
import energyService from './energy.service';

var Decimal = require('decimal.js');
var moment = require('moment');

async function setMeterValuesandSave() {
  const meters = await prisma.Pems_Meter.findMany();
  console.log('startig iteration.........');
  console.log(meters);
  const shiftDate = await prisma.Pems_Shift.findMany({
    where: {
      cDesc: '白班',
    },
  });
  for (let i = 0; i < meters.length; i++) {
    //从meter 中获取 measurement和field 来进行查询influxDb的数据
    const measurement = meters[i].cName + '-' + meters[i].cDesc;
    let cType = '';
    if (meters[i].cType == 'Electricity' || meters[i].cType == '电表') {
      cType = 'EP';
    }
    if (meters[i].cType == 'Water' || meters[i].cType == 'Steam' || meters[i].cType == '水表') {
      cType = 'TT';
    }
    const field = meters[i].cName + '.' + cType;
    const start = '-1h';
    const interval = '1h';
    const queryType = 'last';
    const dateTime = new Date(Date.now() + 8 * 60 * 60 * 1000);
    const time = new Date();
    const date = dateFmt(time, '');
    const cRecordType = await isMorOrAft(shiftDate, time);
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
      cMeterFk: Number(meters[i].id),
      cRecordType,
      cRecorder: 'Test',
    };
    await prisma.Pems_MeterValues.create({
      data: PemsMeterValuesDate,
    });
  }
  console.log('end');
}

async function setMeterRecordingAndSave() {
  const meters = await prisma.Pems_Meter.findMany();
  console.log('Meter Count:', meters.length);
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

/**
 * 根据meterId和cRecordType 获取meterValue的数据
 * @param {*} meterId meterId
 * @param {*} cRecordType 班次
 * @returns meterValue的数据
 */
async function getMeterReportingDayData(page, row, cRecordDate, meterIdList, cType, isAll) {
  let meterIds = [];
  meterIdList.forEach(element => {
    meterIds.push(element.id);
  });
  const filter = { AND: [] };
  if (cRecordDate) filter.AND = { ...filter.AND, cDate: { in: cRecordDate } };
  filter.AND = { ...filter.AND, cMeterFk: { in: meterIds } };
  page = Number(page) || 1;
  row = Number(row) || 5;
  const select = {
    cValue: true,
    cMeterFk: true,
    cDate: true,
    cRecordType: true,
    cMeterValue: true,
    Pems_Meter: {
      select: {
        id: true,
        cName: true,
        cDesc: true,
      },
    },
  };
  let rstdata;
  if (isAll == 1) {
    rstdata = await prisma.Pems_MeterReporting_Day.findMany({
      where: filter,
      select,
      orderBy: {
        cMeterFk: 'asc',
      },
    });
  } else {
    rstdata = await prisma.Pems_MeterReporting_Day.findMany({
      where: filter,
      select,
      skip: (page - 1) * row,
      take: row,
      orderBy: {
        cMeterFk: 'asc',
      },
    });
  }
  rstdata.forEach(element => {
    element.cDate = moment(element.cDate).format('YYYY-MM-DD');
  });

  const count = await prisma.Pems_MeterReporting_Day.count({
    where: filter,
  });
  let feeSum = null;
  let data = null;
  let dataSum = null;
  if (cType != null && cType != '') {
    data = await prisma.Pems_MeterReporting_Day.groupBy({
      by: ['cRecordType'],
      where: filter,
      _sum: {
        cValue: true,
      },
    });
    dataSum = await prisma.Pems_MeterReporting_Day.aggregate({
      where: filter,
      _sum: {
        cValue: true,
      },
    });
    feeSum = await energyService.getFeeSum(meterIds, cRecordDate, null);
  }
  const date = { rstdata, data, dataSum, count, feeSum };
  return date;
}
/**
 * 保存每天耗能
 */
async function saveReportDay() {
  const report = await prisma.Pems_MeterReporting_Day.findMany();
  let list;
  const now = new Date(moment().format('YYYY-MM-DD'));
  if (report == null || report == '') {
    list = await statisticalMeterData(null, null, null, null, null);
  } else {
    const preDate = new Date(
      moment()
        .subtract(1, 'days')
        .format('YYYY-MM-DD'),
    ).toISOString();
    console.log(preDate);
    list = await statisticalMeterData(null, null, null, preDate, null);
  }

  const dayList = [];
  if (list != null && list.length > 0) {
    for (let i = 0; i < list.length; i++) {
      const recordDate = new Date(list[i].cRecordDate).getTime();
      if (recordDate >= now.getTime()) {
        continue;
      }
      dayList.push({
        cValue: parseFloat(list[i].energyConsumption),
        cMeterFk: list[i].cMeterFk,
        cDate: list[i].cRecordDate,
        cMeterValue: list[i].cValue,
        cRecordType: list[i].cRecordType,
      });
    }
  }
  console.log(list);
  if (dayList != null && dayList != '' && dayList.length > 0) {
    await prisma.Pems_MeterReporting_Day.createMany({ data: dayList });
  }
}
/**
 * 保存历史每周耗能
 */
async function saveReoprtWeekHistory() {
  let report = await prisma.Pems_MeterReporting_Week.findMany();
  let list = [];
  let now = new Date(moment().format('YYYY-MM-DD'));
  if (report == null || report == '') {
    let meterValue = await prisma.Pems_MeterValues.findMany({
      orderBy: {
        cRecordDate: 'asc',
      },
    });
    if (meterValue != null && meterValue.length > 0) {
      let preDate = meterValue[0].cRecordDate;
      let weekOfDay = new Date().getDay();
      //上周周日
      let endDate = moment()
        .subtract(weekOfDay, 'days')
        .format('YYYY-MM-DD');
      console.log(endDate);
      let timeList = await this.getMonAndSunDayList(preDate, endDate);
      for (let i = 0; i < timeList.length; i++) {
        const startWeek = timeList[i].startTime;
        const endWeek = timeList[i].endSun;
        let data = await this.statisticalMeterWeek(startWeek, endWeek, null, null, null, null);
        if (data != null && data.length > 0) {
          let weekList = [];
          if (data != null && data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              weekList.push({
                cWeekStart: new Date(data[i].startTime),
                cWeekEnd: new Date(data[i].endTime),
                cValue: parseFloat(data[i].energyConsumption),
                cMeterFk: data[i].cMeterFk,
              });
            }
            await prisma.Pems_MeterReporting_Week.createMany({ data: weekList });
          }
        }
      }
    }
  } else {
    let weekOfDay = new Date().getDay();
    //上周周一
    let startWeek = moment()
      .subtract(weekOfDay + 6, 'days')
      .format('YYYY-MM-DD');
    //上周周日
    let endWeek = moment()
      .subtract(weekOfDay, 'days')
      .format('YYYY-MM-DD');

    let data = await this.statisticalMeterWeek(startWeek, endWeek, null, null, null, null);
    console.log(startWeek + '--' + endWeek);
    if (data != null && data.length > 0) {
      let weekList = [];
      for (let i = 0; i < data.length; i++) {
        weekList.push({
          cWeekStart: new Date(data[i].startTime),
          cWeekEnd: new Date(data[i].endTime),
          cValue: parseFloat(data[i].energyConsumption),
          cMeterFk: data[i].cMeterFk,
        });
      }
      if (weekList != null && weekList != '' && weekList.length > 0) {
        await prisma.Pems_MeterReporting_Week.deleteMany({
          where: { cWeekStart: new Date(startWeek) },
        });
        await prisma.Pems_MeterReporting_Week.createMany({ data: weekList });
      }
    }
  }
}

/**
 * 保存当周耗能 逻辑：如果当天是周一，cvalue=0，如果是其他日期  获取reportWeek表中当周的数据+ influx查询出的昨天的数据 得到value，更新reportWeek数据
 */
async function saveReoprtCurrentWeek() {
  let weekOfday = moment().format('E');
  const startMon = moment()
    .subtract(weekOfday - 1, 'days')
    .format('YYYY-MM-DD');
  const endSun = moment()
    .add(7 - weekOfday, 'days')
    .format('YYYY-MM-DD');
  const now = new Date(moment().format('YYYY-MM-DD'));
  //判断是否是周一
  if (moment().weekday() == 1) {
    let weekList = [];
    const meterIds = await getMeterId(null, null, null);
    if (meterIds != null && meterIds != '' && meterIds.length > 0) {
      meterIds.forEach(meterId => {
        weekList.push({
          cWeekStart: new Date(startMon),
          cWeekEnd: new Date(endSun),
          cValue: parseFloat(null),
          cMeterFk: meterId.id,
        });
      });
      await prisma.Pems_MeterReporting_Week.createMany({
        data: weekList,
      });
    }
  } else {
    let now = new Date(moment().format('YYYY-MM-DD 00:00:00')).toISOString();
    let preDate = new Date(
      moment()
        .subtract(2, 'days')
        .format('YYYY-MM-DD 00:00:00'),
    ).toISOString();
    const filter = { AND: [] };
    if (startMon) filter.AND = { ...filter.AND, cWeekStart: new Date(startMon) };
    const select = {
      id: true,
      cWeekStart: true,
      cWeekEnd: true,
      cValue: true,
      cMeterFk: true,
      Pems_Meter: {
        select: {
          id: true,
          cName: true,
          cDesc: true,
          cType: true,
        },
      },
    };
    const rstdata = await prisma.Pems_MeterReporting_Week.findMany({
      where: filter,
      select,
    });
    if (rstdata != null && rstdata != '' && rstdata.length > 0) {
      for (let i = 0; i < rstdata.length; i++) {
        let element = rstdata[i];
        let result = await getInfluxDifferenceData(preDate, null, element.Pems_Meter);
        if (result != null && result != null && result.length > 0) {
          let { value } = result[0];
          let cvalue = element.cValue;
          let energyConsumption;
          if (cvalue == null || cvalue == '') {
            if (value == null || value == '') {
              energyConsumption = null;
            } else {
              cvalue = 0;
              value = parseFloat(value).toFixed(2);
              energyConsumption = new Decimal(cvalue).add(new Decimal(value)).toNumber();
            }
          } else {
            value = parseFloat(value).toFixed(2);
            energyConsumption = new Decimal(cvalue).add(new Decimal(value)).toNumber();
          }
          rstdata[i].cValue = energyConsumption;
        }
        const data = {
          cValue: parseFloat(element.cValue),
          cMeterFk: Number(element.cMeterFk),
          cWeekStart: element.cWeekStart,
          cWeekEnd: element.cWeekEnd,
        };
        await prisma.Pems_MeterReporting_Week.update({
          where: { id: Number(element.id) },
          data,
        });
      }
    }
  }
}
/**
 * 保存每日历史耗能
 */
async function saveReoprtHistoryDay() {
  const meterList = await prisma.Pems_Meter.findMany();
  const preDate = new Date(
    moment()
      .subtract(2, 'days')
      .format('YYYY-MM-DD 00:00:00'),
  ).toISOString();
  const endDate = new Date(moment().format('YYYY-MM-DD 00:00:00')).toISOString();
  const date = new Date(
    moment()
      .subtract(1, 'day')
      .format('YYYY-MM-DD'),
  );

  let result = [];
  for (let i = 0; i < meterList.length; i++) {
    const influxResult = await getInfluxDifferenceData(preDate, endDate, meterList[i]);
    if (influxResult != null && influxResult.length > 0) {
      let { value } = influxResult[0];
      value = parseFloat(value).toFixed(2);
      result.push({
        cValue: parseFloat(value),
        cMeterFk: meterList[i].id,
        cDate: date,
      });
    } else {
      result.push({
        cValue: null,
        cMeterFk: meterList[i].id,
        cDate: date,
      });
    }
  }
  if (result != null && result.length > 0) {
    await prisma.Pems_MeterReportHistory_Day.createMany({ data: result });
  }
  console.log('end');
}

/**
 * 获取某天的耗能
 * @param {*} preDate 日期
 * @param {*} element meter的信息
 */
async function getInfluxDifferenceData(preDate, endDate, element) {
  const measurement = element.cName + '-' + element.cDesc;
  let cType = '';
  if (element.cType == 'Electricity' || element.cType == '电表') {
    cType = 'EP';
  }
  if (element.cType == 'Water' || element.cType == 'Steam' || element.cType == '水表') {
    cType = 'TT';
  }
  const field = element.cName + '.' + cType;
  const start = preDate;
  const interval = '24h';
  // const interval = '23d';
  const queryType = 'last';
  // 查询infulxDb数据
  const result = await influxservice.getInfluxDifferenceData(
    measurement,
    field,
    start,
    endDate,
    interval,
    queryType,
  );
  return result;
}

/**
 * 保存历史月份耗能
 */
async function saveReoprtMonHistory() {
  let start = new Date(moment().format('YYYY-MM-01'));
  //上月月末
  let endDate = new Date(
    moment(start)
      .subtract(1, 'days')
      .format('YYYY-MM-DD'),
  );

  let report = await prisma.Pems_MeterReporting_Month.findMany();
  let list = [];
  let now = new Date(moment().format('YYYY-MM-DD'));
  if (report == null || report == '') {
    let meterValue = await prisma.Pems_MeterValues.findMany({
      orderBy: {
        cRecordDate: 'asc',
      },
    });
    if (meterValue != null && meterValue.length > 0) {
      let preDate = meterValue[0].cRecordDate;
      preDate = new Date(moment(preDate).format('YYYY-MM-01'));
      let timeList = await this.getStaAndEndMon(preDate, endDate);
      for (let i = 0; i < timeList.length; i++) {
        const startMonth = timeList[i].startTime;
        const endMonth = timeList[i].endSun;
        let data = await this.statisticalMeterMon(startMonth, endMonth, null, null, null, null);
        if (data != null && data != '' && data.length > 0) {
          let monthList = [];
          if (data != null && data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              monthList.push({
                cMonthStart: new Date(data[i].startTime),
                cMonthEnd: new Date(data[i].endTime),
                cValue: parseFloat(data[i].energyConsumption),
                cMeterFk: data[i].cMeterFk,
              });
            }
            await prisma.Pems_MeterReporting_Month.createMany({ data: monthList });
          }
        }
      }
    }
  } else {
    //上月月初
    let startMonth = new Date(moment(endDate).format('YYYY-MM-01'));

    let data = await this.statisticalMeterMon(startMonth, endDate, null, null, null, null);
    if (data != null && data.length > 0) {
      let monthList = [];
      for (let i = 0; i < data.length; i++) {
        monthList.push({
          cMonthStart: new Date(data[i].startTime),
          cMonthEnd: new Date(data[i].endTime),
          cValue: parseFloat(data[i].energyConsumption),
          cMeterFk: data[i].cMeterFk,
        });
      }
      if (monthList != null && monthList != '' && monthList.length > 0) {
        await prisma.Pems_MeterReporting_Month.deleteMany({
          where: { cMonthStart: new Date(startMonth) },
        });
        await prisma.Pems_MeterReporting_Month.createMany({ data: monthList });
      }
    }
  }
}
/**
 * 保存当前月份耗能
 */
async function saveReoprtCurrentMon() {
  const newFor = new Date(moment().format('YYYY-MM-01'));
  const end = new Date(
    moment()
      .endOf('month')
      .format('YYYY-MM-DD'),
  );
  let now = new Date();
  let day = now.getDate();
  let monthList = [];
  if (Number(day) == 1) {
    //当前时间是月初 1号时，添加1号的数据月数据，并更新上月月末的数据
    //获取开始时间上月月末的日期
    const meterIds = await getMeterId(null, null, null);
    if (meterIds != null && meterIds != '' && meterIds.length > 0) {
      meterIds.forEach(meterId => {
        monthList.push({
          cMonthStart: new Date(newFor),
          cMonthEnd: new Date(end),
          cValue: parseFloat(null),
          cMeterFk: meterId.id,
        });
      });
      await prisma.Pems_MeterReporting_Month.createMany({
        data: monthList,
      });
    }
  } else {
    let preDate = new Date(
      moment()
        .subtract(2, 'days')
        .format('YYYY-MM-DD 00:00:00'),
    ).toISOString();
    let endDate = new Date(moment().format('YYYY-MM-DD 00:00:00')).toISOString();
    const filter = { AND: [] };
    if (newFor) filter.AND = { ...filter.AND, cMonthStart: new Date(newFor) };
    const select = {
      id: true,
      cMonthStart: true,
      cMonthEnd: true,
      cValue: true,
      cMeterFk: true,
      Pems_Meter: {
        select: {
          id: true,
          cName: true,
          cDesc: true,
          cType: true,
        },
      },
    };
    const rstdata = await prisma.Pems_MeterReporting_Month.findMany({
      where: filter,
      select,
    });
    if (rstdata != null && rstdata != '' && rstdata.length > 0) {
      for (let i = 0; i < rstdata.length; i++) {
        let result = await getInfluxDifferenceData(preDate, endDate, rstdata[i].Pems_Meter);
        if (result != null && result != null && result.length > 0) {
          let { value } = result[0];
          let energyConsumption;
          let cvalue = rstdata[i].cValue;
          if (cvalue == null || cvalue == '') {
            if (value == null || value == '') {
              energyConsumption = null;
            } else {
              cvalue = 0;
              value = parseFloat(value).toFixed(2);
              energyConsumption = new Decimal(cvalue).add(new Decimal(value)).toNumber();
            }
          } else {
            value = parseFloat(value).toFixed(2);
            energyConsumption = new Decimal(cvalue).add(new Decimal(value)).toNumber();
          }

          rstdata[i].cValue = energyConsumption;
        }
        const data = {
          cValue: parseFloat(rstdata[i].cValue),
          cMeterFk: Number(rstdata[i].cMeterFk),
          cMonthStart: rstdata[i].cMonthStart,
          cMonthEnd: rstdata[i].cMonthEnd,
        };
        await prisma.Pems_MeterReporting_Month.update({
          where: { id: Number(rstdata[i].id) },
          data,
        });
      }
    }
  }
}
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
  if (cRecordDate) filter.AND = { ...filter.AND, cRecordDate: { in: cRecordDate } };
  filter.AND = { ...filter.AND, cMeterFk: { in: meterIds } };
  const select = {
    cRecordTime: true,
    cRecordDate: true,
    cRecordType: true,
    cValue: true,
    cMeterFk: true,
    Pems_Meter: {
      select: {
        id: true,
        cName: true,
        cDesc: true,
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
  let dateList = [];
  if (cRecordDate == null || cRecordDate == '') {
    dateList = null;
  } else {
    const dateStr = moment(new Date()).format('YYYY-MM-DD');
    cRecordDate = new Date(moment(cRecordDate).format('YYYY-MM-DD'));
    let preDate = new Date(
      moment(cRecordDate)
        .subtract(1, 'days')
        .format('YYYY-MM-DD'),
    );
    dateList.push(cRecordDate);
    dateList.push(preDate);
  }
  const meterValueDateList = await getMeterValuesData(dateList, null, meterIdList);
  let statisticalMeter = [];
  let totalEnergyConsumption = 0.0;
  let totalEnergyConsumptionDay = 0.0;
  let totalEnergyConsumptionNight = 0.0;
  const shiftDate = await prisma.Pems_Shift.findMany();
  for (let i = 0; i < meterIdList.length; i++) {
    let meterValueDate = [];
    if (meterValueDateList != null && meterValueDateList.length > 0) {
      meterValueDateList.forEach(element => {
        if (element.cMeterFk == meterIdList[i].id) {
          meterValueDate.push(element);
        }
      });
    }
    if (meterValueDate != null && meterValueDate.length > 0) {
      for (let i = 0; i < meterValueDate.length; i++) {
        // if (
        //   i + 1 < meterValueDate.length &&
        //   meterValueDate[i].cRecordDate.getTime() == meterValueDate[i + 1].cRecordDate.getTime()
        // ) {
        //   continue;
        // }
        //获取前一天的数据
        if (cRecordDate != null) {
          if (meterValueDate[i].cRecordDate.getTime() == cRecordDate.getTime()) {
            statisticalMeter = await getAfterCalculationValues(
              i,
              shiftDate,
              statisticalMeter,
              totalEnergyConsumption,
              totalEnergyConsumptionDay,
              totalEnergyConsumptionNight,
              meterValueDate,
            );
            totalEnergyConsumption =
              statisticalMeter[statisticalMeter.length - 1].totalEnergyConsumption;
            totalEnergyConsumptionDay =
              statisticalMeter[statisticalMeter.length - 1].totalEnergyConsumptionDay;
            totalEnergyConsumptionNight =
              statisticalMeter[statisticalMeter.length - 1].totalEnergyConsumptionNight;
          }
        } else {
          statisticalMeter = await getAfterCalculationValues(
            i,
            shiftDate,
            statisticalMeter,
            totalEnergyConsumption,
            totalEnergyConsumptionDay,
            totalEnergyConsumptionNight,
            meterValueDate,
          );
          totalEnergyConsumption =
            statisticalMeter[statisticalMeter.length - 1].totalEnergyConsumption;
          totalEnergyConsumptionDay =
            statisticalMeter[statisticalMeter.length - 1].totalEnergyConsumptionDay;
          totalEnergyConsumptionNight =
            statisticalMeter[statisticalMeter.length - 1].totalEnergyConsumptionNight;
        }
      }
    }
  }
  return statisticalMeter;
}
/**
 * 获取每日能耗计算后的数据
 * @param {*} i 第几个数据
 * @param {*} statisticalMeter 计算后的meterValue值
 * @param {*} totalEnergyConsumption 总能耗
 * @param {*} meterValueDate 需要计算的statisticalMeter列表
 * @returns
 */
async function getAfterCalculationValues(
  i,
  shiftDate,
  statisticalMeter,
  totalEnergyConsumption,
  totalEnergyConsumptionDay,
  totalEnergyConsumptionNight,
  meterValueDate,
) {
  let preMeterValue = [];
  let energyConsumption = '';
  if (meterValueDate[i].cValue != null) {
    //判断如果是当天晚班数据 耗能计算 晚班数据-白班数据
    if (
      meterValueDate[i - 1] != null &&
      meterValueDate[i].cRecordDate.getTime() == meterValueDate[i - 1].cRecordDate.getTime() &&
      meterValueDate[i - 1].cValue != null
    ) {
      energyConsumption = new Decimal(meterValueDate[i].cValue)
        .sub(new Decimal(meterValueDate[i - 1].cValue))
        .toNumber();
      totalEnergyConsumption = new Decimal(totalEnergyConsumption)
        .add(new Decimal(energyConsumption))
        .toNumber();
      if (meterValueDate[i].cRecordType == '白班') {
        totalEnergyConsumptionDay = new Decimal(totalEnergyConsumptionDay)
          .add(new Decimal(energyConsumption))
          .toNumber();
      } else {
        totalEnergyConsumptionNight = new Decimal(totalEnergyConsumptionNight)
          .add(new Decimal(energyConsumption))
          .toNumber();
      }
    }
    //判断如果是当天白班数据 耗能计算 白班数据-昨天的数据
    else {
      meterValueDate.forEach(element => {
        let preDate = new Date(
          moment(meterValueDate[i].cRecordDate)
            .subtract(1, 'days')
            .format('YYYY-MM-DD'),
        );

        if (preDate.getTime() == element.cRecordDate.getTime() && element.cValue != null) {
          preMeterValue.push(element);
        }
      });
    }
    if (preMeterValue != null && preMeterValue != '') {
      let value = preMeterValue[preMeterValue.length - 1].cValue;
      energyConsumption = new Decimal(meterValueDate[i].cValue).sub(new Decimal(value)).toNumber();
      totalEnergyConsumption = new Decimal(totalEnergyConsumption)
        .add(new Decimal(energyConsumption))
        .toNumber();
      if (meterValueDate[i].cRecordType == '白班') {
        totalEnergyConsumptionDay = new Decimal(totalEnergyConsumptionDay)
          .add(new Decimal(energyConsumption))
          .toNumber();
      } else {
        totalEnergyConsumptionNight = new Decimal(totalEnergyConsumptionNight)
          .add(new Decimal(energyConsumption))
          .toNumber();
      }
    }
  }
  //获取日期
  let shiftTime;
  shiftDate.forEach(element => {
    if (element.cDesc == meterValueDate[i].cRecordType) {
      shiftTime = element.cStartTime + '---' + element.cEndTime;
    }
  });
  let cDate = meterValueDate[i].cRecordDate;
  statisticalMeter.push(
    Object.assign(
      {},
      meterValueDate[i],
      { cDate },
      { shiftTime },
      { totalEnergyConsumption },
      { energyConsumption },
      { totalEnergyConsumptionDay },
      { totalEnergyConsumptionNight },
    ),
  );
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
          if (element.cMeterFk == meterIdList[i].id) {
            if (element.cRecordDate.getTime() <= new Date(timeList[j].endSun).getTime()) {
              meterValueDate = element;
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
        let desc;
        let meterFk;
        let energyConsumption = null;
        if (meterValueDate != null) {
          name = meterValueDate.Pems_Meter.cName;
          desc = meterValueDate.Pems_Meter.cDesc;
          meterFk = meterValueDate.Pems_Meter.id;
        }
        if (preDate != null && nowDate != null) {
          energyConsumption = new Decimal(nowDate).sub(new Decimal(preDate)).toNumber();
          totalEnergyConsumption = new Decimal(totalEnergyConsumption)
            .add(new Decimal(energyConsumption))
            .toNumber();
        }
        statisticalMeter.push({
          startTime: timeList[j].startTime,
          endTime: timeList[j].endSun,
          cMeterFk: meterFk,
          date,
          cDesc: desc,
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
  //获取上周周日的日期
  let preDate = new Date(
    moment(startWeek)
      .subtract(1, 'days')
      .format('YYYY-MM-DD'),
  );
  let endDate = new Date(moment(endWeek).format('YYYY-MM-DD'));
  startWeek = new Date(moment(startWeek).format('YYYY-MM-DD'));
  let timeList = getMonAndSunDayList(preDate, endDate);
  let list = [preDate, endDate];
  //获取meterValue的数据
  // let list = getAllDays(preDate, endDate);
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

  //获取开始时间上月月末的日期
  let preDate = new Date(
    moment(startMonth)
      .month(moment(startMonth).month() - 1)
      .endOf('month')
      .format('YYYY-MM-DD'),
  );

  let endDate = new Date(moment(endMonth).format('YYYY-MM-DD'));
  // let list = getAllDays(preDate, endDate);
  let list = [preDate, endDate];
  //获取meterValue的数据
  const meterValueDateList = await getMeterValuesData(list, null, meterIdList);
  console.log('-----');
  console.log(meterValueDateList);
  // let startDate = meterValueDateList[0].cRecordDate;
  // let endDate = meterValueDateList[meterValueDateList.length - 1].cRecordDate;
  startMonth = new Date(moment(startMonth).format('YYYY-MM-DD'));

  let timeList = getStaAndEndMon(preDate, endDate);
  return await statisticalMeter(meterIdList, meterValueDateList, timeList);
}

async function getShiftTime() {
  const date = await prisma.Pems_Shift.findMany();
  let hour = '';
  if (date != null) {
    for (let i = 0; i < date.length; i++) {
      if (i < date.length - 1) {
        hour = hour + parseInt(date[i].cStartTime.substring(0, 2)) + ',';
      } else {
        hour = hour + parseInt(date[i].cStartTime.substring(0, 2));
      }
    }
  }
  return hour;
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
function getMonAndSunDayList(startDate, endTime) {
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
 * 获取某天的周一和周日
 * @param {*} date 时间
 */
function getMonAndSunDay(date) {
  let list = [];
  const weekOfday = moment(date).format('E');
  //开始时间的周一
  const startMon = moment(date)
    .subtract(weekOfday - 1, 'days')
    .format('YYYY-MM-DD');
  //周日
  const endSun = moment(date)
    .add(7 - weekOfday, 'days')
    .format('YYYY-MM-DD');
  list.push({ startMon, endSun });
  return list;
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
async function isMorOrAft(shiftDate, date) {
  const data = new Date(moment(date).format('YYYY-MM-DD  HH:mm:ss'));
  const dateFor = moment(date).format('YYYY-MM-DD');
  let state = '';
  const start = dateFor + ' ' + shiftDate[0].cStartTime + ':00';

  const startTime = new Date(start).getTime();
  const end = dateFor + ' ' + shiftDate[0].cEndTime + ':00';
  const endTime = new Date(end).getTime();
  if (data.getTime() >= startTime && data.getTime() < endTime) {
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
  getMonAndSunDayList,
  getMonAndSunDay,
  statisticalMeterWeek,
  statisticalMeterMon,
  getPageDate,
  getMeterReportingDayData,
  getStaAndEndMon,
  saveReportDay,
  saveReoprtWeekHistory,
  saveReoprtCurrentWeek,
  saveReoprtMonHistory,
  saveReoprtCurrentMon,
  getInfluxDifferenceData,
  getShiftTime,
  saveReoprtHistoryDay,
};
