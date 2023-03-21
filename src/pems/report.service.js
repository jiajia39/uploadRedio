import xlsx from 'node-xlsx';
import energyService from './energy.service';
import prisma from '../core/prisma';

const moment = require('moment');
const fs = require('fs');

/**
 * 生成excel并插入数据
 * @param {*} data 需要插入excel的数据
 */
function writexls(data) {
  const colConf = { '!cols': [{ wch: 10 }, { wch: 15 }, { wch: 70 }, { wch: 25 }, { wch: 25 }] };
  const buffer = xlsx.build([{ name: 'shell1', data }], { sheetOptions: colConf });
  const nowDate = moment()
    .subtract(1, 'day')
    .format('YYYY-MM-DD');

  const path = `${'c:excel/' + '读数统计'}${nowDate}.xlsx`;
  const dir = 'c:excel/';
  // 判断目录c:excel/是否存在如果不存在创建
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  // 创建并写入数据
  fs.writeFileSync(path, buffer, { flag: 'w' });
}
/**
 * 获取前一天的报表数据生成excel并保存到对应的位置
 */
async function exportExcel() {
  const nowFor = moment().format('YYYY-MM-DD 00:00');
  const preFor = moment()
    .subtract(1, 'day')
    .format('YYYY-MM-DD 00:00');
  const preTime = new Date(
    moment()
      .subtract(1, 'day')
      .format('YYYY-MM-DD 00:00:00'),
  );
  const nowTime = new Date(moment().format('YYYY-MM-DD 00:00:00'));
  const data = await prisma.$queryRaw` select meter.cName,meter.cType,meter.cDesc, (select top(1) cValue from Pems_MeterRecording record where record.cMeterFk=meter.id and record.dRecordTime =${preTime} ) as pre_value,
  (select top(1) cValue from Pems_MeterRecording record where record.cMeterFk=meter.id and record.dRecordTime =${nowTime} ) as value,PMRHD.cValue
from Pems_Meter meter
left join Pems_MeterReportHistory_Day PMRHD on meter.id = PMRHD.cMeterFk and cDate=${preTime} 
order by  meter.cType asc  `;
  const end = `${nowFor} 读数`;
  const sta = `${preFor} 读数`;
  const dataList = [];
  const title = ['名称', '类型', '描述', sta, end, '差值'];
  dataList.push(title);
  data.forEach(element => {
    const arrinner = [];
    arrinner.push(element.cName);
    arrinner.push(element.cType);
    arrinner.push(element.cDesc);
    arrinner.push(element.pre_value);
    arrinner.push(element.value);
    arrinner.push(element.cValue);
    dataList.push(arrinner);
  });
  writexls(dataList);
}
/**
 * 每月抄表记录(每月抄一次)
 */
async function getMonEnergyConsumption() {
  const preDay = moment()
    .date(1)
    .format('YYYY-MM-DD');

  const prePreDay = moment(preDay)
    .subtract(1, 'months')
    .date(1)
    .format('YYYY-MM-DD');
  const predate = moment(prePreDay)
    .date(1)
    .format('YYYY-MM');
  const data = await prisma.$queryRaw` exec [dbo].[report_Month_Energy_Consumption] ${prePreDay},${preDay}`;
  const dataList = [];
  dataList.push(['每月抄表记录(每月抄一次)']);
  dataList.push([predate]);
  const prePre = `${prePreDay}表数`;
  const pre = `${preDay}表数`;

  const preMon = moment(predate).month();
  const diffVal = `${Number(preMon) + 1}月用电数`;
  const title = ['序号', '抄表地点', '位置', '名称', '倍率', prePre, pre, diffVal];
  dataList.push(title);
  let ind = 0;
  data.forEach(element => {
    const arrinner = [];
    ind += 1;
    arrinner.push(ind);
    arrinner.push(element.postionName);
    arrinner.push(element.cDesc);
    arrinner.push(element.cName);
    arrinner.push(element.multiplier);
    arrinner.push(element[prePreDay]);
    arrinner.push(element[preDay]);
    let diff = null;
    if (element[prePreDay] != null && element[preDay] != null) {
      diff = Number(element[preDay]) - Number(element[prePreDay]);
    }
    arrinner.push(diff);
    dataList.push(arrinner);
  });
  return { dataList, data };
}

