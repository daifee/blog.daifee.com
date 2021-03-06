const Comment = require('../models/comment');
const proxyArticle = require('./article');
const {
  toJSON,
  associateUser,
  generatePaginationQueryOptions
} = require('./helper');


// 创建一篇评论
exports.createOne = function (comment) {
  return Comment.create(comment).then(function (comment) {
    return proxyArticle.increaseCommentNum(comment.articleId).then(function () {
      return toJSON(comment);
    });
  });
};

// 更新一篇评论
exports.updateOneById = function (id, comment) {
  return Comment.findOneAndUpdate({_id: id}, comment, {new: true}).then(toJSON);
};

// 删除一篇评论
exports.deleteOneById = function (id) {
  return exports.updateOneById(id, {status: 'deleted'}).then(function (comment) {
    return proxyArticle.reduceCommentNum(comment.articleId).then(function () {
      return comment;
    });
  });
};

// 删除某用户的所有评论
exports.deleteByUserId = function (userId) {
  return Comment.update({userId}, {status: 'deleted'}, {multi: true}).exec();
};

// 通过ID查找评论
exports.findOneById = function (id) {
  return Comment.findOne({_id: id}).then(associateUser);
};

// 搜索 支持：and查询（userId, articleId, status）
exports.search = function (page = 1, perPage = 20, selector = {}) {
  let queryOptions = generatePaginationQueryOptions(page, perPage);
  Object.assign(queryOptions, {
    sort: {createdAt: -1}
  });

  let _selector = {};
  Object.keys(selector).forEach(function (key) {
    if (['_id', 'userId', 'articleId', 'status'].indexOf(key) !== -1 && selector[key]) {
      _selector[key] = selector[key];
    }
  });

  return Comment.find(_selector, {}, queryOptions).then(associateUser);
};

// 查找评论（分页）
exports.find = function (page, perPage, selector = {}) {
  selector = Object.assign({}, selector, {
    status: {'$ne': 'deleted'}
  });

  return exports.search(page, perPage, selector);
};

// 查找某用户的评论（分页）
exports.findByUserId = function (userId, page = 1, perPage = 20) {
  return exports.find(page, perPage, {userId});
};

// 查找某篇文章的评论（分页）
exports.findByArticleId = function (articleId, page = 1, perPage = 20) {
  return exports.find(page, perPage, {articleId});
};

