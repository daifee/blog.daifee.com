/**
 * 连接mongodb，并装载所有模型
 */
const mongoose = require('mongoose');
const config = require('../config');

// 原生Promise
mongoose.Promise = Promise;
exports.connection = mongoose.connect(config.mongodb.uri, config.mongodb.options);


require('./article');
require('./comment');
require('./user');
require('./pagination');
