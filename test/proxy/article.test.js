const {expect} = require('chai');
const proxyArticle = require('../../api/proxy/article');
const proxyUser = require('../../api/proxy/user');
const {
  createUser,
  generateArticleData,
  createArticle,
  createArticles
} = require('../helper');


describe('proxy/article.js', function () {
  describe('createOne(article)', function () {
    let _user;
    let _articleData;
    before(function (done) {
      createUser().then(function (user) {
        _user = user;

        return generateArticleData(user).then(function (articleData) {
          _articleData = articleData;
          done();
        });
      }).catch(done);
    });

    it('创建一篇文章', function (done) {
      proxyArticle.createOne(_articleData).then(function (article) {
        expect(article).to.be.ok;
        expect(article.userId + '').to.equal(_articleData.userId + '');
        expect(article.title).to.equal(_articleData.title);
        expect(article.content).to.equal(_articleData.content);

        return proxyUser.findOneById(_user.id).then(function (user) {
          expect(user).to.be.ok;
          expect(user.articleNum).to.equal(1);
          done();
        });
      }).catch(done);
    });
  });

  it('更新一篇文章 .updateOneById(id, article)', function (done) {
    createArticle().then(function (article) {
      let newArticle = {
        title: (article.title + '1'),
        content: (article.content + '1')
      };
      return proxyArticle.updateOneById(article.id, newArticle).then(function (article) {
        expect(article).to.be.ok;
        expect(article.title).to.equal(newArticle.title);
        expect(article.content).to.equal(newArticle.content);
        done();
      });
    }).catch(done);
  });

  describe('deleteOneById(id)', function () {
    let _user;
    let _article;
    before(function (done) {
      createUser().then(function (user) {
        _user = user;

        return createArticle(user).then(function (article) {
          _article = article;
          done();
        });
      }).catch(done);
    });

    it('删除一篇文章', function (done) {
      proxyArticle.deleteOneById(_article.id).then(function (article) {
        expect(article).to.be.ok;
        expect(article.status).to.equal('deleted');

        return proxyUser.findOneById(_user.id).then(function (user) {
          expect(user).to.be.ok;
          expect(user.articleNum).to.equal(0);
          done();
        });
      }).catch(done);
    });
  });


  describe('deleteByUserId(user.id)', function () {
    let _user;

    before(function (done) {
      // 创建独立用户，确保这个用户只创建了5条评论
      createUser().then(function (user) {
        _user = user;
        // 为其评论创建一篇文章作为载体
        return createArticles(5, user).then(function (articles) {
          done();
        });
      }).catch(done);
    });

    it('删除用户的所有评论', function (done) {
      proxyArticle.deleteByUserId(_user.id).then(function (res) {
        expect(res).to.be.ok;
        expect(res.ok).to.be.ok;
        expect(res.n).to.equal(5);
        done();
      }).catch(done);
    });
  });

  describe('findOneById(id)', function () {
    it('查找一篇文章 .findOneById(id)', function (done) {
      createArticle().then(function (article) {
        return proxyArticle.findOneById(article.id).then(function (article) {
          expect(article).to.be.ok;
          expect(article).to.contain.keys([
            'title',
            'userId',
            'user',
            'content',
            'createdAt',
            'status',
            'html',
            'introduction'
          ]);
          expect(article.html).to.equal('');
          done();
        });
      }).catch(done);
    });

    it('文章已经渲染了HTML', function (done) {
      createArticle().then(function (article) {
        return proxyArticle.findOneById(article.id, {html: true}).then(function (article) {
          expect(article).to.be.ok;
          expect(article.html).to.not.equal('');
          done();
        });
      }).catch(done);
    });

    it('查找不到已被删除的文章', function (done) {
      createArticle().then(function (article) {
        return proxyArticle.deleteOneById(article.id).then(function (article) {
          return proxyArticle.findOneById(article.id).then(function (article) {
            expect(article).to.not.be.ok;
            done();
          });
        });
      }).catch(done);
    });
  });

  it('查找多篇文章，分页 .find(page, perPage)', function (done) {
    createArticles(5).then(function (articles) {
      return proxyArticle.find(1, 5).then(function (articles) {
        expect(articles.length).to.equal(5);
        done();
      }).catch(done);
    });
  });

  it('查找某用户的多篇文章 .findByUserId(userId, page, perPage)', function (done) {
    createArticles(5).then(function (articles) {
      let userId = articles[0].userId;
      return proxyArticle.findByUserId(userId, 1, 5).then(function (articles) {
        expect(articles.length).to.equal(5);
        articles.forEach(function (article) {
          expect(article.userId + '').to.equal(userId + '');
        });
        done();
      }).catch(done);
    });
  });

  it('增加评论数量 .increaseCommentNum(id)', function (done) {
    createArticle().then(function (article) {
      return proxyArticle.increaseCommentNum(article.id).then(function (article) {
        expect(article.commentNum).to.equal(1);
        done();
      });
    }).catch(done);
  });

  it('减少评论数量 .reduceCommentNum(id)', function (done) {
    createArticle().then(function (article) {
      return proxyArticle.reduceCommentNum(article.id).then(function (article) {
        expect(article.commentNum).to.equal(-1);
        done();
      });
    }).catch(done);
  });

  it('增加阅读数量 .increaseViews', function (done) {
    createArticle().then(function (article) {
      return proxyArticle.increaseViews(article.id).then(function (article) {
        expect(article.views).to.equal(1);
        done();
      });
    }).catch(done);
  });
});
