const {expect} = require('chai');
const proxyComment = require('../../api/proxy/comment');
const proxyArticle = require('../../api/proxy/article');
const {
  generateCommentData,
  createComment,
  createComments,
  createUser,
  createArticle
} = require('../helper');


describe('proxy/comment.js', function () {
  describe('创建评论', function () {
    let _article;
    before(function (done) {
      createArticle().then(function (article) {
        _article = article;
        done();
      }).catch(done);
    });

    it('createOne(comment)', function (done) {
      generateCommentData(_article).then(function (commentData) {
        return proxyComment.createOne(commentData).then(function (comment) {
          expect(comment).to.be.ok;
          expect(comment.userId + '').to.equal(commentData.userId + '');
          expect(comment.articleId + '').to.equal(commentData.articleId);
          expect(comment.content).to.equal(commentData.content);

          return proxyArticle.findOneById(_article.id).then(function (article) {
            expect(article.commentNum).to.equal(1);
            done();
          });
        });
      }).catch(done);
    });
  });

  describe('updateOneById(comment)', function () {
    it('更新一篇评论', function (done) {
      createComment().then(function (comment) {
        let newComment = {
          content: (comment.content + '1')
        };

        return proxyComment.updateOneById(comment.id, newComment).then(function (comment) {
          expect(comment).to.be.ok;
          expect(comment.content).to.equal(newComment.content);
          done();
        });
      }).catch(done);
    });
  });

  describe('deleteOneById(id)', function () {
    let _article;
    before(function (done) {
      createArticle().then(function (article) {
        _article = article;
        done();
      }).catch(done);
    });

    it('删除一篇评论', function (done) {
      createComment(_article).then(function (comment) {
        return proxyComment.deleteOneById(comment.id).then(function (comment) {
          expect(comment).to.be.ok;

          return proxyArticle.findOneById(_article.id).then(function (article) {
            expect(article.commentNum).to.equal(0);
            done();
          });
        });
      }).catch(done);
    });
  });

  describe('deleteByUserId(user.id)', function () {
    let _user;
    let _article;

    before(function (done) {
      // 创建独立用户，确保这个用户只创建了5条评论
      createUser().then(function (user) {
        _user = user;
        // 为其评论创建一篇文章作为载体
        return createArticle(user).then(function (article) {
          _article = article;
          done();
        });
      }).catch(done);
    });

    it('删除用户的所有评论', function (done) {
      // 创建5条评论
      createComments(5, _article).then(function (comments) {
        // 删除该用户的评论
        return proxyComment.deleteByUserId(_user.id).then(function (res) {
          expect(res).to.be.ok;
          expect(res.ok).to.be.ok;
          expect(res.n).to.equal(5);
          done();
        });
      }).catch(done);
    });
  });

  describe('findOneById(id)', function () {
    it('通过ID查找一篇评论', function (done) {
      createComment().then(function (comment) {
        return proxyComment.findOneById(comment.id).then(function (comment) {
          expect(comment).to.be.ok;
          expect(comment).to.contain.keys([
            'userId',
            'articleId',
            'content',
            'status',
            'createdAt',
            'user'
          ]);
          done();
        });
      }).catch(done);
    });

    it('查找一篇已被删除的评论', function (done) {
      createComment().then(function (comment) {
        return proxyComment.deleteOneById(comment.id).then(function (comment) {
          return proxyComment.findOneById(comment.id).then(function (comment) {
            expect(comment.status).to.equal('deleted');
            done();
          });
        });
      }).catch(done);
    });
  });


  it('查找评论，分页', function (done) {
    createComments(5).then(function (comments) {
      return proxyComment.find(1, 5).then(function (comments) {
        expect(comments.length).to.equal(5);
        done();
      }).catch(done);
    });
  });

  it('查找用户的评论，分页', function (done) {
    createComments(5).then(function (comments) {
      let userId = comments[0].userId;
      return proxyComment.findByUserId(userId, 1, 5).then(function (comments) {
        expect(comments.length).to.equal(5);
        comments.forEach(function (comment) {
          expect(comment.userId + '').to.equal(userId + '');
        });
        done();
      }).catch(done);
    });
  });

  it('查找文章的评论，分页', function (done) {
    createComments(5).then(function (comments) {
      let articleId = comments[0].articleId;
      return proxyComment.findByArticleId(articleId, 1, 5).then(function (comments) {
        expect(comments.length).to.equal(5);
        comments.forEach(function (comment) {
          expect(comment.articleId + '').to.equal(articleId + '');
        });
        done();
      }).catch(done);
    });
  });

});
