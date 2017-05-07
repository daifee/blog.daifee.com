const proxyUser = require('../proxy/user');
const proxyArticle = require('../proxy/article');
const cookies = require('../utils/cookies');
const parseNumber = require('../utils/parseNumber');


  // 渲染用户主页
exports.renderHomepage = function (req, res, next) {
  let name = req.params.name;
  let page = parseNumber(req.query.page, 1);
  let perPage = parseNumber(req.query.per_page, 20);

  let user = cookies.user.get(req);
  let promiseUser;

  if (user && user.name === name) {
    promiseUser = Promise.resolve(user);
  } else {
    promiseUser = proxyUser.findOneByName(name);
  }

  promiseUser
  .then((user) => {
    if (!user) {
      next();
      return;
    }

    return proxyArticle.findByUserId(user.id, page, perPage)
    .then(function (articles) {
      let nextPage = articles.length >= perPage ? page + 1 : 0;
      let prevPage = page > 1 ? page - 1 : 0;
      nextPage = userPagination(user.name, nextPage, perPage);
      prevPage = userPagination(user.name, prevPage, perPage);

      res.render('user/homepage', {
        title: user.name,
        user: user,
        articles: articles,
        errorMessage: req.flash('errorMessage')[0],
        successMessage: req.flash('successMessage')[0],
        link: {
          next: nextPage,
          prev: prevPage
        }
      });
    });
  })
  .catch((err) => {
    next(err);
  });
};


// user 分页
function userPagination(userName, page, perPage) {
  return page ? `/users/${userName}?page=${page}&per_page=${perPage}` : '';
}
