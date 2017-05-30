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
exports.findOneById = function (id, options = {}) {
  options = Object.assign({
    content: true
  }, options);

  return Article.findOne({
    '$and': [
      {_id: id},
      {status: {'$ne': 'deleted'}}
    ]
  }).then(function (article) {
    return associateUser(article).then(function (article) {
      if (!article) return article;

      article = preprocess(article, options);

      return article;
    });
  });
};

// 查找文章（分页）
exports.find = function (page, perPage, options = {}) {
  return exports.search(page, perPage, {status: {'$ne': 'deleted'}}, options);
};


// 搜索文章，支持 and 查询 userId, title, status
exports.search = function (page, perPage, selector, options = {}) {
  let queryOptions = generatePaginationQueryOptions(page, perPage);
  Object.assign(queryOptions, {
    sort: {createdAt: -1}
  });

  let _selector = {};
  Object.keys(selector).forEach(function (key) {
    if (['_id', 'userId', 'title', 'status'].indexOf(key) !== -1 && selector[key]) {
      _selector[key] = selector[key];
    }
  });

  return Article.find(_selector, {}, queryOptions).then(function (articles) {
    return associateUser(articles).then(function (articles) {
      articles = articles.map(function (article) {
        return preprocess(article, options);
      });

      return articles;
    });
  });
};



// 通过用户ID查找文章（分页）
exports.findByUserId = function (userId, page = 1, perPage = 20, options = {}) {
  return exports.search(page, perPage, {
    userId: userId,
    status: {'$ne': 'deleted'}
  });
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


/**
 * 预处理article文档
 * options.render  渲染content
 * options.content  是否返回content
 */
function preprocess(article, options = {}) {
  if (!article) return article;

  options = Object.assign({
    render: false,
    content: false
  }, options);

  if (options.render) {
    article.content = Article.renderContent(article.content);
  }

  if (!options.content) {
    delete article.content;
  }

  return article;
}
