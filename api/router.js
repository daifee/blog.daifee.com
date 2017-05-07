const {Router} = require('express');
const controllersOther = require('./controllers/other');
const controllersUser = require('./controllers/user');
const controllersArticle = require('./controllers/article');
const controllersComment = require('./controllers/comment');
const authorize = require('./middlewares/authorize');
const crossDomain = require('./middlewares/crossDomain');

const respondContentType = require('./middlewares/respondContentType');
const bodyParser = require('body-parser');
require('./models');

const router = new Router();

/**
 * 全局中间件
 */

// 解析请求体JSON
router.use(bodyParser.json());
// 设置响应内容类型
router.use(respondContentType);
// 允许跨域请求
router.use(crossDomain);


/**
 * users
 */
// get 用户授权
router.post('/', controllersUser.authorize);
// get 所有用户，分页
router.get('/users', controllersUser.getList);
// get 一个用户
router.get('/users/:name', controllersUser.getOneByName);
// post 创建用户
router.post('/users', controllersUser.create);
// patch 更新用户
router.patch('/users/:userId', authorize('self'), controllersUser.update);
// delete 删除用户
router.delete('/users/:userId', authorize('administrator'), controllersUser.delete);


/**
 * articles
 */
router.get('/users/:userId/articles', controllersArticle.getListByUserId);
// 创建文章
router.post('/users/:userId/articles', authorize('self'), controllersArticle.create);
// // 获取一篇文章
// router.get('/users/:userId/articles/:id', controllersArticle.getOneById);
// 更新文章
router.patch('/users/:userId/articles/:id', authorize('self'), controllersArticle.update);
// 删除文章
router.delete('/users/:userId/articles/:id', authorize('self'), controllersArticle.delete);
// 所有文章，分页
router.get('/articles', controllersArticle.getList);
// 获取一篇文章
router.get('/articles/:id', controllersArticle.getOneById);


/**
 * comments
 */
// 创建评论，分页
router.post('/users/:userId/comments', authorize('self'), controllersComment.create);
// 某用户的所有评论，分页
router.get('/users/:userId/comments', authorize('self'), controllersComment.getListByUserId);
// 删除评论
router.delete('/users/:userId/comments/:id', authorize('self'), controllersComment.delete);
// 获取某篇文章的所有评论
router.get('/articles/:articleId/comments', controllersComment.getListByArticleId);
// 获取所有评论，分页
router.get('/comments', authorize('administrator'), controllersComment.getList);
// 获取一条评论
router.get('/comments/:id', controllersComment.getOneById);



/**
 * search
 * TODO
 */
// 搜索用户
// 搜索文章
// 搜索评论




/**
 * gitlab-hooks
 */
router.post('/gitlab-hooks', controllersOther.respondGitlabEvents);


/**
 * 404
 */
router.use(controllersOther.notFound);

/**
 * error
 */
router.use(controllersOther.error);


module.exports = router;
