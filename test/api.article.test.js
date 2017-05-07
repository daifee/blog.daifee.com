const request = require('supertest');
const app = require('../index');
const {expect} = require('chai');
const {
  createUser,
  createArticles,
  createArticle,
  generateArticleData
} = require('./helper');

const agent = request(app);


describe('restful API article部分', function () {
  let _user;
  before(function (done) {
    createUser().then(function (user) {
      _user = user;
      done();
    }).catch(done);
  });

  describe('获取用户的文章，分页 get /users/:userId/articles', function () {
    before(function (done) {
      createArticles(10, _user).then(function () {
        done();
      }).catch(done);
    });

    it('获取第1页，5篇文章', function (done) {
      agent
        .get(`/api/users/${_user.id}/articles`)
        .query({page: 1, per_page: 5})
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(5);
            done();
          }
        });
    });

    it('获取第2页，5篇文章', function (done) {
      agent
        .get(`/api/users/${_user.id}/articles`)
        .query({page: 2, per_page: 5})
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(5);
            done();
          }
        });
    });
  });

  describe('创建一篇文章 post /users/:userId/articles', function () {
    let _articleData;
    before(function (done) {
      generateArticleData(_user, {
        commentNum: 12,
        views: 99
      }).then(function (article) {
        _articleData = article;
        done();
      }).catch(done);
    });

    it('成功创建文章', function (done) {
      agent
        .post(`/api/users/${_user.id}/articles`)
        .set('Content-type', 'application/json')
        .set('X-Token', _user.token)
        .send(JSON.stringify(_articleData))
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            let body = res.body;
            expect(body).to.be.ok;
            expect(body.title).to.equal(_articleData.title);
            expect(body.views).to.equal(0);
            expect(body.commentNum).to.equal(0);
            done();
          }
        });
    });

    it('未授权', function (done) {
      agent
        .post(`/api/users/${_user.id}/articles`)
        .set('Content-type', 'application/json')
        .send(JSON.stringify(_articleData))
        .expect(401)
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

    it('缺少title', function (done) {
      let _articleData2 = Object.assign({}, _articleData);
      delete _articleData2.title;

      agent
        .post(`/api/users/${_user.id}/articles`)
        .set('Content-type', 'application/json')
        .set('X-Token', _user.token)
        .send(JSON.stringify(_articleData2))
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

    it('缺少content', function (done) {
      let _articleData2 = Object.assign({}, _articleData);
      delete _articleData2.content;

      agent
        .post(`/api/users/${_user.id}/articles`)
        .set('Content-type', 'application/json')
        .set('X-Token', _user.token)
        .send(JSON.stringify(_articleData2))
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

  describe('获取一篇文章 get /articles/:id', function () {
    let _article;
    before(function (done) {
      createArticle(_user).then(function (article) {
        _article = article;
        done();
      }).catch(done);
    });

    it('获取一篇文章', function (done) {
      agent
        .get(`/api/articles/${_article.id}`)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            let body = res.body;
            expect(body.id).to.equal(_article.id);
            expect(body.content).to.equal(_article.content);
            done();
          }
        });
    });
  });

  describe('更新一篇文章 patch /users/:userId/articles/:id', function () {
    let _article;
    before(function (done) {
      createArticle(_user).then(function (article) {
        _article = article;
        done();
      }).catch(done);
    });

    it('更新一篇文章', function (done) {
      agent
        .patch(`/api/users/${_user.id}/articles/${_article.id}`)
        .set('Content-Type', 'application/json')
        .set('X-Token', _user.token)
        .send(JSON.stringify({
          views: 99999,
          commentNum: 8888,
          content: 'test'
        }))
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            let body = res.body;
            expect(body.id).to.equal(_article.id);
            expect(body.content).to.equal('test');
            expect(body.commentNum).to.equal(0);
            expect(body.views).to.equal(0);
            done();
          }
        });
    });
  });

  describe('删除一篇文章 delete /users/:userId/articles/:id', function () {
    let _article;
    before(function (done) {
      createArticle(_user).then(function (article) {
        _article = article;
        done();
      }).catch(done);
    });

    it('删除文章', function (done) {
      agent
        .delete(`/api/users/${_user.id}/articles/${_article.id}`)
        .set('X-Token', _user.token)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            // let body = res.body;
            // expect(body).to.be.ok;
            // expect(body.id).to.equal(_article.id);
            done();
          }
        });
    });

    it('没权限', function (done) {
      agent
        .delete(`/api/users/${_user.id}/articles/${_article.id}`)
        .expect(401)
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

  describe('获取所有文章 get /articles', function () {
    before(function (done) {
      createArticles(10, _user).then(function () {
        done();
      }).catch(done);
    });

    it('获取第1页，5篇文章', function (done) {
      agent
        .get(`/api/articles`)
        .query({page: 1, per_page: 5})
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(5);
            done();
          }
        });
    });

    it('获取第2页，5篇文章', function (done) {
      agent
        .get(`/api/articles`)
        .query({page: 2, per_page: 5})
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(5);
            done();
          }
        });
    });
  });
});
