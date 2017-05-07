const request = require('supertest');
const app = require('../index');
const {expect} = require('chai');
const {
  generateUserData,
  createUser,
  createArticle,
  createComment,
  createComments
} = require('./helper');

const agent = request(app);



describe('rest api comment部分', function () {
  let _user;
  let _user2;
  let _administrator;
  let _article;
  let _comments;
  before(function (done) {
    createUser().then(function (user) {
      _user = user;

      return createArticle(_user).then(function (article) {
        _article = article;

        return createComments(10).then(function (comments) {
          _comments = comments;
          done();
        });
      });
    }).catch(done);
  });

  before(function (done) {
    createUser().then(function (user) {
      _user2 = user;
      done();
    }).catch(done);
  });

  before(function (done) {
    let userData = generateUserData({role: 'administrator'});
    createUser(userData).then(function (user) {
      _administrator = user;
      done();
    }).catch(done);
  });

  describe('创建评论 /users/:userId/comments', function () {
    it('成功创建评论', function (done) {
      agent
        .post(`/api/users/${_article.userId}/comments`)
        .set('Content-Type', 'application/json')
        .set('X-Token', _user.token)
        .send(JSON.stringify({
          content: 'test',
          articleId: _article.id
        }))
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            let body = res.body;
            expect(body).to.be.ok;
            expect(body.userId).to.equal(_user.id);
            expect(body.content).to.equal('test');
            done();
          }
        });
    });

    it('没有认证', function (done) {
      agent
        .post(`/api/users/${_article.userId}/comments`)
        .set('Content-Type', 'application/json')
        .set('X-Token', 'xxx')
        .send(JSON.stringify({
          content: 'test',
          articleId: _article.id
        }))
        .expect(403)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            let body = res.body;
            expect(body).to.be.ok;
            expect(body.message).to.be.ok;
            done();
          }
        });
    });

    it('缺少内容', function (done) {
      agent
        .post(`/api/users/${_article.userId}/comments`)
        .set('Content-Type', 'application/json')
        .set('X-Token', _user.token)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            let body = res.body;
            expect(body).to.be.ok;
            expect(body.message).to.be.ok;
            done();
          }
        });
    });
  });

  describe('删除评论 /users/:userId/comments/:id', function () {

    it('删除自己的评论', function (done) {
      agent
        .delete(`/api/users/${_article.userId}/comments/${_comments[0].id}`)
        .set('X-Token', _user.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            let body = res.body;
            expect(body).to.be.ok;
            done();
          }
        });
    });

    it('没权限删除他人评论', function (done) {
      agent
        .delete(`/api/users/${_article.userId}/comments/${_comments[1].id}`)
        .set('X-Token', _user2.token)
        .expect(403)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            let body = res.body;
            expect(body).to.be.ok;
            expect(body.message).to.be.ok;
            done();
          }
        });
    });

    it('管理员删除他人评论', function (done) {
      agent
        .delete(`/api/users/${_article.userId}/comments/${_comments[2].id}`)
        .set('X-Token', _administrator.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            let body = res.body;
            expect(body).to.be.ok;
            done();
          }
        });
    });
  });


  describe('某用户所有评论 /users/:userId/comments', function () {
    it('获取第一页', function (done) {
      agent
        .get(`/api/users/${_article.userId}/comments`)
        .set('X-Token', _user.token)
        .query({page: 1, per_page: 5})
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            let body = res.body;
            expect(body).to.be.an('array');
            expect(body.length).to.above(0);
            done();
          }
        });
    });

    it('已经没有了', function (done) {
      agent
        .get(`/api/users/${_article.userId}/comments`)
        .set('X-Token', _user.token)
        .query({page: 999, per_page: 9999})
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            let body = res.body;
            expect(body).to.be.an('array');
            expect(body.length).to.equal(0);
            done();
          }
        });
    });

    it('其他用户不能获取', function (done) {
      agent
        .get(`/api/users/${_article.userId}/comments`)
        .set('X-Token', _user2.token)
        .expect(403)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            let body = res.body;
            expect(body).to.be.ok;
            expect(body.message).to.be.ok;
            done();
          }
        });
    });
  });

  describe('某篇文章所有评论 /articles/:articleId/comments', function () {
    it('获取第一页', function (done) {
      agent
        .get(`/api/articles/${_article.id}/comments`)
        .query({page: 1, per_page: 5})
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            let body = res.body;
            expect(body).to.be.an('array');
            expect(body.length).to.above(0);
            done();
          }
        });
    });

    it('已经没有了', function (done) {
      agent
        .get(`/api/articles/${_article.id}/comments`)
        .query({page: 9999, per_page: 9999})
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            let body = res.body;
            expect(body).to.be.an('array');
            expect(body.length).to.equal(0);
            done();
          }
        });
    });
  });

  describe('所有评论 /comments', function () {
    it('获取第一页', function (done) {
      agent
        .get(`/api/comments`)
        .query({page: 1, per_page: 5})
        .set('X-Token', _administrator.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            let body = res.body;
            expect(body).to.be.an('array');
            expect(body.length).to.above(0);
            done();
          }
        });
    });

    it('非管理员，拿不到', function (done) {
      agent
        .get(`/api/comments`)
        .query({page: 1, per_page: 5})
        .set('X-Token', _user.token)
        .expect(403)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            let body = res.body;
            expect(body).to.be.ok;
            expect(body.message).to.be.ok;
            done();
          }
        });
    });
  });

  describe('一条评论 /comments/:id', function () {
    let _comment;
    before(function (done) {
      createComment(_article).then(function (comment) {
        _comment = comment;
        done();
      }).catch(done);
    });

    it('成功获取一条评论', function (done) {
      agent
        .get(`/api/comments/${_comment.id}`)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            let body = res.body;
            expect(body).to.be.ok;
            done();
          }
        });
    });
  });
});
