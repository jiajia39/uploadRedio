import { Router } from 'express';
import passport from 'passport';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../core/prisma';

// import otp from 'otplib';

import { SECRET_KEY } from '~/env';

import service from './service';

const controller = (() => {
  const router = Router();

  const storage = multer.diskStorage({
    destination(req, file, done) {
      const dist = './uploads/avatar/';
      if (!fs.existsSync(dist)) fs.mkdirSync(dist);
      return done(null, dist);
    },
    filename(req, file, done) {
      done(null, file.originalname);
    },
  });
  const upload = multer({ storage });

  /**
   * @swagger
   * /api/Users/UserRegister:
   *   post:
   *     description: Login to the application
   *     tags: [Authentication]
   *     produces:
   *       - application/json
   *     requestBody:    #编写参数接收体
   *          required: true  #是否必传
   *          content:
   *              application/json:
   *                  schema:     #参数备注
   *                      type: object    #参数类型
   *                      properties:
   *                          username:
   *                                  type: string    #参数类型
   *                                  description: 发送者钱包地址     #参数描述
   *                          password:
   *                                  type: string    #参数类型
   *                                  description: 发送者钱包地址     #参数描述
   *                          email:
   *                                  type: string    #参数类型
   *                                  description: 发送者钱包地址     #参数描述
   *                          phone:
   *                                  type: string    #参数类型
   *                                  description: 发送者钱包地址     #参数描述
   *                  example:        #请求参数样例。
   *                      username: "username"
   *                      password: "password"
   *                      email: "email"
   *                      phone: "phone"
   *     responses:
   *       200:
   *         description: login
   *         schema:
   *           type: object
   */
  router.post('/UserRegister', async (req, res) => {
    const { username, password, email, phone } = req.body;
    const userexist = await prisma.Sys_User.findFirst({
      where: {
        username,
      },
    }).catch(e => {
      console.error(e);
    });

    if (userexist != null) {
      res.status(200).json({ isok: false, message: '用户已存在' });
      return;
    }

    const csalt = uuidv4().toLowerCase();
    const hash256 = crypto.createHash('sha256');
    hash256.update(password + csalt, 'utf8');
    const passwordHash = hash256.digest('base64');

    const rst = await prisma.$queryRaw`exec usp_User_Register ${username},${email},${csalt}, ${passwordHash}, ${phone}`;

    if (rst != null && rst.length > 0) {
      if (rst[0].isOK) {
        res.status(200).json({ isok: true, message: 'Sign up suceesfully' });
      } else {
        res.status(200).json({ isok: false, message: rst[0].cErrorMessage });
      }
    } else {
      res.status(200).json({ isok: false, message: 'DB Error' });
    }
  });

  /**
   * @name login - get user token
   * @return {Object<{ username: string, token: string, message: string }>}
   *
   * @example POST /authentication/login { username: ${username}, password: ${password} }
   */

  /**
   * @swagger
   * /api/Users/Authenticate:
   *   post:
   *     description: Login to the application
   *     tags: [Authentication]
   *     produces:
   *       - application/json
   *     requestBody:    #编写参数接收体
   *          required: true  #是否必传
   *          content:
   *              application/json:
   *                  schema:     #参数备注
   *                      type: object    #参数类型
   *                      properties:
   *                          username:
   *                                  type: string    #参数类型
   *                                  description: 发送者钱包地址     #参数描述
   *                          password:
   *                                  type: string    #参数类型
   *                                  description: 发送者钱包地址     #参数描述
   *                  example:        #请求参数样例。
   *                      username: "username"
   *                      password: "password"
   *     responses:
   *       200:
   *         description: login
   *         schema:
   *           type: object
   */
  router.post('/Authenticate', async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await prisma.Sys_User.findFirst({
        where: {
          username,
        },
      }).catch(e => {
        console.error(e);
      });
      if (user == null) {
        res.status(200).json({ isok: false, message: '用户不存在' });
        return;
      }
      const hash256 = crypto.createHash('sha256');
      const pwdsha256 = await hash256
        .update(password + user.salt.toLowerCase(), 'utf8')
        .digest('base64');
      const passwordsMatch = pwdsha256 === user.passwordHash;

      if (passwordsMatch) {
        const payload = {
          username: user.username,

          // TODO: remove it
          expires: Date.now() + 5 * 60 * 1000,
        };

        req.login(payload, { session: false }, async error => {
          if (error) res.status(400).json({ message: error });
          // TODO: expiresIn
          const accessToken = jwt.sign(JSON.stringify(payload), SECRET_KEY, {
            // expiresIn: 360000,
          });

          // TODO: refreshToken
          const refreshToken = service.generateRefreshToken(user, req.ip);

          const nguser = {
            id: user.id,
            userid: user.userid,
            username: user.username,
            name: (user.lastname || '') + (user.firstname || ' '),
            avatar: user.avatar,
            email: user.email,
            token: accessToken,
            expired: Date.now() + 6 * 60 * 1000,
            role: user.role ?? 'user',
          };

          const ngtoken = {
            token: accessToken,
            expired: Date.now() + 6 * 60 * 1000,
          };

          res.json({
            isok: true,
            nguser,
            ngtoken,
            refreshToken,
            message: '登录成功',
          });
        });
      } else {
        res.status(200).json({ isok: false, message: 'Incorrect Username / Password' });
      }
    } catch (error) {
      res.status(400).json({ isok: false, message: error });
    }
  });

  router.get('/AuthByKeyCloakAndAutoGen', async (req, res) => {
    const { username } = req.query;
    try {
      const userexist = await prisma.Sys_User.findFirst({
        where: {
          username,
        },
      });
      if (userexist != null) {
        // TODO: refreshToken
        const refreshToken = service.generateRefreshToken(userexist, req.ip);

        const nguser = {
          id: userexist.id,
          userid: userexist.userid,
          username: userexist.username,
          name: (userexist.lastname || '') + (userexist.firstname || ' '),
          avatar: userexist.avatar,
          email: userexist.email,
          token: '',
          expired: Date.now() + 6 * 60 * 1000,
          role: userexist.role ?? 'user',
        };

        const ngtoken = {
          token: '',
          expired: Date.now() + 6 * 60 * 1000,
        };

        res.json({
          isok: true,
          nguser,
          ngtoken,
          refreshToken,
          message: '登录成功',
        });

        return;
      }
      const csalt = uuidv4().toLowerCase();
      const hash256 = crypto.createHash('sha256');
      const passwordHash = await hash256.update(`123456${csalt}`, 'utf8').digest('base64');
      const email = `${username}@raopc.com`;
      const userNew = await prisma.Sys_User.create({ username, password: passwordHash, email });

      const refreshToken = service.generateRefreshToken(userNew, req.ip);

      const userRegistered = await prisma.Sys_User.findFirst({
        where: {
          username,
        },
      });
      const nguser = {
        id: userRegistered.id,
        userid: userRegistered.userid,
        username: userRegistered.username,
        name: (userRegistered.lastname || '') + (userRegistered.firstname || ' '),
        avatar: userRegistered.avatar,
        email: userRegistered.email,
        token: '',
        expired: Date.now() + 6 * 60 * 1000,
        role: userRegistered.role ?? 'user',
      };

      const ngtoken = {
        token: '',
        expired: Date.now() + 6 * 60 * 1000,
      };

      res.json({
        isok: true,
        nguser,
        ngtoken,
        refreshToken,
        message: '登录成功',
      });
    } catch (error) {
      res.status(400).json({ isok: false, message: error });
    }
  });

  /**
   * @swagger
   * /api/Users/RefreshToken:
   *   post:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [Authentication]
   *     produces:
   *       - application/json
   *
   *     parameters:
   *       - name: userid
   *         description: user's id.
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: refresh token
   *         schema:
   *           type: object
   */
  router.post('/RefreshToken', async (req, res) => {
    const { userid } = req.query;

    try {
      const userRst = await prisma.Sys_User.findFirst({
        where: {
          userid,
        },
      });
      if (userRst == null) {
        res.status(200).json({ isok: false, message: '用户不存在' });
        return;
      }

      const payload = {
        username: userRst.username,

        // TODO: remove it
        expires: Date.now() + 5 * 60 * 1000,
      };

      req.login(payload, { session: false }, async error => {
        if (error) res.status(400).json({ message: error });
        // TODO: expiresIn
        const accessToken = jwt.sign(JSON.stringify(payload), SECRET_KEY, {
          // expiresIn: 360000,
        });

        // TODO: refreshToken
        // const refreshToken = service.generateRefreshToken(user, req.ip);

        const user = {
          id: userRst.id,
          userid: userRst.userid,
          username: userRst.username,
          name: (userRst.lastname || '') + (userRst.firstname || ' '),
          avatar: userRst.avatar,
          email: userRst.email,
          token: accessToken,
          expired: Date.now() + 5 * 60 * 1000,
        };

        res.json({
          isok: true,
          user,
          message: 'Refresh成功',
        });
      });
    } catch (error) {
      res.status(400).json({ isok: false, message: error });
    }
  });

  /**
   * @swagger
   * /api/Users/getmenutreenodesbyrolename:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: sysorg get all
   *     tags: [Users]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: role
   *         description: user's role.
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: sysmenus
   *         schema:
   *           type: object
   */
  router.get('/getmenutreenodesbyrolename', async (req, res) => {
    const { role } = req.query;

    const rowdata = await prisma.Sys_Role.findFirst({
      where: {
        cRoleName: role,
      },
    });
    if (rowdata != null) {
      const findRoleMenu = {
        OR: [
          {
            AND: { cRoleGuid: rowdata.cGuid, bSelect: true },
          },
          {
            AND: { cRoleGuid: rowdata.cGuid, cParentGuid: null, bSelect: true },
          },
        ],
      };
      const data = await prisma.Sys_RoleMenu.findMany({
        where: findRoleMenu,
        orderBy: {
          sort: 'asc',
        },
      });

      const treeOption = {
        enable: true, // 是否开启转tree插件数据
        keyField: 'key', // 标识字段名称
        valueField: 'value', // 值字段名称
        titleField: 'title', // 标题字段名称

        keyFieldBind: 'cMenuGuid', // 标识字段绑定字段名称
        valueFieldBind: 'cGuid', // 值字段名称绑定字段名称
        titleFieldBind: 'text', // 标题字段名称绑定字段名称
      };
      const treeData = service.toTreeByRecursion(
        data,
        'cMenuGuid',
        'cParentGuid',
        null,
        'children',
        treeOption,
      );

      const MenuData = {
        text: '',
        i18n: 'menu.main',
        group: true,
        hideInBreadcrumb: true,
        children: treeData,
      };
      res.json({ MenuData, message: 'Data obtained.' });
    } else {
      res.json({
        MenuData: {},
        message: 'Data Empty.',
      });
    }
  });

  /**
   * @swagger
   * /api/Users/getabilitybyrolename:
   *   get:
   *     description: sysmenu get all
   *     tags: [Users]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: role
   *         description: user's role.
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: sysmenus
   *         schema:
   *           type: object
   */
  router.get('/getabilitybyrolename', async (req, res) => {
    const { role } = req.query;

    const rowdata = await prisma.Sys_Role.findFirst({
      where: {
        cRoleName: role,
      },
    });
    if (rowdata != null) {
      const data = await prisma.Sys_RoleMenu.findMany({
        where: {
          AND: { cRoleGuid: rowdata.cGuid, bSelect: true },
        },
        select: {
          ability: true,
        },
      });
      const ability = data.map(item => item.ability);
      res.json({ ability, message: 'Data obtained.' });
    } else {
      res.json({ message: 'Data empty.' });
    }
  });

  /**
   * @name update - update a item
   * @return {Object<{ message: string }>}
   *
   * @example PUT /crud-operations/${id}
   */

  /**
   * @swagger
   * /api/Users/item/{cGuid}:
   *   put:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [Users]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cGuid
   *         description: sysrolemenu's id.
   *         in: path
   *         required: true
   *         type: string
   *     requestBody:    #编写参数接收体
   *          required: true  #是否必传
   *          content:
   *              application/json:
   *                  schema:     #参数备注
   *                      type: object    #参数类型
   *                      properties:
   *                          text:
   *                                  type: string    #参数类型
   *                                  description: text     #参数描述
   *                          link:
   *                                  type: string    #参数类型
   *                                  description: link     #参数描述
   *                          i18n:
   *                                  type: string    #参数类型
   *                                  description: i18n     #参数描述
   *                          icon:
   *                                  type: string    #参数类型
   *                                  description: icon     #参数描述
   *                          memo:
   *                                  type: string    #参数类型
   *                                  description: memo     #参数描述
   *                          status:
   *                                  type: string    #参数类型
   *                                  description: status     #参数描述
   *                          sort:
   *                                  type: string    #参数类型
   *                                  description: sort     #参数描述
   *                          cParentGuid:
   *                                  type: string    #参数类型
   *                                  description: cParentGuid     #参数描述
   *                          createdtime:
   *                                  type: Date    #参数类型
   *                                  description: createdtime     #参数描述
   *
   *
   *
   *                  example:        #请求参数样例。
   *                      _id: "string"
   *                      text: "username"
   *                      link: "username"
   *                      i18n: "username"
   *                      icon: "username"
   *                      memo: "username"
   *                      status: 1
   *                      sort: 1
   *                      cParentGuid: "username"
   *                      createdtime: "username"
   *     responses:
   *       200:
   *         description: login
   *         schema:
   *           type: object
   */
  router.put('/item/:cGuid', async (req, res) => {
    const message = await prisma.Sys_User.update({
      where: {
        cGuid_userid: {
          cGuid: req.params.cGuid,
          userid: req.query.userid,
        },
      },
      data: req.body,
    }).then(() => 'SysRole updated');

    res.json({ isok: true, message });
  });

  /**
   * @swagger
   * /api/Users/SysUserUpdatePassWord:
   *   post:
   *     description: SysUserUpdatePassWord
   *     tags: [Users]
   *     produces:
   *       - application/json
   *     requestBody:    #编写参数接收体
   *          required: true  #是否必传
   *          content:
   *              application/json:
   *                  schema:     #参数备注
   *                      type: object    #参数类型
   *                      properties:
   *                          userid:
   *                                  type: string    #参数类型
   *                                  description: text     #参数描述
   *                          orgpwd:
   *                                  type: string    #参数类型
   *                                  description: link     #参数描述
   *                          newpwd:
   *                                  type: string    #参数类型
   *                                  description: i18n     #参数描述
   *
   *
   *
   *                  example:        #请求参数样例。
   *                      userid: "string"
   *                      orgpwd: "123456"
   *                      newpwd: "12345678"
   *     responses:
   *       200:
   *         description: login
   *         schema:
   *           type: object
   */
  router.post('/SysUserUpdatePassWord', async (req, res) => {
    const { userid, orgpwd, newpwd } = req.body;

    try {
      const user = await prisma.Sys_User.findFirst({ where: { userid } });
      if (user == null) {
        res.status(200).json({ isok: false, message: '用户不存在' });
        return;
      }

      let hash256 = crypto.createHash('sha256');
      const orgpwdsha256 = await hash256
        .update(orgpwd + user.salt.toLowerCase(), 'utf8')
        .digest('base64');
      const passwordsMatch = orgpwdsha256 === user.passwordHash;

      if (passwordsMatch) {
        hash256 = crypto.createHash('sha256');
        const passwordHash = await hash256
          .update(newpwd + user.salt.toLowerCase(), 'utf8')
          .digest('base64');
        user.password = passwordHash;
        await prisma.Sys_User.update({
          where: {
            cGuid_userid: {
              cGuid: user.cGuid,
              userid: user.userid,
            },
          },
          data: {
            passwordHash,
          },
        });
        res.json({ isok: true, message: '修改成功' });
      } else {
        res.json({ isok: false, message: '原始密码不正确' });
      }
    } catch (error) {
      res.status(400).json({ isok: false, message: error });
    }
  });

  /**
   * @swagger
   * /api/Users/SysUserResetPassword:
   *   post:
   *     description: SysUserResetPassword
   *     tags: [Users]
   *     produces:
   *       - application/json
   *     requestBody:    #编写参数接收体
   *          required: true  #是否必传
   *          content:
   *              application/json:
   *                  schema:     #参数备注
   *                      type: object    #参数类型
   *                      properties:
   *                          userid:
   *                                  type: string    #参数类型
   *                                  description: text     #参数描述
   *                          orgpwd:
   *                                  type: string    #参数类型
   *                                  description: link     #参数描述
   *                          newpwd:
   *                                  type: string    #参数类型
   *                                  description: i18n     #参数描述
   *
   *
   *
   *                  example:        #请求参数样例。
   *                      userid: "string"
   *                      orgpwd: "123456"
   *                      newpwd: "12345678"
   *     responses:
   *       200:
   *         description: login
   *         schema:
   *           type: object
   */
  router.post('/SysUserResetPassword', async (req, res) => {
    const { userid } = req.body;

    try {
      const user = await prisma.Sys_User.findFirst({ where: { userid } });
      if (user == null) {
        res.status(200).json({ isok: false, message: '用户不存在' });
        return;
      }

      const hash256 = crypto.createHash('sha256');

      const passwordHash = await hash256
        .update(`123456${user.salt.toLowerCase()}`, 'utf8')
        .digest('base64');
      user.password = passwordHash;
      await prisma.Sys_User.update({
        where: {
          cGuid_userid: {
            cGuid: user.cGuid,
            userid: user.userid,
          },
        },
        data: {
          passwordHash: user.password,
        },
      });
      res.json({ isok: true, message: '修改成功' });
    } catch (error) {
      res.status(400).json({ isok: false, message: error });
    }
  });

  /**
   * @swagger
   * /api/Users/UserExists:
   *   get:
   *     description: sysmenu get all
   *     tags: [Users]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: role
   *         description: user's name.
   *         in: query
   *         type: string
   *     responses:
   *       200:
   *         description: sysmenus
   *         schema:
   *           type: object
   */
  router.get('/UserExists', async (req, res) => {
    const { username } = req.query;
    const user = await prisma.Sys_User.findFirst({ where: { username } });
    if (user == null) {
      res.status(200).json({ isok: false, message: '用户不存在' });
    } else {
      res.status(200).json({ isok: true, message: `${username},用户名存在` });
    }
  });

  /**
   * @swagger
   * /api/file-uploads/single:
   *   post:
   *     security:
   *       - Authorization: []
   *     description: file upload
   *     tags: [file-uploads]
   *     produces:
   *       - application/json
   *     requestBody:
   *       content:
   *          multipart/form-data:
   *            schema:
   *              type: object
   *              properties:
   *                id:
   *                  type: string
   *                  format: uuid
   *                address:
   *                   # default Content-Type for objects is `application/json`
   *                  type: object
   *                  properties: {}
   *                photo:
   *                  # default Content-Type for string/binary is `application/octet-stream`
   *                  type: string
   *                  format: binary
   *     responses:
   *       200:
   *         description: multer upload
   *         schema:
   *           type: object
   */
  router.post('/avator/upload', upload.single('avatar'), (req, res) => {
    res.json({ file: req.file });
  });

  /**
   * @swagger
   * /api/Users/item/{userid}:
   *   get:
   *     security:
   *       - Authorization: []
   *     description: Login to the application
   *     tags: [Users]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: userid
   *         description: sysuser's userid.
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: login
   *         schema:
   *           type: object
   */
  router.get('/item/:userid', async (req, res) => {
    const data = await prisma.Sys_User.findFirst({ where: { userid: req.params.userid } });
    res.json({ data, message: 'Data obtained.' });
  });

  // TODO:
  router.post('/token', passport.authenticate('jwt'), async (req, res) => {
    res.json({ user: req.user });
  });

  // TODO:
  router.post('/revoke', async (req, res) => {
    res.json({});
  });

  router.post('/login/2fa-send', async (req, res) => {
    res.json({});
  });

  router.post('/login/2fa-verify', async (req, res) => {
    res.json({});
  });

  /**
   * Two-factor authentication
   */

  router.get('/2fa/settings', (req, res) => {
    res.json({});
  });

  router.post('/2fa/setup', (req, res) => {
    // Authenticator app (HOTP) or SMS (TOTP)
    // req.body

    res.json({});
  });

  router.post('/2fa/setup-send', async (req, res) => {
    res.json({});
  });

  router.post('/2fa/setup-verify', async (req, res) => {
    res.json({});
  });

  /**
   * @name profile - User profile
   *
   * @example GET /authentication/profile Header { Authorization: `Bearer ${token}` }
   */
  router.get('/profile', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { user } = req;

    res.status(200).json({ user });
  });

  /**
   * @name profile - Update user profile
   */
  router.put('/profile', async (req, res) => {
    res.json({});
  });

  router.post('/profile/auth-passport');

  router.post('/impression-password', async (req, res) => {
    res.json({});
  });

  router.post('/forgot-password', async (req, res) => {
    res.json({});
  });

  router.post('/change-email', async (req, res) => {
    res.json({});
  });

  router.post('/change-password', async (req, res) => {
    res.json({});
  });

  /**
   * Social Login
   */

  /**
   * URL /authentication/facebook/login
   * @example <a href="<HOST_NAME>/authentication/facebook/login">
   */
  router.get('/facebook/login', (req, res, next) => {
    // set data in session
    // req.session
    passport.authenticate('facebook')(req, res, next);
  });

  router.get(
    '/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect: 'http://localhost:8000/authentication/login',
    }),
    (req, res) => {
      res.redirect('http://localhost:8000/');
    },
  );

  /**
   * @name facebook-auth
   * @return {Object<{ user: Object }>}
   *
   * @example POST /authentication/facebook/token { access_token: ${accessToken} }
   */
  router.post('/facebook/token', passport.authenticate('facebook-token'), (req, res) => {
    res.json({ user: req.user });
  });

  /**
   * @name google-auth
   * @return {Object<{ user: Object }>}
   *
   * @example POST /authentication/google/token { access_token: ${accessToken} }
   */
  router.post('/google/token', passport.authenticate('google-token'), (req, res) => {
    res.json({ user: req.user });
  });

  router.post('/apple/token', passport.authenticate('apple-token'), (req, res) => {
    res.json({ user: req.user });
  });

  return router;
})();

controller.prefix = '/Users';

export default controller;
