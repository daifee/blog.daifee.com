const express = require('express');
const config = require('./config');
const helpers = require('./utils/helpers');
const setResLocal = require('./middlewares/setResLocal');


const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');
const ejs = require('ejs');

const router = require('./router');
const PROJECT_ROOT = config.PROJECT_ROOT;

/**
 * init 初始化website
 */
module.exports = function (app) {
  app.locals.title = config.title;
  app.locals.helpers = helpers;

  // 静态资源（CSS、JS、HTML）
  app.use('/static', express.static(`${PROJECT_ROOT}/static`));

  app.use(methodOverride('_method', {methods: ['POST', 'GET']}));
  // 解析http请求体
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));
  // // 解析cookie
  app.use(cookieParser(config.cookieSecret));

  // session
  // TODO 生成环境不应该使用
  app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: config.cookieSecret,
    cookie: {
      maxAge: 60000
    }
  }));

  // 实现flash数据
  app.use(flash());
  // 配置ejs模板引擎
  app.set('views', `${PROJECT_ROOT}/views`);
  app.set('view engine', 'ejs');
  app.engine('ejs', ejs.renderFile);

  //
  app.use(setResLocal);
  app.use(router);
};
