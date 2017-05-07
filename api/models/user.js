/**
 * 用户
 */
const mongoose = require('mongoose');
const {
  Schema
} = mongoose;
const crypto = require('crypto');
const config = require('../config');

const DEFINITION = {
  // 关联模型数据
  articleNum: {
    type: Number,
    default: 0
  },
  // 用户名
  name: {
    type: String,
    unique: true,
    trim: true,
    required: [true, '用户名不能为空'],
    maxlength: [40, '用户名不能超过40个字符']
  },
  // 用户邮箱
  email: {
    type: String,
    unique: true,
    trim: true,
    required: [true, '邮箱不能为空'],
    match: [/^[^@]+@[^@.]+(\.[^@.]+)+$/, '邮箱格式不合法']
  },
  // 角色
  role: {
    type: String,
    default: 'user',
    enum: {
      values: ['user', 'administrator'],
      message: '{VALUE}不是合法角色'
    }
  },
  // 头像
  avatar: {
    type: String,
    match: [/^http(s)?:\/\//, '头像必须是有效URL'],
    get: function (val) {
      return val || 'https://wx1.sinaimg.cn/mw690/852a97e7gy1fetg8cv964j20bo0bogld.jpg';
    }
  },
  // 简介
  introduction: {
    type: String,
    get: function (val) {
      return val || '这人很懒';
    }
  },
  // 私有盐
  salt: {
    type: String,
    default: function () {
      return Date.now() + '';
    }
  },
  // 密码
  password: {
    type: String,
    required: [true, '密码不能为空'],
    minlength: [6, '密码不能少于6个字符'],
    maxlength: [60, '密码不能多于60个字符']
  },
  // 标识
  token: {
    type: String,
    unique: true
  },
  // 状态
  status: {
    type: String,
    default: 'normal',
    // 已删除，正常，被屏蔽（不能发言、评论）
    enum: ['deleted', 'normal', 'blocked']
  }
};

const OPTIONS = {
  toJSON: {virtuals: true, getters: true},
  timestamps: true
};

const schema = new Schema(DEFINITION, OPTIONS);


// 实例方法
schema.methods = {
  // 验证密码
  verifyPassword(password) {
    password = encryptPassword(password, this.salt);

    return this.password === password;
  }
};

// 加密存库
schema.pre('save', function (next) {
  // 对密码加密
  this.password = encryptPassword(this.password, this.salt);
  // 创建token
  this.token = createToken(this.id, this.password);

  next();
});



/**
 * 对用户密码进行加密（加密后才能存库）
 *
 * @param {string} password 用户输入的密码
 * @param {string} salt User的salt
 */
function encryptPassword(password, salt) {
  // 共用salt
  let hmac = crypto.createHmac('sha256', password);
  // // 用户salt
  salt = salt + config.salt;
  password = hmac.update(salt).digest('hex');

  return password;
}


/**
 * 创建token
 *
 * @param {ObjectId} id 用户ID
 * @param {String} password 加密后的密码
 * @returns token
 */
function createToken(id, password) {
  let hmac = crypto.createHmac('sha256', password);
  let token = hmac.update(id).digest('hex');

  return token;
}


const User = mongoose.model('User', schema);

// 方便测试
User._DEFINITION = DEFINITION;
User._OPTIONS = OPTIONS;
User._createToken = createToken;
User._encryptPassword = encryptPassword;
module.exports = User;
