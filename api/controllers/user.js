const proxyUser = require('../proxy/user');
const {output} = require('./utils');
const User = require('../models/user');
const Pagination = require('../models/pagination');
const copyObject = require('../utils/copyObject');
const CustomError = require('../CustomError');

// 用户授权
exports.authorize = function (req, res, next) {
  let user = new User(req.body);
  let err = user.validateSync(['name', 'password']);
  let promise;

  if (err) {
    err = new CustomError(1001);
    promise = Promise.reject(err);
  } else {
    promise = proxyUser.verify(user.name, user.password);
  }

  output(promise, res, next);
};


// 所有用户
exports.getList = function (req, res, next) {
  let pagination = new Pagination(req.query);

  let promise = proxyUser.find(pagination.page, pagination.perPage);

  output(promise, res, next);
};

// 通过用户名查找用户
exports.getOneByName = function (req, res, next) {
  let name = req.params.name;
  let promise = proxyUser.findOneByName(name);

  output(promise, res, next);
};


// 创建用户
exports.create = function (req, res, next) {
  let userData = copyObject(req.body, ['role', 'articleNum']);
  let user = new User(userData);
  let err = user.validateSync();
  let promise;

  if (err) {
    err = new CustomError(1007, err.toString());
    promise = Promise.reject(err);
  } else {
    promise = proxyUser.createOne(userData).catch(function (err) {
      if (err.code === 11000) {
        err = new CustomError(1008);
      }

      throw err;
    });
  }

  output(promise, res, next);
};

// 更新用户
exports.update = function (req, res, next) {
  let visitor = req._visitor;
  let userId = req.params.userId;
  let userData = copyObject(req.body, [
    '_id',
    'articleNum',
    'salt',
    'password',
    'token',
    'status'
  ]);
  let promise;
  let user = new User(userData);
  let err = user.validateSync(Object.keys(userData));
  err && (err = new CustomError(1009, err.toString()));

  if (!err && (visitor.role !== 'administrator' && userData.role)) {
    // 管理员才能更新role
    err = new CustomError(1006);
  }


  if (err) {
    promise = Promise.reject(err);
  } else {
    promise = proxyUser.updateOneById(userId, userData).catch(function (err) {
      if (err.code === 11000) {
        err = new CustomError(1008);
      }

      throw err;
    });
  }

  output(promise, res, next);
};


// 删除用户
exports.delete = function (req, res, next) {
  let id = req.params.userId;

  let promise = proxyUser.deleteOneById(id);

  output(promise, res, next);
};

