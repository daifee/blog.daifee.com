const proxyHelper = require('../../api/proxy/helper');
const {expect} = require('chai');
const {
  createArticle,
  createArticles
} = require('../helper');



describe('proxy/hepler', function () {
  it('generatePaginationQueryOptions(page, perPage)', function () {
    let queryOptions = proxyHelper.generatePaginationQueryOptions(2, 20);
    expect(queryOptions).to.deep.equal({
      skip: 20,
      limit: 20
    });
  });

  it('.toJSON(document)', function () {
    let doc = {
      toJSON: function () {
        return 'json';
      }
    };

    expect(proxyHelper.toJSON(doc)).to.equal('json');
    expect(proxyHelper.toJSON(3)).to.equal(3);
  });

  it('.toJSON(document) document为数组', function () {
    let docs = [
      'json',
      {toJSON: function () {
        return '';
      }}
    ];

    expect(proxyHelper.toJSON(docs)).to.deep.equal(['json', '']);
  });

  it('将document对象关联user对象，并调用toJSON() .associateUser(document)', function (done) {
    createArticle().then(function (article) {
      return proxyHelper.associateUser(article).then(function (article) {
        expect(article).to.be.ok;
        expect(article.userId).to.be.ok;
        expect(article.user).to.be.ok;
        done();
      });
    }).catch(done);
  });

  it('.associateUser(null)', function (done) {
    proxyHelper.associateUser(null).then(function (value) {
      expect(value).to.equal(null);
      done();
    }).catch(done);
  });

  it('将documents数组中的值关联user对象 .associateUser(documents)', function (done) {
    createArticles(5).then(function (articles) {
      return proxyHelper.associateUser(articles).then(function (articles) {
        expect(articles).to.be.ok;
        expect(articles.length).to.equal(5);
        articles.forEach(function (article) {
          expect(article.userId).to.be.ok;
          expect(article.user).to.be.ok;
        });
        done();
      });
    }).catch(done);
  });
});

