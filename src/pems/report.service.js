import xlsx from 'node-xlsx';
import energyService from './energy.service';
import service from './service';
import prisma from '../core/prisma';

const Excel = require('exceljs');
const moment = require('moment');
const dayjs = require('dayjs');
const Decimal = require('decimal.js');
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
  const preDate = new Date(
    moment()
      .subtract(1, 'day')
      .format('YYYY-MM-DD'),
  );
  const nowTime = new Date(moment().format('YYYY-MM-DD 00:00:00'));
  const data = await prisma.$queryRaw` select meter.cName,meter.cType,meter.cDesc, (select top(1) cValue from Pems_MeterRecording record where record.cMeterFk=meter.id and record.dRecordTime =${preTime} ) as pre_value,
  (select top(1) cValue from Pems_MeterRecording record where record.cMeterFk=meter.id and record.dRecordTime =${nowTime} ) as value,PMRHD.cValue
from Pems_Meter meter
left join Pems_MeterReportHistory_Day PMRHD on meter.id = PMRHD.cMeterFk and cDate=${preDate} 
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
  return dataList;
}
/**
 * excel中每个sheetd的表头数据
 */
async function dayDate(excelname) {
  const dataList = [];
  // 前一天数据
  const preDate = new Date(
    moment()
      .subtract(1, 'days')
      .format('YYYY-MM-DD'),
  );
  const row3 = ['制表人：', '', '', '', '', '', '', '', '', '', '', '', '审核人：'];
  const row4 = ['项 目', '电表代码', '电力'];
  // dataList.push([yearMonth]);
  const row5 = ['', '', '有功Kwh', '峰Kwh', '', '', '平Kwh', '', '', '谷Kwh', '', '', '无功Kvarh'];
  const row6 = [
    '',
    '',
    '0:00-24:00',
    '0:00-24:00',
    '8:00-11:00',
    '17:00-22:00',
    '0:00-24:00',
    '5:00-8:00',
    '11:00-17:00',
    '0:00-24:00',
    '22:00-24:00',
    '0:00-5:00',
    '0:00-24:00',
  ];
  dataList.push([excelname]);
  dataList.push([preDate]);
  dataList.push(row3);
  dataList.push(row4);
  dataList.push(row5);
  dataList.push(row6);
  return dataList;
}
/**
 * 给子类位置创建sheet,并赋值，如果子类有子类的话，递归创建sheet
 * @param {*} children 子类位置
 * @param {*} workbook Workbook
 */
async function processChildren(children, workbook) {
  for (const child of children) {
    // 位置有子类
    if (child.children && child.children.length > 0) {
      const data = await dayDate(child.cName);

      // 获取父类位置的耗能数据
      await setDate(data, child);
      await excelHeader(workbook, data, child.cName);
      await processChildren(child.children, workbook); // 递归调用处理子节点的子节点
    }
  }
}
/**
 * 生成日报表excel
 */
async function saveDayExcel() {
  // 创建workbook
  const workbook = new Excel.Workbook();
  // 获取位置的树形数据
  const treeData = await service.getMeterPositionTree();
  if (treeData != null && treeData.length > 0) {
    // 如果给当前位置创建sheet  如果位置有子类，给子类创建
    for (const meterPosition of treeData) {
      // sheet的表头数据
      const data = await this.dayDate(meterPosition.cName);
      // sheet的实际数据
      await setDate(data, meterPosition);
      await excelHeader(workbook, data, meterPosition.cName);
      // 位置有子类，给子类创建sheet
      if (meterPosition.children.length > 0) {
        await processChildren(meterPosition.children, workbook);
      }
    }
  }
  const date = moment()
    .subtract(1, 'day')
    .format('YYYY-MM-DD');
  const path = './uploads/' + '日报表' + `${date}.xlsx`;
  workbook.xlsx.writeFile(path).then(function() {
    console.log('aaaa');
  });
}
/**
 * 设置sheet的数据（包含上、下游总量，损失量、损失率）
 * @param {*} data 表头数据
 * @param {*} meterPosition 位置
 */
async function setDate(data, meterPosition) {
  const date = new Date(
    moment()
      .subtract(1, 'day')
      .format('YYYY-MM-DD'),
  );
  // 获取 父类位置的仪表的耗能数据
  const parentDate = await GetPowerConsumptionDuringTheTimePeriod(data, meterPosition, date);
  const parentDateSum = [
    '上游总量',
    '',
    '',
    '',
    parentDate[0].TotalDiffValue1,
    parentDate[0].TotalDiffValue2,
    '',
    parentDate[0].TotalDiffValue3,
    parentDate[0].TotalDiffValue4,
    '',
    parentDate[0].TotalDiffValue5,
    parentDate[0].TotalDiffValue6,
    '',
  ];
  data.push(parentDateSum);
  let childDate1 = 0;
  let childDate2 = 0;
  let childDate3 = 0;
  let childDate4 = 0;
  let childDate5 = 0;
  let childDate6 = 0;
  // 获取子类位置的仪表的耗能数据
  if (meterPosition.children.length > 0) {
    for (const childPosition of meterPosition.children) {
      const childDate = await GetPowerConsumptionDuringTheTimePeriod(data, childPosition, date);
      childDate1 = childDate[0].TotalDiffValue1 + childDate1;
      childDate2 = childDate[0].TotalDiffValue2 + childDate2;
      childDate3 = childDate[0].TotalDiffValue3 + childDate3;
      childDate4 = childDate[0].TotalDiffValue4 + childDate4;
      childDate5 = childDate[0].TotalDiffValue5 + childDate5;
      childDate6 = childDate[0].TotalDiffValue6 + childDate6;
    }
  }
  const childDateSum = [
    '下游总量',
    '',
    '',
    '',
    childDate1,
    childDate2,
    '',
    childDate3,
    childDate4,
    '',
    childDate5,
    childDate6,
    '',
  ];
  data.push(childDateSum);
  const diff = [];
  const diffRate = ['损失率', '', '', ''];
  diff.push('损失量');
  diff.push('');
  diff.push('');
  diff.push('');
  // 设置损失率的值
  if (parentDate[0].TotalDiffValue1 > 0 && childDate1 > 0) {
    diff.push(childDate1 - parentDate[0].TotalDiffValue1);
    let rate = (childDate1 - parentDate[0].TotalDiffValue1) / childDate1;
    rate = parseFloat(rate * 100).toFixed(2);
    diffRate.push(`${rate}%`);
  } else {
    diff.push('');
    diffRate.push('');
  }
  if (parentDate[0].TotalDiffValue2 > 0 && childDate2 > 0) {
    diff.push(childDate2 - parentDate[0].TotalDiffValue2);
    let rate = (childDate2 - parentDate[0].TotalDiffValue2) / childDate2;
    rate = parseFloat(rate * 100).toFixed(2);
    diffRate.push(`${rate}%`);
  } else {
    diff.push('');
    diffRate.push('');
  }
  diff.push('');
  diffRate.push('');
  if (parentDate[0].TotalDiffValue3 > 0 && childDate3 > 0) {
    diff.push(childDate3 - parentDate[0].TotalDiffValue3);
    let rate = (childDate3 - parentDate[0].TotalDiffValue3) / childDate3;
    rate = parseFloat(rate * 100).toFixed(2);
    diffRate.push(`${rate}%`);
  } else {
    diff.push('');
    diffRate.push('');
  }
  if (parentDate[0].TotalDiffValue4 > 0 && childDate4 > 0) {
    diff.push(childDate4 - parentDate[0].TotalDiffValue4);
    let rate = (childDate4 - parentDate[0].TotalDiffValue4) / childDate4;
    rate = parseFloat(rate * 100).toFixed(2);
    diffRate.push(`${rate}%`);
  } else {
    diff.push('');
    diffRate.push('');
  }
  diff.push('');
  diffRate.push('');
  if (parentDate[0].TotalDiffValue5 > 0 && childDate5 > 0) {
    diff.push(childDate5 - parentDate[0].TotalDiffValue5);
    let rate = (childDate5 - parentDate[0].TotalDiffValue5) / childDate5;
    rate = parseFloat(rate * 100).toFixed(2);
    diffRate.push(`${rate}%`);
  } else {
    diff.push('');
    diffRate.push('');
  }
  if (parentDate[0].TotalDiffValue6 > 0 && childDate6 > 0) {
    diff.push(childDate6 - parentDate[0].TotalDiffValue6);
    let rate = (childDate6 - parentDate[0].TotalDiffValue6) / childDate6;
    rate = parseFloat(rate * 100).toFixed(2);
    diffRate.push(`${rate}%`);
  } else {
    diff.push('');
    diffRate.push('');
  }
  data.push(diff);
  data.push(diffRate);
}
/**
 * 获取sheet中的实际数据（每个位置对应的 仪表的某个时间段的耗电信息）
 * @param {*} data sheet的数据
 * @param {*} meterPosition 某个位置的信息
 * @param {*} date 日期
 * @returns 每个时间段的耗能信息
 */
async function GetPowerConsumptionDuringTheTimePeriod(data, meterPosition, date) {
  data.push([meterPosition.cName]);
  const powerConsumptionDate = await prisma.$queryRaw`exec GetPowerConsumptionDuringTheTimePeriod ${meterPosition.id},${date}`;
  let TotalDiffValue1 = 0;
  let TotalDiffValue2 = 0;
  let TotalDiffValue3 = 0;
  let TotalDiffValue4 = 0;
  let TotalDiffValue5 = 0;
  let TotalDiffValue6 = 0;
  powerConsumptionDate.forEach(element => {
    TotalDiffValue1 += element.TotalDiffValue1;
    TotalDiffValue2 += element.TotalDiffValue2;
    TotalDiffValue3 += element.TotalDiffValue3;
    TotalDiffValue4 += element.TotalDiffValue4;
    TotalDiffValue5 += element.TotalDiffValue5;
    TotalDiffValue6 += element.TotalDiffValue6;

    const arrinner = [
      element.cDesc,
      element.cName,
      '',
      '',
      element.TotalDiffValue1,
      element.TotalDiffValue2,
      '',
      element.TotalDiffValue3,
      element.TotalDiffValue4,
      '',
      element.TotalDiffValue5,
      element.TotalDiffValue6,
      '',
    ];
    data.push(arrinner);
  });
  data.push(['']);
  return [
    {
      TotalDiffValue1,
      TotalDiffValue2,
      TotalDiffValue3,
      TotalDiffValue4,
      TotalDiffValue5,
      TotalDiffValue6,
    },
  ];
}
/**
 * 表格格式
 */
async function excelHeader(workbook, data, sheetName) {
  // 标签创建
  const worksheet = workbook.addWorksheet(`${sheetName}`);

  worksheet.addRows(data);
  // ===== 字体显示
  worksheet.getCell('A1').font = {
    // Font family for fallback. An integer value.
    family: 4,
    // 字体大小
    size: 16,
    // 加粗
    bold: true,
  };
  // 合并单元格
  worksheet.mergeCells(`A${1}:M${1}`);
  worksheet.mergeCells(`A${2}:M${2}`);
  worksheet.mergeCells(`A${4}:A${6}`);
  worksheet.mergeCells(`B${4}:B${6}`);
  worksheet.mergeCells(`C${4}:M${4}`);
  worksheet.mergeCells(`D${5}:F${5}`);
  worksheet.mergeCells(`G${5}:I${5}`);
  worksheet.mergeCells(`J${5}:L${5}`);

  const endRow = worksheet.rowCount;
  const columnCount = worksheet.actualColumnCount; // 获取实际列数

  for (let i = 1; i <= columnCount; i++) {
    // 设置行高
    worksheet.getRow(i).height = 25;
    // 设置列宽，垂直对齐方式为居中\
    const column = worksheet.getColumn(i);
    column.width = 12;
  }
  for (let row = 1; row <= endRow; row++) {
    const rowData = worksheet.getRow(row);
    if (row < 7) {
      rowData.alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
    } else {
      rowData.alignment = {
        vertical: 'middle',
        horizontal: 'left',
      };
    }
    // 如果上一行的数据为空，则将当前行的字体加粗
    if (row > 1) {
      const previousRow = worksheet.getRow(row - 1);
      const currentRow = worksheet.getRow(row);
      if (previousRow.getCell(1).value === null || previousRow.getCell(1).value === '') {
        currentRow.font = { bold: true };
      }
    }
  }
  // 设置指定单元格的对齐方式
  worksheet.getCell(`A${3}`).alignment = {
    horizontal: 'left',
    vertical: 'middle',
  };
  worksheet.getCell(`M${3}`).alignment = {
    horizontal: 'left',
    vertical: 'middle',
  };
  // //行高
  worksheet.getRows(1, 553).height = 30;
  // 单元格宽度
  worksheet.getColumn(1).width = 30;
  worksheet.getColumn(2).width = 25;
  // ===== 边框
  const startRow = 4;
  const startColumn = 1;
  const endColumn = 13;
  for (let row = startRow; row <= endRow; row++) {
    let rowPar = 0;
    for (let col = startColumn; col <= endColumn; col++) {
      const cell = worksheet.getCell(row, col);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      if (row == endRow - 2) {
        worksheet.getRow(row).height = 30;
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F79646' },
        };
      }
      if (cell.value == '上游总量') {
        worksheet.getRow(row).height = 30;
        rowPar = row;
      }

      if (row === 4 || row === 5 || row === 7 || row > endRow - 2) {
        cell.font = {
          bold: true,
        };
      }
    }
    for (let col = startColumn; col <= endColumn; col++) {
      const cell = worksheet.getCell(rowPar, col);

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'F79646' },
      };
    }
  }
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
  workbook.xlsx.writeFile(path).then(function() {});
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
)aa group by cProductionLineFk,cName order by value
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
     )aa group by cPositionFk,cName  order by value
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

async function getEchartDay(cType, cMonth) {
  const meterIds = await getMeterIdsByType(cType);
  // 当前时间的前10天时间
  let preTenDay = moment()
    .startOf('months')
    .format('YYYY-MM-DD');
  let endDay = moment()
    .endOf('months')
    .format('YYYY-MM-DD');
  if (cMonth != null || cMonth != undefined) {
    preTenDay = moment(cMonth)
      .startOf('months')
      .format('YYYY-MM-DD');
    endDay = moment(cMonth)
      .endOf('months')
      .format('YYYY-MM-DD');
  }

  const allDays = energyService.getAllDays(preTenDay, endDay);
  const list = [];
  const filter = {
    AND: {
      cDate: { gte: new Date(preTenDay), lte: new Date(endDay) },
      cMeterFk: { in: meterIds },
    },
  };

  const data = await prisma.Pems_MeterReportHistory_Day.findMany({
    where: filter,
  });

  // 费用
  const filterFeeValue = {
    AND: {
      cRecordDate: { gte: new Date(preTenDay), lte: new Date(endDay) },
      cMeterFk: { in: meterIds },
    },
  };
  const feeData = await prisma.Pems_EnergyFeeValues.findMany({
    where: filterFeeValue,
  });
  for (let i = 0; i < allDays.length; i++) {
    let totalEnergyConsumption = 0;
    let feeSum = 0;
    const day = new Date(allDays[i]);
    if (data != null && data.length > 0) {
      for (let report = 0; report < data.length; report++) {
        const element = data[report];
        if (day.getTime() == element.cDate.getTime()) {
          if (element.cValue != null) {
            totalEnergyConsumption = new Decimal(totalEnergyConsumption)
              .add(new Decimal(element.cValue))
              .toNumber();
            totalEnergyConsumption = parseFloat(totalEnergyConsumption).toFixed(2);
            // totalEnergyConsumption = parseFloat(element.cValue).toFixed(2);
          }
        }
      }
    }
    if (feeData != null && feeData.length > 0) {
      for (let fee = 0; fee < feeData.length; fee++) {
        const element = feeData[fee];

        if (day.getTime() == element.cRecordDate.getTime()) {
          if (element.cValue != null) {
            feeSum = new Decimal(feeSum).add(new Decimal(element.cValue)).toNumber();
            feeSum = parseFloat(feeSum).toFixed(2);
          }
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

/**
 *
 * @param {Date or String} date1 日期1
 * @param {Date or String} date2 日期2
 * @returns 两个日期相差的月份数
 */
function monthNumber(date1, date2) {
  // 第一个日期的年和月
  const yearOne = date1.getFullYear();
  const monthOne = date1.getMonth() + 1;
  // 第二个日期的年和月
  const yearTwo = date2.getFullYear();
  const monthTwo = date2.getMonth() + 1;
  // 两个日期的月份数
  const oneMonthNum = yearOne * 12 + monthOne;
  const twoMonthNum = yearTwo * 12 + monthTwo;
  return Math.abs(oneMonthNum - twoMonthNum);
}
/**
 *
 * @param {Date or String} date1 日期1
 * @param {Date or String} date2 日期2
 * @returns 两个日期相差的月份数
 */
function getMonthByDate(date1, date2) {
  const dateOne = new Date(date1);
  const dateTwo = new Date(date2);
  // 两个日期相差的月份数
  const list = [];
  list.push(dateOne);
  const num = monthNumber(dateOne, dateTwo);
  let chaDate = date1;
  for (let i = 0; i < num; i++) {
    const month = new Date(
      moment(chaDate)
        .add(1, 'month')
        .format('YYYY-MM-DD'),
    );
    list.push(month);
    chaDate = month;
  }

  return list;
}

async function getMeterIdsByType(cType) {
  const meterIds = [];

  let positionName = '';

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
      meterIds.push(element.id);
    });
  }
  return meterIds;
}

/**
 * 根据日期计算这段日期每月的耗能
 * @param {*} cType 类型
 * @param {*} date1 日期
 * @param {*} date2 日期
 * @returns 这段日期每月的耗能
 */

async function getMonthEnergyConsumption(cType, date1, date2) {
  const meterIds = await getMeterIdsByType(cType);

  // 当前时间的前10天时间
  const startMon = moment(date1).format('YYYY-MM-DD');
  const endMon = moment(date2).format('YYYY-MM-DD');
  const allMonths = getMonthByDate(date1, date2);
  const list = [];
  const filter = {
    AND: {
      cMonthStart: { gte: new Date(startMon), lte: new Date(endMon) },
      cMeterFk: { in: meterIds },
    },
  };

  const data = await prisma.Pems_MeterReporting_Month.findMany({
    where: filter,
  });
  for (let i = 0; i < allMonths.length; i++) {
    let monthstart;
    let sumValue = 0;
    for (let j = 0; j < data.length; j++) {
      monthstart = data[j].cMonthStart;
      if (allMonths[i].getTime() == monthstart.getTime()) {
        sumValue += data[j].cValue;
      }
    }
    list.push({ date: allMonths[i], value: sumValue });
  }
  return list;
}

async function getYesterdayEnergyConsumption(req, res) {
  const yesterDay = dayjs()
    .startOf('day')
    .subtract(1, 'day')
    .toDate();
  const { cType } = req.query;
  const meterList = [];
  if (cType == 'Electricity') {
    const meterListEl = await prisma.Pems_Meter.findMany({
      where: { cPositionFk: 27 },
    });
    meterListEl.forEach(el => {
      meterList.push(el.id);
    });
  }
  if (cType === 'Water') {
    const meterListEl = await prisma.Pems_Meter.findMany({
      where: { cDesc: '自来水泵房总表' },
    });
    meterListEl.forEach(el => {
      meterList.push(el.id);
    });
  }
  const matchedData = await prisma.Pems_MeterReportHistory_Day.findMany({
    where: {
      AND: {
        cMeterFk: { in: meterList },
        cDate: { gte: yesterDay },
      },
    },
  });
  let resValue = 0;
  matchedData.forEach(el => {
    resValue += el.cValue;
  });
  return {
    yesterDayConsumption: parseFloat(resValue.toFixed(2)),
    energyType: cType,
  };
}

export default {
  exportExcel,
  getMonthByDate,
  monthExportExcel,
  writexls,
  saveExcel,
  dayDate,
  excelHeader,
  saveDayExcel,
  getMonEnergyConsumption,
  getEchartDay,
  getEchartByPosition,
  getEchartByProductionLine,
  getMonthEnergyConsumption,
  getYesterdayEnergyConsumption,
};
