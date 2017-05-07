const utils = require('./utils');

// 某篇文章的所有评论
exports.findByArticleId = function (articleId, page, perPage) {
  let promise = utils.get(`/api/articles/${articleId}/comments`)
    .query({page: page, per_page: perPage});

  return utils.proccessResponse(promise);
};

// 创建评论
exports.create = function (comment, token) {
  let promise = utils.post(`/api/users/${comment.userId}/comments`)
    .set('X-Token', token)
    .send(comment);

  return utils.proccessResponse(promise);
};

// 删除评论
exports.delete = function (id, userId, token) {
  let promise = utils.delete(`/api/users/${userId}/comments/${id}`)
    .set('X-Token', token);

  return utils.proccessResponse(promise);
};