/**
 * 上月仪器每日用电量
 */
async function monthExportExcel() {
  // 获取上月的第一天和最后一天
  const firstDay = moment()
    .subtract(1, 'months')
    .date(1)
    .format('YYYY-MM-DD');
  const DateMon = moment()
    .subtract(1, 'months')
    .date(1)
    .format('YYYY-MM');
  const endDay = moment(firstDay)
    .endOf('month')
    .format('YYYY-MM-DD');
  const month = moment(firstDay).month() + 1;
  const year = moment(firstDay).year();
  const yearMonth = `${year}年${month}月`;
  const days = await energyService.getAllDays(firstDay, endDay);
  let dayStr = '';
  days.forEach(element => {
    if (days[days.length - 1] == element) {
      dayStr += `[${element}]`;
    } else {
      dayStr += `[${element}]` + `,`;
    }
  });
  const data = await prisma.$queryRaw` exec [dbo].[report_Month] ${firstDay},${endDay}
  `;

  const dataList = [];
  // dataList.push([yearMonth]);
  const title = [
    '名称',
    '描述',
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '30',
    '31',
    'Total',
  ];
  dataList.push([DateMon]);
  dataList.push(title);
  let sumAll = 0;
  data.forEach(element => {
    const arrinner = [];
    arrinner.push(element.cName);
    arrinner.push(element.cDesc);
    let value = 0;
    days.forEach(day => {
      if (element[day] == undefined) {
        element[day] = null;
      } else {
        value += element[day];
      }
      arrinner.push(element[day]);
    });
    arrinner.push(value);
    sumAll += value;
    dataList.push(arrinner);
  });
  const dateSum = await prisma.$queryRaw`select day.cDate as ccDate, sum(cValue) as sumValue
   from Pems_Meter meter
            left join Pems_MeterReportHistory_Day day on day.cMeterFk = meter.id
    where cDate >= ${firstDay}
     and cDate <= ${endDay}
   group by day.cDate order by  day.cDate`;
  const arr = [];
  arr.push(null);
  arr.push('每日用量 Total');
  days.forEach(day => {
    let num = 0;
    dateSum.forEach(sum => {
      const date1 = moment(sum.ccDate).format('YYYY-MM-DD');
      if (date1.toString() == day.toString()) {
        arr.push(sum.sumValue);
        num = 1;
      }
    });
    if (num == 0) {
      arr.push(null);
    }
  });
  arr.push(sumAll);
  dataList.push(arr);
  // console.log(dataList[1]);
  return dataList;
}
/**
 * 保存每月耗能数据excel
 */
