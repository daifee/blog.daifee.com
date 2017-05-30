const User = require('../models/user');
const CustomError = require('../CustomError');
const helper = require('./helper');
const proxyArticle = require('./article');
const proxyComment = require('./comment');

// 创建一个用户
exports.createOne = function (user) {
  return User.create(user).then(function (user) {
    // 删除私密数据
    user.set('password', undefined);
    user.set('salt', undefined);
    //
    return helper.toJSON(user);
  });
};

// 验证用户名和密码
exports.verify = function (name, password) {
  return User.findOne({name}).then(function (user) {
    if (user && user.verifyPassword(password)) {
      // 删除私密数据
      user.set('password', undefined);
      user.set('salt', undefined);

      return helper.toJSON(user);
    }

    throw new CustomError(1004);
  });
};

// 更新一个用户数据
exports.updateOneById = function (id, user) {
  return User.findOneAndUpdate({_id: id}, user, {new: true}).then(function (user) {
    user.set('password', undefined);
    user.set('salt', undefined);

    return helper.toJSON(user);
  });
};

// 删除用户
exports.deleteOneById = function (id) {
  return exports.updateOneById(id, {status: 'deleted'}).then(function (user) {
    // 删除文章和评论
    return Promise.all([
      proxyArticle.deleteByUserId(id),
      proxyComment.deleteByUserId(id)
    ]).then(function () {
      return user;
    });
  });
};

// 屏蔽用户
exports.blockOneById = function (id) {
  return exports.updateOneById(id, {status: 'blocked'});
};

// 通过token查找
exports.findOneByToken = function (token) {
  return findOne({token}, '-salt -password');
};

// 通过用户名查找
exports.findOneByName = function (name) {
  return findOne({name});
};

// 通过用户ID查找
exports.findOneById = function (id) {
  return findOne({_id: id});
};

// 通过id数组查找多个用户 $in
exports.findByIds = function (ids) {
  return User.find({_id: {'$in': ids}}, '-salt -password -token').then(helper.toJSON);
};

// 分页查找
exports.find = function (page = 1, perPage = 20) {
  return exports.search(page, perPage, {status: {'$ne': 'deleted'}});
};

// and查找 name, email, role, status
exports.search = function (page = 1, perPage = 20, selector = {}) {
  let queryOptions = helper.generatePaginationQueryOptions(page, perPage);
  Object.assign(queryOptions, {
    sort: {createdAt: -1}
  });

  let _selector = {};
  Object.keys(selector).forEach(function (key) {
    if (['_id', 'name', 'email', 'role', 'status'].indexOf(key) !== -1 && selector[key]) {
      _selector[key] = selector[key];
    }
  });

  return User.find(_selector, '-salt -password -token', queryOptions).then(helper.toJSON);
};


// 增加文章数量
exports.increaseArticleNum = function (id, num = 1) {
  return exports.updateOneById(id, {$inc: {articleNum: num}});
};

// 减少文章数量
exports.reduceArticleNum = function (id, num = -1) {
  return exports.increaseArticleNum(id, num);
};


/**
 *
 * @param {object} selector mongodb 选择器
 * @param {object|string} fields 返回的字段
 */
function findOne(selector = {}, fields = '-salt -password -token') {
  return User.findOne(selector, fields).then(helper.toJSON);
}


