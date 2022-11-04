import { Router } from 'express';
import enableWs from '@small-tech/express-ws';

import { INDEX_NAME } from '~/env';
import helloWorld from '~/hello-world';
import crudOperations from '~/crud-operations';
import sys from '~/sys';
import cofco from '~/cofco';
import authentication from '~/authentication';
import fileUploads from '~/file-uploads';
import realtimeData from '~/realtime-data';
import influx from '~/influx';
import pems from '~/pems';

const router = Router();
enableWs(router);

router.get('/', (req, res) => {
  res.send(`app-root, ${INDEX_NAME} mode`);
});

router.use(helloWorld.prefix, helloWorld);
router.use(crudOperations.prefix, crudOperations);
router.use(authentication.prefix, authentication);
router.use(sys.sys.prefix, sys.sys);
router.use(sys.syslog.prefix, sys.syslog);
router.use(sys.sysmenu.prefix, sys.sysmenu);
router.use(sys.sysorg.prefix, sys.sysorg);
router.use(sys.sysrole.prefix, sys.sysrole);
router.use(sys.sysdictionary.prefix, sys.sysdictionary);
router.use(sys.sysrolemenu.prefix, sys.sysrolemenu);
router.use(fileUploads.prefix, fileUploads);
router.use(realtimeData.prefix, realtimeData);
router.use(cofco.prodsummary.prefix, cofco.prodsummary);
router.use(cofco.prodkpi.prefix, cofco.prodkpi);
router.use(influx.influxman.prefix, influx.influxman);
router.use(pems.meterPosition.prefix, pems.meterPosition);
router.use(pems.meter.prefix, pems.meter);
router.use(pems.meterValues.prefix, pems.meterValues);
router.use(pems.energyFees.prefix, pems.energyFees);
router.use(pems.shift.prefix, pems.shift);
export default router;
