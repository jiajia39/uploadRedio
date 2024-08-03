import { Router } from 'express';
import enableWs from '@small-tech/express-ws';

import { INDEX_NAME } from '~/env';
import helloWorld from '~/hello-world';
import sys from '~/sys';
import apm from '~/apm';
import authentication from '~/authentication';
import fileUploads from '~/file-uploads';
import miniprogram from '~/miniprogram';

const router = Router();
enableWs(router);

router.get('/', (req, res) => {
  res.send(`app-root, ${INDEX_NAME} mode`);
});

router.use(helloWorld.prefix, helloWorld);
router.use(authentication.auth.prefix, authentication.auth);
router.use(authentication.mini.prefix, authentication.mini);
router.use(sys.sys.prefix, sys.sys);
router.use(sys.syslog.prefix, sys.syslog);
router.use(sys.sysmenu.prefix, sys.sysmenu);
router.use(sys.sysorg.prefix, sys.sysorg);
router.use(sys.sysrole.prefix, sys.sysrole);
router.use(sys.sysdictionary.prefix, sys.sysdictionary);
router.use(sys.sysrolemenu.prefix, sys.sysrolemenu);
router.use(fileUploads.prefix, fileUploads);

router.use(apm.attachments.prefix, apm.attachments);

// 维护管理上传附件
router.use(apm.apmfile.prefix, apm.apmfile);

router.use(miniprogram.attachments.prefix, miniprogram.attachments)
router.use(miniprogram.miniprogramauthenticate.prefix, miniprogram.miniprogramauthenticate)
export default router;
