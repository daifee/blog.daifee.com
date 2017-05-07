/**
 * 根据角色授权访问，roles:
 * * user
 * * self(根据user扩展的角色)
 * * admin
 */
const proxyUser = require('../proxy/user');
const CustomError = require('../CustomError');

// 匹配user.role，值越大，权利越大
// self是逻辑角色，在user.role中没有定义
// guest是指游客，在user.role中没有定义
const MODE_MAP = {
  'guest': 0,
  'user': 1,
  'self': 2,
  'administrator': 4
};


/**
 * 限制访问权限，角色权限等于或高于role的角色才可以访问接下来的中间件
 * 通过验证后会将当前访问者赋值在req._visitor
 * @param {string} role 用户角色
 * * guest 游客。没必要定义
 * * user 用户。注册的用户
 * * self 自己。自己的资源（路由必须定义:userId）
 * * administrator 管理员
 */
module.exports = function (role = '') {
  if (!MODE_MAP[role] || role === 'guest') {
    throw new Error(`参数错误，${role}是无效的role`);
  }

  return function (req, res, next) {
    let requestRole = 'guest';
    let token = req.headers['x-token'];
    // 用于定义逻辑角色
    let userId = req.params.userId;
    if (!token) {
      return Promise.resolve(new CustomError(1002)).then(function (err) {
        return next(err);
      });
    }

    return proxyUser.findOneByToken(token).then(function (user) {
      if (!user) {
        requestRole = 'guest';
      } else {
        requestRole = user.role;
      }

      // user可以升级到self
      if (requestRole === 'user' && user.id === userId) {
        requestRole = 'self';
      }

      if (MODE_MAP[requestRole] >= MODE_MAP[role]) {
        // 当前访问者
        req._visitor = user;
        return next();
      } else {
        return next(new CustomError(1003));
      }
    }).catch(function (err) {
      // mongodb error
      return next(err);
    });
  };
};

