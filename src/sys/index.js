import sys from './sys.controller';
import sysmenu from './sysmenu.controller';
import sysorg from './sysorg.controller';
import sysrole from './sysrole.controller';
import sysrolemenu from './sysrolemenu.controller';
import sysdictionary from './sysdictionary.controller';
import syslog from './syslog.controller';
import service from './service';

export const CrudOperations = {
  sysmenu,
  sysorg,
  service,
};

export default { sys, sysorg, sysmenu, sysrole, sysrolemenu, sysdictionary, syslog };
