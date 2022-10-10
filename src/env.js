export const NODE_ENV = process.env.NODE_ENV || 'production';
export const INDEX_NAME = process.env.INDEX_NAME || 'local';

export const HOST = process.env.HOST || '0.0.0.0';
export const PORT = process.env.PORT || 3000;

export const SECRET_KEY = process.env.SECRET_KEY || 'jbmpHPLoaV8N0nEpuLxlpT95FYakMPiu';

export const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://admin:Rockwell%40123@www.raftis.cn:27017/MD_ROCKII_2022?authSource=admin';

// ---

export const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || 'XXX';
export const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || 'XXX';

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'XXX';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'XXX';

export const APPLE_SERVICES_ID = process.env.APPLE_SERVICES_ID || 'XXX';
export const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID || 'XXX';
export const APPLE_KEY_ID = process.env.APPLE_KEY_ID || 'XXX';
export const APPLE_PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY || 'XXX';

export const CLOUDINARY_URL = process.env.CLOUDINARY_URL || 'cloudinary://key:secret@domain_name';

export const RATE_LIMIT = process.env.RATE_LIMIT || 0;

export const SENTRY_DSN = process.env.SENTRY_DSN || null;

export const INFLUX_URL = 'https://iad.raopc.com:7086/';

export const INFLUX_TOKEN =
  'Akk_WhewHbKyTnL_0eNSxOSWlr9YELFSkRpyQThVOHX8pcO2P2fb7iC7uo5TJlMD7psv0Ez7MDIptbJ4c8r7KQ==';

export const INFLUX_ORG = 'raiad';

export const INFLUX_BUCKET = 'iadpoc2022';
