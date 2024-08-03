# Express Starter

:truck: A boilerplate for Node.js, Express, MSSQL, Prisma ORM , Heroku, Atlas, Nodemon, PM2, and Babel.

![Build Status](https://img.shields.io/circleci/build/github/Shyam-Chen/Express-Starter/main)
![Coverage Status](https://img.shields.io/codecov/c/github/Shyam-Chen/Express-Starter/main)

:rainbow: [Swagger](http://localhost:3000/api-docs/)

This seed repository provides the following features:

- ---------- **Essentials** ----------
- [x] Web application framework with [**Express**](http://expressjs.com/).
- [x] Prisma, Next-generation Node.js and TypeScript ORM [**Prisma**](https://www.prisma.io/docs/concepts/components/prisma-client/crud).
- [x] Make authenticated requests with [**Passport**](http://passportjs.org/).
- [x] File upload with [**Multer**](https://github.com/expressjs/multer).
- [x] Real-time communication with [**WS**](https://github.com/es/ws).
- ---------- **Tools** ----------
- [x] Next generation JavaScript with [**Babel**](https://github.com/babel/babel).
- [x] JavaScript static code analyzer with [**ESLint**](https://github.com/eslint/eslint).
- [x] Code formatter with [**Prettier**](https://prettier.io/).
- [x] Unit testing with [**Jest**](https://github.com/facebook/jest).
- [x] End-to-End testing with [**Supertest**](https://github.com/visionmedia/supertest).
- [x] Mocking external requests with [**Nock**](https://github.com/nock/nock).
- [x] Automatically restart application with [**Nodemon**](https://github.com/remy/nodemon).
- [x] Keeping application alive with [**PM2**](https://github.com/Unitech/pm2).
- [x] Reverse proxy with [**Caddy**](https://caddyserver.com/).
- [x] Swagger3.0 Tool [**Swagger**](https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md)
- ---------- **Environments** ----------
- [x] Cloud application hosting with [**Heroku**](https://www.heroku.com/).
- [x] MSSQL database .
- [x] Cloud storage‎ hosting with [**Cloudinary**](https://cloudinary.com/).
- [x] Error tracking service with [**Sentry**](https://sentry.io/).
- [x] Software container with [**Docker**](https://github.com/docker/docker).
- [x] Continuous integration with [**CircleCI**](https://circleci.com/).
- [x] Fix and prevent known vulnerabilities with [**Snyk**](https://snyk.io/).
- [x] Test coverage integration with [**Codecov**](https://codecov.io/).

## Table of Contents

- [Project Setup](#project-setup)
- [Dockerization](#dockerization)
- [Configuration](#configuration)
- [Examples](#examples)
- [Directory Structure](#directory-structure)
- [Microservices](#microservices)

## Project Setup

Follow steps to execute this boilerplate.

### Install dependencies

```sh
$ npm install
```

### Start a development server

```sh
$ yarn serve
```

### Produce a production-ready bundle

```sh
$ yarn build
```

### Lints and fixes files

```sh
$ yarn lint
```

### Runs unit tests

Files: `src/**/*.spec.js`

```sh
$ yarn unit
```

### Runs end-to-end tests

Files: `e2e/**/*.spec.js`

```sh
# Before running the `meas` command, make sure to run the following commands.
$ yarn build
$ yarn preview

# If it's not setup, run it.
$ yarn setup

$ yarn e2e
```

### Measures APIs

Files: `e2e/**/*.meas.js`

```sh
# Before running the `meas` command, make sure to run the following commands.
$ yarn build
$ yarn preview

# If it's not setup, run it.
$ yarn setup

$ yarn meas
```

### Mocks third-party APIs

```sh
# If it's not active, run it.
$ yarn active

$ yarn mock
```

## Dockerization

Dockerize an application.

1. Build and run the container in the background

```bash
$ docker-compose up -d mssql-server app
```

2. Run a command in a running container

```bash
$ docker-compose exec app <COMMAND>
```

3. Remove the old container before creating the new one

```bash
$ docker-compose rm -fs
```

4. Restart up the container in the background

```bash
$ docker-compose up -d --build app
```

## Configuration

Control the environment.

### Default environments

Set your local environment variables. (use `export const <ENV_NAME> = process.env.<ENV_NAME> || <LOCAL_ENV>;`)

```js
// src/env.js

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const INDEX_NAME = process.env.INDEX_NAME || 'local';

export const HOST = process.env.HOST || '0.0.0.0';
export const PORT = process.env.PORT || 3000;

export const SECRET_KEY = process.env.SECRET_KEY || 'jbmpHPLoaV8N0nEpuLxlpT95FYakMPiu';

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
```

### Continuous integration environments

Add environment variables to the CircleCI build.

```sh
# Project Settings > Environment Variables > Add Environment Variable

SECRET_KEY
MONGODB_URI
CLOUDINARY_URL
SENTRY_DSN
```

### File-based environments

If you want to set environment variables from a file.

```ts
.
├── e2e
├── envs
│   ├── dev.js
│   ├── stage.js
│   └── prod.js
├── mock
└── src
```

```js
// envs/<ENV_NAME>.js

function Environment() {
  this.NODE_ENV = 'production';
  // more...
}

module.exports = new Environment();
```

```sh
$ npm install babel-plugin-transform-inline-environment-variables env-cmd -D
```

```js
// babel.config.js

    plugins: [
      // ...
      'transform-inline-environment-variables',
    ],
```

```js
// package.json

  "scripts": {
    // "env-cmd -f ./envs/<ENV_NAME>.js" + "yarn build"
    "build:dev": "env-cmd -f ./envs/dev.js yarn build",
    "build:stage": "env-cmd -f ./envs/stage.js yarn build",
    "build:prod": "env-cmd -f ./envs/prod.js yarn build",
  },
```

## Examples

- [Hello World](./src/hello-world)
- [CRUD Operations](./src/crud-operations)
- [Authentication](./src/authentication)
- [File Uploads](./src/file-uploads)

## Directory Structure

The structure follows the LIFT Guidelines.

```coffee
.
├── e2e
├── mock
│   ├── requests
│   └── responses
├── src
│   ├── core
│   │   └── ...
│   ├── <FEATURE> -> feature modules
│   │   ├── __tests__
│   │   │   ├── controller.spec.js
│   │   │   ├── service.spec.js
│   │   │   └── model.spec.js
│   │   ├── controller.js
│   │   ├── service.js
│   │   ├── model.js
│   │   └── index.js
│   ├── <GROUP> -> module group
│   │   └── <FEATURE> -> feature modules
│   │       ├── __tests__
│   │       │   ├── controller.spec.js
│   │       │   ├── service.spec.js
│   │       │   └── model.spec.js
│   │       ├── controller.js
│   │       ├── service.js
│   │       ├── model.js
│   │       └── index.js
│   ├── app.js
│   ├── env.js
│   └── server.js
├── .editorconfig
├── .eslintrc
├── .gitignore
├── .prettierrc
├── babel.config
├── Caddyfile
├── circle.yml
├── develop.Dockerfile
├── docker-compose.yml
├── Dockerfile
├── jest.config.js
├── LICENSE
├── package-lock.json
├── package.json
├── processes.js
├── produce.Dockerfile
└── README.md
```

## Microservices

> Microservice architecture – a variant of the service-oriented architecture structural style – arranges an application as a collection of loosely coupled services. In a microservices architecture, services are fine-grained and the protocols are lightweight.

See [Server-side Micro-Fullstack](https://github.com/Shyam-Chen/Micro-Fullstack/tree/master/mbe) for instructions on how to create microservices from source code.
