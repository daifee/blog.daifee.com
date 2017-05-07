const Article = require('../models/article');
const proxyUser = require('./user');
const {
  generatePaginationQueryOptions,
  toJSON,
  associateUser
} = require('./helper');

// 创建一篇文章
exports.createOne = function (article) {
  return Article.create(article).then(function (article) {
    return proxyUser.increaseArticleNum(article.userId).then(function () {
      return toJSON(article);
    });
  });
};

// 通过ID更新文章
exports.updateOneById = function (id, article) {
  return Article.findOneAndUpdate({_id: id}, article, {new: true}).then(toJSON);
};

// 通过ID删除文章
exports.deleteOneById = function (id) {
  return exports.updateOneById(id, {status: 'deleted'}).then(function (article) {
    return proxyUser.reduceArticleNum(article.userId).then(function () {
      return article;
    });
  });
};

exports.deleteByUserId = function (userId) {
  return Article.update({userId}, {status: 'deleted'}, {multi: true}).exec();
};

// 通过ID查找文章
exports.findOneById = function (id) {
  return Article.findOne({
    '$and': [
      {_id: id},
      {status: {'$ne': 'deleted'}}
    ]
  }).then(associateUser);
};

// 查找文章（分页）
exports.find = function (page = 1, perPage = 20, selector = {}) {
  let queryOptions = generatePaginationQueryOptions(page, perPage);
  Object.assign(queryOptions, {
    sort: {createdAt: -1}
  });

  selector = {
    '$and': [
      selector,
      {status: {'$ne': 'deleted'}}
    ]
  };

  return Article.find(selector, {}, queryOptions).then(associateUser);
};

// 通过用户ID查找文章（分页）
exports.findByUserId = function (userId, page = 1, perPage = 20) {
  return exports.find(page, perPage, {userId});
};


// 增加评论数量
exports.increaseCommentNum = function (id, num = 1) {
  return exports.updateOneById(id, {'$inc': {commentNum: num}});
};

// 减少评论数量
exports.reduceCommentNum = function (id, num = -1) {
  return exports.increaseCommentNum(id, num);
};

// 增加阅读数量
exports.increaseViews = function (id, num = 1) {
  return exports.updateOneById(id, {'$inc': {views: num}});
};
