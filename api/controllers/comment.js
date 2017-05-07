const proxyComment = require('../proxy/comment');
const Pagination = require('../models/pagination');
const Comment = require('../models/comment');
const {output} = require('./utils');
const copyObject = require('../utils/copyObject');
const CustomError = require('../CustomError');

exports.create = function (req, res, next) {
  let commentData = copyObject(req.body, {
    userId: req.params.userId
  }, ['_id', 'status']);

  let comment = new Comment(commentData);
  let err = comment.validateSync();

  let promise;
  if (err) {
    err = new CustomError(1013, err.toString());
    promise = Promise.reject(err);
  } else {
    promise = proxyComment.createOne(commentData);
  }

  output(promise, res, next);
};




exports.getOneById = function (req, res, next) {
  let id = req.params.id;

  let promise = proxyComment.findOneById(id);
  output(promise, res, next);
};



// 获取某用户的所有评论
exports.getListByUserId = function (req, res, next) {
  let pagination = new Pagination(req.query);
  let {page, perPage} = pagination;
  let userId = req.params.userId;

  let promise = proxyComment.findByUserId(userId, page, perPage);
  output(promise, res, next);
};

// 获取某篇文章的所有评论
exports.getListByArticleId = function (req, res, next) {
  let pagination = new Pagination(req.query);
  let {page, perPage} = pagination;
  let articleId = req.params.articleId;

  let promise = proxyComment.findByArticleId(articleId, page, perPage);
  output(promise, res, next);
};

// 获取所有评论
exports.getList = function (req, res, next) {
  let pagination = new Pagination(req.query);
  let {page, perPage} = pagination;

  let promise = proxyComment.find(page, perPage);
  output(promise, res, next);
};


exports.delete = function (req, res, next) {
  let id = req.params.id;

  let promise = proxyComment.deleteOneById(id);
  output(promise, res, next);
};
