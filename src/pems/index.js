import meterPosition from './meterPosition.controller';
import meter from './meter.controller';
import service from '../sys/service';
import meterValues from './meterValues.controller';
import energyFees from './energyFees.controller';
import report from './report.controller';
import shift from './shift.controller';
import engrgyService from './energy.service';

export const CrudOperations = {
  engrgyService,
  service,
  meterPosition,
  meter,
  meterValues,
  energyFees,
  report,
  shift,
};

export default { meterPosition, meter, meterValues, energyFees, report, shift };
