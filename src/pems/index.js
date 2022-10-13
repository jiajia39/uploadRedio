import meterPosition from './meterPosition.controller';
import meter from './meter.controller'
import service from './../sys/service';

export const CrudOperations = {
  service,
  meterPosition,
  meter,
};

export default { meterPosition, meter };
