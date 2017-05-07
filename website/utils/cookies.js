/**
 * 管理所有cookie
 * 整站的cookie都定义在这里，统一管理接口
 */

// 移除cookie
function remove(res) {
  let options = {};
  Object.assign(options, this.options, {expires: 0});
  res.cookie(this.key, '', options);
}


/**
 * 用户
 */
exports.user = {
  key: 'user',

  options: {
    signed: true,
    httpOnly: true,
    maxAge: (1000 * 60 * 60 * 24 * 30)
  },

  set(res, user) {
    res.cookie(this.key, user, this.options);
  },

  get(req) {
    let result = req.signedCookies ? req.signedCookies[this.key] : null;

    return result;
  },

  remove(res) {
    remove.call(this, res);
  }
};
