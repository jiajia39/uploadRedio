import meterPosition from './meterPosition.controller';
import meter from './meter.controller';
import service from '../sys/service';
import meterValues from './meterValues.controller';
import energyFees from './energyFees.controller';
import report from './report.controller';
import shift from './shift.controller';
import meterProductionLine from './meterProductionLine.controller';
import engrgyService from './energy.service';
import energySubstitute from './energySubstitute.controller';
import meterRecording from './meterRecording.controller';

export const CrudOperations = {
  engrgyService,
  service,
  meterPosition,
  meter,
  meterValues,
  energyFees,
  report,
  meterProductionLine,
  energySubstitute,
  shift,
  meterRecording,
};

export default {
  meterPosition,
  meter,
  meterValues,
  energyFees,
  report,
  shift,
  meterProductionLine,
  energySubstitute,
  meterRecording,
};
