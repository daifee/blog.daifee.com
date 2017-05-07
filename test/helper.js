const {connection} = require('../api/models');
const proxyUser = require('../api/proxy/user');
const proxyArticle = require('../api/proxy/article');
const proxyComment = require('../api/proxy/comment');

// 等待连接数据库
before(function (done) {
  connection.then(done).catch(done);
});


function shouldDeep(value1, value2) {
  let result = typeof value1 === 'object' &&
    typeof value2 === 'object' &&
    Object.keys(value1).length === Object.keys(value2).length;

  return result;
}

function equal(value1, value2) {
  return value1 === value2;
}

/**
 * 深层等于，并将Function类型的值进行toString()之后再比较
 * 所以函数体要完全相同，一个空格的差别都不能存在
 */
exports.objectDeepEqual = function (value1, value2, callback = equal) {
  let result = true;
  if (shouldDeep(value1, value2)) {
    Object.keys(value1).forEach(function (key) {
      if (result === false) return;
      if (shouldDeep(value1, value2)) {
        result = exports.objectDeepEqual(value1[key], value2[key], callback);
      } else {
        result = callback(value1[key], value2[key]);
      }
    });
  } else {
    result = callback(value1, value2);
  }

  return result;
};


/**
 * 生成唯一ID
 */
let id = 0;
let timestamp = Date.now();
exports.generateUid = function () {
  id++;

  return timestamp + '' + id;
};

/**
 * 生成用户数据
 */
exports.generateUserData = function (userData = {}) {
  let name = 'test' + exports.generateUid();
  let email = `${name}@daifee.com`;
  let password = 'zxcvbnm';

  let result = Object.assign({}, userData, {
    name,
    email,
    password
  });

  return result;
};


/**
 * 创建用户，如果没有参数userData，就随机创建用户
 */
exports.createUser = function (userData) {
  if (!userData) {
    userData = exports.generateUserData(userData);
  }

  return proxyUser.createOne(userData);
};


/**
 * 同时创建多个用户
 */
exports.createUsers = function (num) {
  let promises = [];
  for (let i = 0; i < num; i++) {
    promises.push(exports.createUser());
  }

  return Promise.all(promises);
};


/**
 * 生成文章数据
 */
// 关联测试文章的用户
let articleUser = exports.createUser();
exports.generateArticleData = function (user, articleData = {}) {
  let promise;
  if (user) {
    promise = Promise.resolve(user);
  } else {
    promise = articleUser;
  }

  return promise.then(function (user) {
    let id = exports.generateUid();

    return Object.assign({
      userId: user.id,
      title: `测试文章标题${id}`,
      content: `测试文章内容呢容爱放假爱偶放大镜${id}`
    }, articleData);
  });
};

/**
 * 随机创建一篇文章
 */
exports.createArticle = function (user) {
  return exports.generateArticleData(user).then(function (articleData) {
    return proxyArticle.createOne(articleData);
  });
};

/**
 * 随机创建多篇文章
 */
exports.createArticles = function (num, user) {
  let promises = [];
  for (let i = 0; i < num; i++) {
    promises.push(exports.createArticle(user));
  }

  return Promise.all(promises);
};


/**
 * 生成评论内容
 */
// 为评论创建的文章
let commentArticle = exports.createArticle();
exports.generateCommentData = function (article) {
  let promise;
  if (article) {
    promise = Promise.resolve(article);
  } else {
    promise = commentArticle;
  }

  return promise.then(function (article) {
    let id = exports.generateUid();

    return {
      userId: article.userId,
      articleId: article.id,
      content: `测试内容${id}`
    };
  });
};

/**
 * 随机创建测试评论
 */
exports.createComment = function (article) {
  return exports.generateCommentData(article).then(function (comment) {
    return proxyComment.createOne(comment);
  });
};


/**
 * 随机创建多篇测试评论
 */
exports.createComments = function (num, article) {
  let promises = [];
  for (let i = 0; i < num; i++) {
    promises.push(exports.createComment(article));
  }

  return Promise.all(promises);
};
