/**
 * 保存请求日志
 */
const fs = require('fs');
const logPath = process.cwd() + '/logs';
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
module.exports = morgan(':date[iso]|:http-version|:url|:method|:user-agent|:status|:response-time[digits]', {stream: logFileStream});


