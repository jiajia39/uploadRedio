import { Router } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../core/prisma';

// import otp from 'otplib';

import { SECRET_KEY } from '~/env';

const controller = (() => {
  const router = Router();

  /**
   * @swagger
   * /api/mobile/Users/Authenticate:
   *   post:
   *     description: Login to the application
   *     tags: [mobile-Authenticate]
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
  router.post('/authenticate', async (req, res) => {
    const { username, password } = req.body;

    try {
      const user = await prisma.sys_user.findFirst({
        where: {
          username,
        },
      }).catch(e => {
        console.error(e);
      });

      // Check if user exists
      if (user == null) {
        res.status(200).json({ isok: false, message: '用户不存在' });
        return;
      }

      const hash256 = crypto.createHash('sha256');
      const pwdsha256 = hash256.update(password + user.salt.toLowerCase(), 'utf8').digest('base64');

      const passwordsMatch = pwdsha256 === user.passwordHash;

      // Check if the passwords match
      if (passwordsMatch) {
        const payload = {
          username: user.username,
          // timestamp in seconds
          // exp: Date.now() / 1000 + 6 * 60,
        };

        req.login(payload, { session: false }, async error => {
          if (error) {
            res.status(400).json({ message: error });
            return;
          }

          const accessToken = jwt.sign(JSON.stringify(payload), SECRET_KEY, {
            header: {
              typ: 'JWT',
            },
          });

          const nguser = {
            id: user.id,
            userid: user.userid,
            username: user.username,
            name: (user.lastname || '') + (user.firstname || ' '),
            avatar: user.avatar,
            email: user.email,
            token: accessToken,
            // expired: Date.now() + 5 * 60 * 1000,
            role: user.role ?? 'user',
          };

          const ngtoken = {
            token: accessToken,
            // expired: Date.now() + 5 * 60 * 1000,
          };

          res.json({
            isok: true,
            nguser,
            ngtoken,
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
  return router;
})();

controller.prefix = '/miniprogram/Users';

export default controller;
