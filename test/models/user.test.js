const {
  expect
} = require('chai');
const User = require('../../api/models/user');
const {
  _DEFINITION,
  _OPTIONS,
  _encryptPassword,
  _createToken
} = User;
const mongoose = require('mongoose');
// const {ObjectId} = mongoose.Schema;
const {objectDeepEqual} = require('../helper');

describe('models/user.test.js', function () {
  it('模块返回model构造函数', function () {
    expect(User).to.equal(mongoose.model('User'));
  });

  it('检测Schema的definition', function () {
    const definition = {
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
        // 已删除，正常，被屏蔽
        enum: ['deleted', 'normal', 'blocked']
      }
    };

    objectDeepEqual(_DEFINITION, definition, function (value1, value2) {
      if (typeof value1 === 'function' && typeof value1 === 'function') {
        // 函数体代码完全相同
        value1 = value1.toString().replace(/\s/g, '');
        value2 = value2.toString().replace(/\s/g, '');
        expect(value1).to.equal(value2);
      } else {
        expect(value1).to.equal(value2);
      }
    });
  });

  it('检测Schema的options', function () {
    expect(_OPTIONS).to.have.property('timestamps', true);
    expect(_OPTIONS.toJSON).to.deep.equal({virtuals: true, getters: true});
  });

  it('加密密码 _encryptPassword(password, salt)', function () {
    let pw = _encryptPassword('zxcvbnm', 'salt');
    expect(pw).to.be.ok;
    // sha256
    expect(pw.length === 64).to.be.ok;
  });

  it('创建token _createToken(id, password)', function () {
    let user = new User();
    let token = _createToken(user.id, 'zxcvbnm');
    expect(token.length === 64).to.be.ok;
  });
});