async function saveExcel() {
  const Excel = require('exceljs');
  const workbook = new Excel.Workbook();
  // 标签创建
  const worksheet = workbook.addWorksheet('上月仪器每日用电量');
  // 带颜色的
  const worksheet2 = workbook.addWorksheet('每月抄表记录(每月抄一次)', {
    properties: {
      tabColor: {
        argb: 'FFC0000',
      },
    },
  });
  const data = await this.monthExportExcel();

  worksheet.addRows(data);
  // ===== 字体显示
  worksheet.getCell('A1').font = {
    // 字体名
    name: 'Comic Sans MS',
    // Font family for fallback. An integer value.
    family: 4,
    // 字体大小
    size: 16,
    // // 下划线
    // underline: true,
    // 加粗
    bold: true,
  };
  // 设置背景色
  worksheet.getRow(2).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '8DB4E2' },
  };

  const sheetLength = data.length;
  worksheet.getRow(sheetLength).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '8DB4E2' },
  };

  for (let j = 3; j <= 34; j++) {
    worksheet.getColumn(j).width = 10;
    worksheet.getColumn(j).alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };
  }

  // //行高
  // worksheet.getRows(1, 553).height = 30;
  worksheet.getRow('2').font = {
    // 字体大小
    size: 14,
  };
  worksheet.getRow(sheetLength).font = {
    // 字体大小
    size: 14,
  };
  // worksheet.getCell('A3').value = '测试字体';

  // ==== 对齐方式
  worksheet.getCell('A1').alignment = {
    vertical: 'top',
    horizontal: 'left',
  };
  worksheet.getCell('B1').alignment = {
    vertical: 'middle',
    horizontal: 'center',
  };
  worksheet.getCell('C1').alignment = {
    vertical: 'bottom',
    horizontal: 'right',
  };
  worksheet.getColumn(1).width = 12;
  worksheet.getColumn(2).width = 70;
  // ===== 边框
  worksheet.getRow('2').border = {
    top: {
      style: 'double',
    },
    left: {
      style: 'thin',
    },
    bottom: {
      style: 'thin',
    },
    right: {
      style: 'thin',
    },
  };

  // worksheet2

  const data2 = await this.getMonEnergyConsumption();
  worksheet2.addRows(data2.dataList);
  // // 合并单元格
  const dateInfo = data2.data;
  if (dateInfo != null && dateInfo.length > 0) {
    let name = dateInfo[0].postionName;
    let index = 4;
    let sum = 4;
    for (let i = 1; i < dateInfo.length; i++) {
      if (name == dateInfo[i].postionName) {
        if (i == dateInfo.length - 1) {
          name = dateInfo[i - 1].postionName;
          sum += 1;
          const col = `B${index}:B${sum}`;
          worksheet2.mergeCells(col);
          continue;
        }
        sum += 1;
      } else {
        name = dateInfo[i].postionName;
        const col = `B${index}:B${sum}`;
        console.log(col);
        worksheet2.mergeCells(col);
        index = sum + 1;
        sum += 1;
      }
    }
  }
  // 列宽
  worksheet2.getColumn(2).width = 20;
  worksheet2.getColumn(3).width = 70;
  worksheet2.getColumn(4).width = 16;
  worksheet2.getColumn(6).width = 20;
  worksheet2.getColumn(7).width = 20;
  worksheet2.getColumn(8).width = 18;
  // 行高
  worksheet2.getRow(3).height = 25;
  worksheet2.getColumn('B').alignment = {
    vertical: 'middle',
    horizontal: 'center',
  };
  // 设置背景色

  worksheet2.getRow(3).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '8DB4E2' },
  };
  worksheet2.getCell('A1').font = {
    // 字体名
    name: 'Comic Sans MS',
    // Font family for fallback. An integer value.
    family: 4,
    // 字体大小
    size: 16,
    // // 下划线
    // underline: true,
    // 加粗
    bold: true,
  };
  worksheet2.getCell('A2').font = {
    // Font family for fallback. An integer value.
    family: 4,
    // 字体大小
    size: 10,
    // // 下划线
    // underline: true,
    // 加粗
    bold: true,
  };
  worksheet2.getRow('3').font = {
    // Font family for fallback. An integer value.
    family: 4,
    // 字体大小
    size: 14,
    // // 下划线
    // underline: true,
    // 加粗
    bold: true,
  };
  // ===== 边框
  worksheet2.getRow('3').border = {
    top: {
      style: 'double',
    },
    left: {
      style: 'thin',
    },
    bottom: {
      style: 'thin',
    },
    right: {
      style: 'thin',
    },
  };
  const moment = require('moment');
  // 直接创建一个Excel表
  const nowDate = moment()
    .subtract(1, 'month')
    .format('YYYY-MM');
  const path = './uploads/' + '读数统计' + `${nowDate}.xlsx`;
  workbook.xlsx.writeFile(path).then(function() {
    // console.log('saved');
  });
}
async function getEchartByProductionLine() {
  // 前一天数据
  const preDate = new Date(
    moment()
      .subtract(1, 'days')
      .format('YYYY-MM-DD'),
  );
  // 主配进线
  const data = await prisma.$queryRaw`select sum(value) as value,cProductionLineFk,cName from (
select cProductionLineFk,pmrhd.cvalue as value ,mp.cName from
  (
select id,cProductionLineFk,cName from Pems_Meter where cProductionLineFk in
(select id from Pems_MeterProductionLine ))meter
left join Pems_MeterReportHistory_Day pmrhd on meter.id=pmrhd.cMeterFk and pmrhd.cDate=${preDate}
left join Pems_MeterProductionLine mp on mp.id=meter.cProductionLineFk
)aa group by cProductionLineFk,cName
 `;
  const list = [];
  if (data != null && data.length > 0) {
    data.forEach(element => {
      console.log(element.value);
      const value = element.value === null ? 0 : parseFloat(element.value).toFixed(2);
      const name = element.cName;
      list.push({
        value,
        name,
      });
    });
  }
  return list;
}
async function getEchartByPosition() {
  // 前一天数据
  const preDate = new Date(
    moment()
      .subtract(1, 'days')
      .format('YYYY-MM-DD'),
  );
  // 主配进线
  const data = await prisma.$queryRaw`select sum(value) as value,cPositionFk,cName from (
    select cPositionFk,pmrhd.cvalue as value ,mp.cName from
        (
    select id,cPositionFk,cName from Pems_Meter where cPositionFk in
    (select id from Pems_MeterPosition where parentId in(select id from Pems_MeterPosition where cName='主配进线')))meter
    left join Pems_MeterReportHistory_Day pmrhd on meter.id=pmrhd.cMeterFk and pmrhd.cDate=${preDate}
    left join Pems_MeterPosition mp on mp.id=meter.cPositionFk
     )aa group by cPositionFk,cName
 `;
  const list = [];
  if (data != null && data.length > 0) {
    data.forEach(element => {
      const value = element.value === null ? 0 : parseFloat(element.value).toFixed(2);
      const name = element.cName;
      list.push({
        value,
        name,
      });
    });
  }
  return list;
}

