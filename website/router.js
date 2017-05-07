const {Router} = require('express');


const controllersSite = require('./controllers/site');
const controllersUser = require('./controllers/user');
const controllersArticle = require('./controllers/article');
const controllersComment = require('./controllers/comment');

const router = new Router();



/**
 * site
 */

// 首页
router.get('/', controllersSite.homepage);
// 探索发现
router.get('/explore', controllersSite.renderExplore);
// 注册页、处理注册请求
router.route('/register')
  .get(controllersSite.renderRegister)
  .post(controllersSite.register);
// 登录页、处理登录请求
router.route('/login')
  .get(controllersSite.renderLogin)
  .post(controllersSite.login);
// 登出
router.get('/logout', controllersSite.logout);

// /**
//  * user
//  */
// // 用户主页
router.get('/users/:name', controllersUser.renderHomepage);


/**
 * article
 */
// 创建新文章页
router.get('/articles/new', controllersArticle.renderCreate);
// 修改页
router.get('/articles/:id/edit', controllersArticle.renderEdit);
// 创建
router.post('/articles', controllersArticle.create);
// 详情页、修改、删除
router.route('/articles/:id')
  .get(controllersArticle.renderDetail)
  .patch(controllersArticle.update)
  .delete(controllersArticle.delete);


/**
 * 评论
 */
// 提交评论
router.post('/comments', controllersComment.create);
// 删除评论
router.delete('/comments/:id', controllersComment.delete);


// 404
router.use(controllersSite.notFound);
// error
router.use(controllersSite.error);


module.exports = router;
