const utils = require('./utils');




// 查找一个用户
exports.findOneByName = function (name) {
  let promise = utils.get(`/api/users/${name}`);

  return utils.proccessResponse(promise);
};

// 验证用户登录信息
exports.verify = function (user) {
  let promise = utils.post('/api').send(user);

  return utils.proccessResponse(promise);
};

// 创建用户
exports.create = function (user) {
  let promise = utils.post('/api/users').send(user);

  return utils.proccessResponse(promise);
};
