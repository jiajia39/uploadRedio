import express from 'express';
import enableWs from '@small-tech/express-ws';

import helmet from 'helmet';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import session from 'express-session';
import * as Sentry from '@sentry/node';

import routes from '~/core/routes';
import passport from '~/core/passport';
import winston from '~/core/winston';
import { authorizeKeyCloak } from './core/jwt';
import { NODE_ENV, SECRET_KEY, RATE_LIMIT, SENTRY_DSN } from './env';

const AppError = require('./utils/appError');

const app = express();
enableWs(app);

if (NODE_ENV === 'production') Sentry.init({ dsn: SENTRY_DSN });
const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Express Web API',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        Authorization: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          value: 'Bearer <JWT token here>',
        },
      },
    },
  },
  apis: [
    `${__dirname}/sys/*.js`,
    `${__dirname}/pems/*.js`,
    `${__dirname}/cofco/*.js`,
    `${__dirname}/influx/*.js`,
    `${__dirname}/file-uploads/*.js`,
    `${__dirname}/authentication/*.js`,
    `${__dirname}/crud-operations/*.js`,
  ],
};

const openapiSpecification = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));

app.use(helmet());
app.use(cors({ credentials: true }));
app.use(rateLimit({ max: Number(RATE_LIMIT), windowMs: 15 * 60 * 1000 }));
app.use(compression());
app.use(morgan('combined', { stream: winston.stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

if (NODE_ENV === 'production') {
  app.use(Sentry.Handlers.requestHandler());
}
// 使用 .unless({ path: [/^\/api\//] }) 指定哪些接口不需要进行 Token 的身份认证
// app.use(authorize);
if (NODE_ENV === 'production') {
  app.use(authorizeKeyCloak);
}

// 配置静态资源 public文件夹中
app.use('/api/uploads', express.static('./uploads'));
app.use('/api/', routes);

if (NODE_ENV === 'production') {
  app.use(Sentry.Handlers.errorHandler());
}

// 验证token
// 错误中间件
// error handler
app.use(function(err, req, res, next) {
  console.log(err);
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('invalid token...');
  } else {
    next(err);
  }
});

// Global Error Handler for 404 Route Not Found Error
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});


export default app;
