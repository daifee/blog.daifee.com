/**
 * 保存请求日志
 */
const fs = require('fs');
const config = require('../config');
const logPath = config.rootPath + '/logs';
const logFile = logPath + '/access.log';
const morgan = require('morgan');

try {
  fs.statSync(logPath);
} catch (err) {
  fs.mkdirSync(logPath);
}

const logFileStream = fs.createWriteStream(logFile, {flags: 'a'});

/**
 * 日志
 * * 时间
 * * ip
 * * http版本
 * * url
 * * http method
 * * UA
 * * 响应状态
 * * 响应速度
 */
module.exports = morgan(':remote-addr :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time[digits]', {stream: logFileStream});


