const cookies = require('../utils/cookies');
const parseNumber = require('../utils/parseNumber');
const proxyArticle = require('../proxy/article');
const proxyComment = require('../proxy/comment');

// 写文章页面
exports.renderCreate = function (req, res, next) {
  res.render('article/edit', {
    title: '写文章',
    article: {},
    errorMessage: req.flash('errorMessage')[0],
    styles: ['/static/js/editor/css/editormd.min.css'],
    scripts: [
      '/static/js/editor/editormd.js',
      '/static/js/article-edit.js'
    ]
  });
};

// 创建新文章
exports.create = function (req, res, next) {
  let user = cookies.user.get(req);
  let article = req.body;

  article.userId = user.id;

  proxyArticle.create(user.token, article)
  .then(function (article) {
    // 更新cookie
    user.articleNum++;
    cookies.user.set(res, user);

    res.redirect(`/articles/${article.id}`);
  })
  .catch(function (err) {
    req.flash('errorMessage', err.message);
    res.redirect(req.headers.referer);
  });
};

// 更新文章
exports.update = function (req, res, next) {
  let user = cookies.user.get(req);
  let id = req.params.id;
  let article = req.body;
  article.id = id;
  article.userId = user.id;

  proxyArticle.updateOneById(article, user.token)
  .then(function (article) {
    res.redirect(`/articles/${id}`);
  })
  .catch(function (err) {
    req.flash('errorMessage', err.message);
    res.redirect(req.headers.referer);
  });
};

// 文章详情页
exports.renderDetail = function (req, res, next) {
  let id = req.params.id;
  let page = parseNumber(req.query.page, 1);
  let perPage = parseNumber(req.query.per_page, 10);

  proxyArticle.findOneById(id, '1')
  .then(function (article) {
    if (!article) {
      next();
      return;
    }

    let user = article.user;

    // 评论数据
    return proxyComment.findByArticleId(article.id, page, perPage)
    .then(function (comments) {

      let nextPage = comments.length >= perPage ? page + 1 : 0;
      let prevPage = page > 1 ? page - 1 : 0;
      nextPage = detailPagination(id, nextPage, perPage);
      prevPage = detailPagination(id, prevPage, perPage);

      res.render('article/detail', {
        title: article.title,
        article: article,
        user: user,
        errorMessage: req.flash('errorMessage')[0],
        successMessage: req.flash('successMessage')[0],
        comments: comments,
        link: {
          next: nextPage,
          prev: prevPage
        },
        styles: ['/static/js/editor/css/editormd.preview.min.css']
      });
    });
  })
  .catch(function (err) {
    next(err);
  });
};

// 详情的评论分页
function detailPagination(id, page, perPage) {
  return page ? `/articles/${id}?page=${page}&per_page=${perPage}` : '';
}


// 编辑一篇文章
exports.renderEdit = function (req, res, next) {
  let id = req.params.id;

  proxyArticle.findOneById(id)
  .then((article) => {
    res.render('article/edit', {
      title: '编辑文章',
      errorMessage: req.flash('errorMessage')[0],
      article: article,
      styles: ['/static/js/editor/css/editormd.min.css'],
      scripts: [
        '/static/js/editor/editormd.js',
        '/static/js/article-edit.js'
      ]
    });
  });
};


// 删除
exports.delete = function (req, res, next) {
  let id = req.params.id;
  let user = cookies.user.get(req);

  proxyArticle.deleteById(id, user.id, user.token)
  .then(function (article) {
    // 更新cookie
    user.articleNum--;
    cookies.user.set(res, user);

    // 成功，重定向到主页
    req.flash('successMessage', '成功删除');
    res.redirect('/');
  })
  .catch(function (err) {
    // 失败，重定向到主页
    req.flash('errorMessage', err.message);
    res.redirect(req.headers.referer);
  });
};
