const cookies = require('../utils/cookies');

module.exports = function (req, res, next) {

  // 当前请求的用户
  let user = cookies.user.get(req);
  res.locals._user = user || {};

  next();
};
