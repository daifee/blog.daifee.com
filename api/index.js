const express = require('express');
const config = require('./config');
const router = require('./router');
const accessLog = require('./middlewares/accessLog');
/**
 * express实例
 */
const app = express();
// 日志
app.use(accessLog);
app.use('/api', router);

app.listen(config.port, '127.0.0.1', function () {
  console.log('绑定端口=>' + config.port);
});

module.exports = app;
