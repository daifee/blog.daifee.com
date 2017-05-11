const utils = require('./utils');

// 创建文章
exports.create = function (token, article) {
  let promise = utils
    .post(`/api/users/${article.userId}/articles`)
    .set('X-Token', token)
    .send(article);

  return utils.proccessResponse(promise);
};

// 通过ID更新文章
exports.updateOneById = function (article, token) {
  let promise = utils
    .patch(`/api/users/${article.userId}/articles/${article.id}`)
    .set('X-Token', token)
    .send(article);

  return utils.proccessResponse(promise);
};

// 通过ID查找文章
exports.findOneById = function (id, render) {
  let promise = utils.get(`/api/articles/${id}`).query({render});

  return utils.proccessResponse(promise);
};

// 删除一篇文章
exports.deleteById = function (id, userId, token) {
  let promise = utils.delete(`/api/users/${userId}/articles/${id}`)
    .set('X-Token', token);

  return utils.proccessResponse(promise);
};


// 所有文章
exports.find = function (page, perPage) {
  let promise = utils.get('/api/articles')
    .query({page: page, per_page: perPage});

  return utils.proccessResponse(promise);
};

// 用户的所有文章
exports.findByUserId = function (userId, page, perPage) {
  let promise = utils.get(`/api/users/${userId}/articles`)
    .query({page: page, per_page: perPage});

  return utils.proccessResponse(promise);
};
