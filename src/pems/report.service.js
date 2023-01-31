import xlsx from 'node-xlsx';
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
  var dir = 'c:excel/';
  //判断目录c:excel/是否存在如果不存在创建
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  //创建并写入数据
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
      .format('YYYY-MM-DD'),
  );
  const nowTime = new Date(moment().format('YYYY-MM-DD'));
  const data = await prisma.$queryRaw` select meter.cName,meter.cType,meter.cDesc, (select top(1) cValue from Pems_MeterRecording record where record.cMeterFk=meter.id and record.dRecordTime =${preTime} ) as pre_value,
  (select top(1) cValue from Pems_MeterRecording record where record.cMeterFk=meter.id and record.dRecordTime =${nowTime} ) as value,PMRHD.cValue
from Pems_Meter meter
left join Pems_MeterReportHistory_Day PMRHD on meter.id = PMRHD.cMeterFk and cDate=${preTime} 
order by  meter.cType asc  `;
  const end = `${nowFor} 读数`;
  const sta = `${preFor} 读数`;
  let dataList = [];
  const title = ['TagName', 'DataType', 'Description', sta, end, '差值'];
  dataList.push(title);
  data.forEach(element => {
    let arrinner = [];
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

export default {
  exportExcel,
};
