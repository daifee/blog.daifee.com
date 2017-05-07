/**
 * 封装数据接口
 */
const superagent = require('superagent');
const config = require('../config');
const HOST = config.apiHost;

function request(method, url) {
  url = `${HOST}${url}`;

  return superagent[method](url)
    .set('Accept', 'application/json');
}

exports.proccessResponse = function (requestPromise) {
  return requestPromise.then(function (response) {
    return response.body;
  }).catch(function (err) {
    let error;
    let response = err.response;

    if (response) {
      let body = response.body;
      error = new Error(body.message);
      error.code = body.code;
      error.status = response.status;
    } else {
      error = new Error(err.message || '请求数据出错');
      error.status = 500;
    }

    throw error;
  });
};

exports.get = function (url) {
  return request('get', url);
};


exports.post = function (url) {
  return request('post', url);
};

exports.patch = function (url) {
  return request('patch', url);
};

exports.delete = function (url) {
  return request('delete', url);
};


// 用户登录认证
// 用户注册
// 所有文章
// 创建文章
// 更新文章
