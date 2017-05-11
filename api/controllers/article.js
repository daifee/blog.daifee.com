const proxyArticle = require('../proxy/article');
const {output} = require('./utils');
const Article = require('../models/article');
const Pagination = require('../models/pagination');
const copyObject = require('../utils/copyObject');
const CustomError = require('../CustomError');

// 创建文章
exports.create = function (req, res, next) {
  let articleData = copyObject(req.body, ['views', 'commentNum']);
  articleData.userId = req.params.userId;

  let article = new Article(articleData);
  let err = article.validateSync();
  let promise;
  if (err) {
    err = new CustomError(1011, err.toString());
    promise = Promise.reject(err);
  } else {
    promise = proxyArticle.createOne(articleData);
  }

  output(promise, res, next);
};


exports.getOneById = function (req, res, next) {
  let id = req.params.id;
  let render = req.query.render === '1';
  let promise = proxyArticle.findOneById(id, {render});

  output(promise, res, next);
};


exports.update = function (req, res, next) {
  let id = req.params.id;
  let articleData = copyObject(req.body, ['id', 'userId', 'commentNum', 'views']);

  let article = new Article(articleData);
  let err = article.validateSync(Object.keys(articleData));
  let promise;
  if (err) {
    err = new CustomError(1012, err.toString());
    promise = Promise.reject(err);
  } else {
    promise = proxyArticle.updateOneById(id, articleData);
  }

  output(promise, res, next);
};


exports.delete = function (req, res, next) {
  let id = req.params.id;

  let promise = proxyArticle.deleteOneById(id);

  output(promise, res, next);
};


exports.getListByUserId = function (req, res, next) {
  let pagination = new Pagination(req.query);
  let userId = req.params.userId;

  let promise = proxyArticle.findByUserId(userId, pagination.page, pagination.perPage);

  output(promise, res, next);
};

exports.getList = function (req, res, next) {
  let pagination = new Pagination(req.query);

  let promise = proxyArticle.find(pagination.page, pagination.perPage);

  output(promise, res, next);
};

