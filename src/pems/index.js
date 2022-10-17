import meterPosition from './meterPosition.controller';
import meter from './meter.controller'
import meterValues from './meterValues.controller'
import service from './../sys/service';

export const CrudOperations = {
  service,
  meterPosition,
  meter,
  meterValues,
};

export default { meterPosition, meter, meterValues, service };
