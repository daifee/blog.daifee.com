const proxyComment = require('../proxy/comment');
const cookies = require('../utils/cookies');


// 创建评论
exports.create = function (req, res) {
  let user = cookies.user.get(req);
  let comment = req.body;

  if (!user) {
    res.redirect(`/login?referer=${req.headers.referer}`);
  }

  comment.userId = user.id;

  proxyComment.create(comment, user.token)
  .then(function (comment) {
    req.flash('successMessage', '成功发表评论');
    let url = `/articles/${comment.articleId}?#comments`;
    res.redirect(url);
  })
  .catch(function (err) {
    req.flash('errorMessage', err.message);
    res.redirect(req.headers.referer + '#comments');
  });
};

exports.delete = function (req, res) {
  let user = cookies.user.get(req);
  let id = req.params.id;

  if (!user) {
    res.redirect('/login');
  }

  proxyComment.delete(id, user.id, user.token)
  .then(function () {
    req.flash('successMessage', '成功删除');
    res.redirect(`${req.headers.referer}#comments`);
  })
  .catch(function (err) {
    // 失败，重定向到主页
    req.flash('errorMessage', err.message);
    res.redirect(req.headers.referer);
  });
};
