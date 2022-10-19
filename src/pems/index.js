import meterPosition from './meterPosition.controller';
import meter from './meter.controller';
import service from "../sys/service";
import meterValues from './meterValues.controller';

export const CrudOperations = {
  service,
  meterPosition,
  meter,
  meterValues,
};

export default { meterPosition, meter, meterValues };
