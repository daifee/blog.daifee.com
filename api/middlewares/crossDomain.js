
// preflight有效时长
const maxAge = 60 * 60 * 24;

/**
 * 判断是否跨域请求，如果是，则允许
 */
module.exports = function (req, res, next) {
  // 跨域请求
  if (req.get('Origin')) {
    // 允许所有Origin
    res.set('Access-Control-Allow-Origin', '*');

    let method = req.method;
    let requestHeaders = req.get('Access-control-Request-Method');

    // 响应preflight请求
    if (method === 'OPTIONS' && requestHeaders) {
      res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH');
      res.set('Access-Control-Allow-Headers', requestHeaders);
      res.set('Access-Control-Max-Age', maxAge);
      res.status(204);
      res.end();
      return;
    }
  }

  return next();
};
