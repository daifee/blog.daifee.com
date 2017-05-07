const cookies = require('../utils/cookies');
const parseNumber = require('../utils/parseNumber');
const config = require('../config');
const proxyArticle = require('../proxy/article');
const proxyUser = require('../proxy/user');

// 404页
// 检测accept，返回json或html
exports.notFound = function (req, res) {
  res.status(404);
  res.render('404');
};


// 错误页
// 检测accept，返回json或html
exports.error = function (err, req, res, next) {
  let referer = encodeURIComponent(req.headers.referer);
  let data = {
    status: (err.status || 500),
    message: (err.message || '服务器错误'),
    stack: err.stack
  };

  if (config.production) {
    data.stack = '';
  }

  res.status(data.status);

  if (data.status === 401) {
    res.redirect(`/login?referer=${referer}`);
    return;
  }

  res.render('error', data);
};


// 主页
exports.homepage = function (req, res) {
  let user = cookies.user.get(req);

  if (user) {
    res.redirect(`/users/${user.name}`);
  } else {
    res.redirect('/explore');
  }
};


// 发现页
exports.renderExplore = function (req, res, next) {
  let page = parseNumber(req.query.page, 1);
  let perPage = parseNumber(req.query.per_page, 20);

  proxyArticle.find(page, perPage)
  .then(function (articles) {
    let nextPage = articles.length >= perPage ? page + 1 : 0;
    let prevPage = page > 1 ? page - 1 : 0;
    nextPage = explorePagination(nextPage, perPage);
    prevPage = explorePagination(prevPage, perPage);

    res.render('explore', {
      title: '发现',
      articles: articles,
      link: {
        next: nextPage,
        prev: prevPage
      }
    });
  })
  .catch(function (err) {
    next(err);
  });
};

// explore分页
function explorePagination(page, perPage) {
  return page ? `/explore?page=${page}&per_page=${perPage}` : '';
}


// 登录页
exports.renderLogin = function (req, res) {
  let user = cookies.user.get(req);
  let referer = req.query.referer;

  if (user) {
    redirectAuthorized(res, user, referer);
  } else {
    res.render('login', {
      title: '登录',
      errorMessage: req.flash('errorMessage')[0],
      referer: referer
    });
  }
};


exports.login = function (req, res, next) {
  let user = req.body;
  let referer = req.body.referer;

  proxyUser.verify(user)
  .then(function (user) {
    cookies.user.set(res, user);

    redirectAuthorized(res, user, referer);
  })
  .catch(function (err) {
    req.flash('errorMessage', err.message);
    res.redirect(`/login?referer=${referer}`);
  });
};



exports.renderRegister = function (req, res) {
  let user = cookies.user.get(req);
  let referer = req.query.referer;

  if (user) {
    redirectAuthorized(res, user, referer);
  } else {
    res.render('register', {
      title: '注册',
      errorMessage: req.flash('errorMessage')[0],
      referer: referer
    });
  }
};

exports.register = function (req, res, next) {
  let user = req.body;
  let referer = req.body.referer;

  proxyUser.create(user)
  .then(function (user) {
    cookies.user.set(res, user);

    redirectAuthorized(res, user, referer);
  })
  .catch(function (err) {
    let redirection = `/register?referer=${referer}`;
    req.flash('errorMessage', err.message);
    res.redirect(redirection);
  });
};


// 登出
exports.logout = function (req, res, next) {
  cookies.user.remove(res);

  res.redirect('/login');
};


function redirectAuthorized(res, user, referer) {
  let redirection = referer ? decodeURIComponent(referer) : `/users/${user.name}`;

  res.redirect(redirection);
}
