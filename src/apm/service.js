import { v4 as uuidv4 } from 'uuid';
import prisma from '../core/prisma';

async function createAssetAlert(date) {
  if (date != null && date.length > 1) {
    const IOTDate = date[1];

    // Determine the value of 'enabled'
    const enabled = IOTDate[0].subproperty.enabled ? 1 : 0;

    // Determine the value of 'toremove'
    const toremove = IOTDate[0].toremove ? 1 : 0;

    // Create the alertDate object
    const alertDate = {
      cguid: uuidv4(),
      cName: IOTDate[0].name,
      iEnabled: enabled,
      cAckmode: IOTDate[0].subproperty.ackmode,
      iCheckdelay: IOTDate[0].subproperty.checkdelay,
      iMin: IOTDate[0].subproperty.min,
      iMax: IOTDate[0].subproperty.max,
      cVariableId: IOTDate[0].tagproperty.variableId,
      dOntime: new Date(IOTDate[0].ontime),
      dOfftime: new Date(IOTDate[0].offtime),
      dAcktime: new Date(IOTDate[0].acktime),
      cStatus: IOTDate[0].status,
      IOccurvalue: IOTDate[0].occurvalue,
      dLastcheck: new Date(IOTDate[0].lastcheck),
      iToremove: toremove,
    };

    console.log(alertDate);
    await prisma.udt_apm_asset_alert.create({ data: alertDate });
  }
}
export default { createAssetAlert };
