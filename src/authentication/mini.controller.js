import { Router } from 'express';
import service from './service';
import { SECRET_KEY } from '~/env';
import jwt from 'jsonwebtoken';
import prisma from '../core/prisma';
const controller = (() => {
  const router = Router();


  const axios = require('axios');

  router.post('/getphone', async (req, res) => {
    const appId = 'wx3eb7097c7913148b';
    const appSecret = '7622e140108f9de5616c7f46209a0da2';
    const code = req.body.code; // 确保前端传递了code参数

    try {
      // 获取access_token
      let response = await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`);
      let access_token = response.data.access_token;

      console.log("access_token:", access_token);
      console.log("code1111", code);
      // 准备调用getuserphonenumber接口的数据
      let postData = {
        "code": code,
      };

      // 调用getuserphonenumber接口
      response = await axios.post(`https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${access_token}`, postData
      );

      // 打印结果
      console.log("phoneNumberData:", response.data);

      // 发送响应
      res.json({
        isOk: true,
        message: '获取手机号成功',
        data: response.data
      });
    } catch (error) {
      console.error("Error:", error);

      if (error.response) {
        // 发送错误响应，包含微信服务器返回的错误信息
        res.status(error.response.status).json({
          isOk: false,
          message: '获取手机号失败',
          error: error.response.data
        });
      } else {
        // 发送错误响应，包含其他类型的错误信息
        res.status(500).json({
          isOk: false,
          message: '服务器错误',
          error: error.message
        });
      }
    }
  });
  router.post('/login', async (req, res) => {
    const phone = req.body.phone; // 确保前端传递了code参数
    if (phone == null || phone == '' || phone == undefined || phone == 'undefined') {
      return res.json({ isok: false, message: '手机号不能为空' });

    }
    let user = await prisma.sys_mini_user.findFirst({
      where: {
        phone
      }
    })
    if (user == null) {
      user = await prisma.sys_mini_user.create({
        data: {
          userid: "UID" + service.getCurrentTimeFormatted(),
          phone: phone,
          dAddTime: new Date
        }
      })
    }
    const payload = {
      phone: user.phone,
      // timestamp second
      exp: Date.now() / 1000 + 6 * 60,
    };

    req.login(payload, { session: false }, async error => {
      if (error) res.status(400).json({ message: error });
      // TODO: expiresIn
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
        phone: user.phone,
        expired: Date.now() + 5 * 60 * 1000
      };

      const ngtoken = {
        token: accessToken,
        expired: Date.now() + 5 * 60 * 1000,
      };

      res.json({
        isok: true,
        nguser,
        ngtoken,
        message: '登录成功',
      });
    });
  });

  return router;
})();

controller.prefix = '/mini/Users';

export default controller;
