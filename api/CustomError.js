
/**
 * 每定义一个新的CustomError实例都需要在这里定义一个新的code
 */
const CODES = {
  /**
   * 1xxx 请求数据不合法，客户端可以修改请求数据重新请求。例如：
   * * 用户名格式不合法
   * * 邮箱已被注册
   * * 不够权限的操作
   * * 请求太频繁
   *
   */
  '1000': [400, '用于测试'],
  // 登录授权
  '1001': [400, '用户名或密码格式错误'],
  // 验证token authorize.js
  '1002': [401, '未授权'],
  // 验证token authorize.js
  '1003': [403, '不够权限'],
  // 验证用户 proxy.user.verify
  '1004': [400, '用户名或密码错误'],
  // 更新用户信息
  '1005': [403, '没有权限更新这些key'],
  '1006': [403, '不够权限更新role的值'],
  '1007': [400, '用户名、密码或邮箱格式错误'],
  '1008': [400, '用户名或邮箱已被注册'],
  '1009': [400, '数据格式错误'],
  '1010': [400, '数据中不能包含这些key'],
  '1011': [400, '创建文章数据格式错误'],
  '1012': [400, '更新文章时提交格式错误的数据'],
  '1013': [400, '评论数据格式错误'],
  /**
   * 2xxx 程序内部错误。例如：
   * * 程序出现bug，不可避免的
   * * 数据库抛出异常
   */
  '2000': [500, '未知错误'],
  '2001': [500, 'ValidationError: 输入前没有做好数据检测'],
  '2002': [500, 'MongoError: 输入前没有做好数据检测']
};

/**
 * 自定义错误
 * @param {number} code 错误码
 * @param {string} message 错误信息
 * @param {number} status 捕获错误后响应的http状态码
 */
class CustomError extends Error {
  constructor(code, message) {
    if (typeof code !== 'number') {
      code = parseInt(code, 10);
    }

    let key = code + '';
    let value = CODES[key];

    if (!value) {
      throw new TypeError(`${code}未在CODES定义`);
    }

    if (!message) {
      message = value[1] || '';
    }

    super(message);

    this.code = code;
    this.status = value[0] || 500;
    this.name = 'CustomError';
  }
}

CustomError.CODES = CODES;

module.exports = CustomError;

module.exports.CODES = CODES;
