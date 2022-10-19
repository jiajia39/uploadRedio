import { Router } from 'express';
import influxservice from '../influx/service';
import prisma from '../core/prisma';
import service from './service';
const controller = (() => {
  const router = Router();
  router.get('/getvalue', function(req, res) {
    res.json(service.dateFmt(new Date()));
    // console.log( service.isMorOrAft(new Date()));
    // console.log(new Date());

    // let date = new Date();
    // // let dateStr = date.getFullYear() + '-' + date.getMonth()+1 + '-' +date.getDate() ;
    // let year = date.getFullYear();
    // let dateStr = year + '-';
    // let month = date.getMonth() + 1;
    // let day = date.getDate();
    // if (month < 10) {
    //   dateStr = dateStr + '0' + month + '-';
    // } else {
    //   dateStr = dateStr + month + '-';
    // }
    // if (day < 10) {
    //   dateStr = dateStr + '0' + day;
    // } else {
    //   dateStr = dateStr + day;
    // }

    // console.log(new Date(dateStr));
  });

  return router;
})();

controller.prefix = '/pems/meterValues';

export default controller;
