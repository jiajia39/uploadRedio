import meterPosition from './meterPosition.controller';
import meter from './meter.controller';
import service from '../sys/service';
import meterValues from './meterValues.controller';
import energyFees from './energyFees.controller';

export const CrudOperations = {
  service,
  meterPosition,
  meter,
  meterValues,
  energyFees,
};

export default { meterPosition, meter, meterValues, energyFees };
