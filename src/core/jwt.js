// 用一个单独模块来放生成token和验证token的方法，方便后面调用。
import { expressjwt as jwt } from 'express-jwt';
// import { request } from 'sync-request';
import { SECRET_KEY } from '../env';

// // 验证 token
// export const authorize = jwt({
//   secret: SECRET_KEY,
//   algorithms: ['HS256'],
//   getToken: function fromHeaderOrQuerystring(req) {
//     if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
//       return req.headers.authorization.split(' ')[1];
//     }
//     if (req.query && req.query.token) {
//       return req.query.token;
//     }
//     return null;
//   },
// }).unless({
//   path: [
//     '/api/Users/Authenticate',
//     '/salesmanSession',
//     '/adminSession',
//     '/superAdminSession',
//     '/swiper',
//     '/freeSalesman',
//     '/headImg',
//     { url: /^\/uploads\/avatar\/*/, methods: ['GET'] },
//     { url: '/uploads/Alan480640.jpg', methods: ['GET', 'POST'] },
//     { url: /^\/salesman\/.*/, methods: ['GET'] },
//     { url: '/productsCate', methods: ['GET'] },
//     { url: '/products', methods: ['GET'] },
//     { url: /^\/uploads\/.*/, methods: ['GET'] },
//     { url: '/user', methods: ['POST'] },
//     { url: /^\/user\/.*/, methods: ['GET'] },
//   ],
// });

// const res = request('GET', 'https://www.raftis.cn:8443/realms/iad');
const strpub =
  'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiNQqykOeM/Tfy9gRUC8zksXE0Kn5MnE1IURv6CUrKqbLoBCWoujGFV3nsb/I+R6IW6ZiaTfR/yYb7oNIyYN4wthm4DXrptAp3pvuF0NoCgtGDPNljlUOgupDVmXlkQKLRfJrAEZoxFW46K9SA/VklYH1TCulFb3FFYRV9k9jIcEBZa5G9G4BEdOQ5HW5MI22f6MdxBTxMRUuJhbpf3+bX5K9ILHXcWCVL9WIn1EewTOZf+QtJn7IrZ8o1wyxAkfGc/8vsMgnuaRFugrZkS7MKB47bnfxXTgXL39ht7dugLoYqeVLS6darnxWDjmi+0/J7yMcp9xsvGvYcwePviwmNwIDAQAB';
const publicKey = `-----BEGIN PUBLIC KEY-----\r\n${strpub}\r\n-----END PUBLIC KEY-----`;

const getSecret = async function(req, token) {
  const issuer = token.payload.iss;
  if (!issuer) {
    return SECRET_KEY;
  }
  return publicKey;
};

// 验证 token
export const authorizeKeyCloak = jwt({
  secret: getSecret,
  algorithms: ['HS256', 'RS256'],
  getToken: function fromHeaderOrQuerystring(req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
      return req.headers.authorization.split(' ')[1];
    }
    if (req.headers.token) {
      return req.headers.token;
    }
    if (req.query && req.query.token) {
      return req.query.token;
    }
    return null;
  },
}).unless({
  path: [
    '/api/Users/Authenticate',
    '/api/Users/UserRegister',
    '/api/Users/UserExists',
    '/api/sys/user/getallbpid',
    '/api/sys/sysmenu/getbyrole',
    '/favicon.ico',
    '/api/Users/getmenutreenodesbyrolename',
    '/api/Users/getabilitybyrolename',
    '/adminSession',
    '/superAdminSession',
    '/swiper',
    '/freeSalesman',
    '/api/file-uploads/single',
    { url: /^\/api\/cofco\/prodsummary\/*/, methods: ['GET'] },
    { url: /^\/api\/influx\/influxman\/*/, methods: ['GET'] },
    { url: /^\/api\/uploads\/*/, methods: ['GET'] },
    { url: /^\/uploads\/*/, methods: ['GET'] },
    { url: /^\/api\/uploads\/avatar\/*/, methods: ['GET'] },
    { url: /^\/api\/assets\/tmp\/*/, methods: ['GET'] },
    { url: '/admin', methods: ['GET', 'POST'] },
    { url: /^\/salesman\/.*/, methods: ['GET'] },
    { url: '/productsCate', methods: ['GET'] },
    { url: '/products', methods: ['GET'] },
    { url: /^\/products\/.*/, methods: ['GET'] },
    { url: '/user', methods: ['POST'] },
    { url: /^\/user\/.*/, methods: ['GET'] },
    { url: /^\/.*/ },
  ],
});
