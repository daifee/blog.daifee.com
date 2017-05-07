const secret = require('../secret.json');

const PRODUCTION = process.env.NODE_ENV !== 'development';

let config = {
  production: PRODUCTION,
  apiHost: PRODUCTION ? 'http://127.0.0.1:8088' : 'http://127.0.0.1:8087',
  // 项目根目录
  PROJECT_ROOT: __dirname,
  title: PRODUCTION ? '我的博客' : 'dev | 我的博客',
  cookieSecret: secret.cookieSecret
};


module.exports = config;