async function getEchartDay(cType) {
  let meterId;
  // 当前时间的前10天时间
  const preTenDay = moment()
    .startOf('months')
    .format('YYYY-MM-DD');
  const endDay = moment()
    .endOf('months')
    .format('YYYY-MM-DD');
  let positionName = '';
  const allDays = energyService.getAllDays(preTenDay, endDay);
  const list = [];
  let position = null;
  if (cType != null && cType != '') {
    if (cType == 'Electricity') {
      positionName = '主配进线';
    }
    position = await prisma.Pems_MeterPosition.findFirst({
      where: {
        cName: positionName,
      },
    });
  }
  let meterName = null;
  if (position == null) {
    if (cType == 'Water') {
      meterName = '自来水泵房总表';
    }
    if (cType == 'Steam') {
      meterName = '分气缸蒸汽出气总管';
    }
  }
  const meterFilter = { AND: [] };
  if (position != null) {
    meterFilter.AND = { ...meterFilter.AND, cPositionFk: position.id };
  }
  if (meterName != null) {
    meterFilter.AND = { ...meterFilter.AND, cDesc: meterName };
  }

  const meter = await prisma.Pems_Meter.findMany({
    where: meterFilter,
  });
  if (meter != null && meter.length > 0) {
    meter.forEach(element => {
      meterId = element.id;
    });
  }
  const filter = {
    AND: {
      cDate: { gte: new Date(preTenDay), lte: new Date(endDay) },
      cMeterFk: { in: meterId },
    },
  };

  const data = await prisma.Pems_MeterReportHistory_Day.findMany({
    where: filter,
  });

  // 费用
  const filterFeeValue = {
    AND: {
      cRecordDate: { gte: new Date(preTenDay), lte: new Date(endDay) },
      cMeterFk: { in: meterId },
    },
  };
  const feeData = await prisma.Pems_EnergyFeeValues.findMany({
    where: filterFeeValue,
  });
  for (let i = 0; i < allDays.length; i++) {
    let totalEnergyConsumption = null;
    let feeSum = null;
    const day = new Date(allDays[i]);
    if (data != null && data.length > 0) {
      for (let report = 0; report < data.length; report++) {
        const element = data[report];
        if (day.getTime() == element.cDate.getTime()) {
          if (element.cValue != null) {
            totalEnergyConsumption = parseFloat(element.cValue).toFixed(2);
          }
          break;
        }
      }
    }
    if (feeData != null && feeData.length > 0) {
      for (let fee = 0; fee < feeData.length; fee++) {
        const element = feeData[fee];

        if (day.getTime() == element.cRecordDate.getTime()) {
          if (element.cValue != null) {
            feeSum = parseFloat(element.cValue).toFixed(2);
          }
          break;
        }
      }
    }
    list.push({
      date: moment(day).format('YYYY-MM-DD'),
      totalEnergyConsumption,
      feeSum,
    });
  }
  return list;
}
export default {
  exportExcel,
  monthExportExcel,
  writexls,
  saveExcel,
  getMonEnergyConsumption,
  getEchartDay,
  getEchartByPosition,
  getEchartByProductionLine,
};
