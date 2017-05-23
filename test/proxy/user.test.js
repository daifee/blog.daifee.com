const {
  generateUserData,
  createUser,
  createUsers,
  createComments,
  createArticle
} = require('../helper');
const {expect} = require('chai');
const proxyUser = require('../../api/proxy/user');
const proxyArticle = require('../../api/proxy/article');
const proxyComment = require('../../api/proxy/comment');
const CustomError = require('../../api/CustomError');
const User = require('../../api/models/user');

describe('proxy/user.js', function () {
  it('创建一个用户 .createOne(user)', function (done) {
    let userData = generateUserData();
    proxyUser.createOne(userData).then(function (user) {
      expect(user).to.be.ok;
      expect(user.name).to.equal(userData.name);
      expect(user.email).to.equal(userData.email);
      done();
    }).catch(done);
  });

  describe('创建用户，用户已存在', function () {
    let _user;
    let userData = generateUserData();
    before(function (done) {
      createUser().then(function (user) {
        _user = user;
        done();
      }).catch(done);
    });

    it('用户名已存在', function (done) {
      proxyUser.createOne(Object.assign({}, userData, {name: _user.name})).then(function (user) {
        done(new Error('不应该创建成功，name是唯一key'));
      }).catch(function (err) {
        expect(err.name).to.equal('MongoError');
        expect(err.code).to.equal(11000);
        done();
      });
    });

    it('用户邮箱已存在', function (done) {
      proxyUser.createOne(Object.assign({}, userData, {email: _user.email})).then(function (user) {
        done(new Error('不应该创建成功，email是唯一key'));
      }).catch(function (err) {
        expect(err.name).to.equal('MongoError');
        expect(err.code).to.equal(11000);
        done();
      });
    });

    it('用户名和邮箱已存在', function (done) {
      proxyUser.createOne(Object.assign({}, userData, {
        name: _user.name,
        email: _user.email
      })).then(function (user) {
        done(new Error('不应该创建成功，name和email是唯一key'));
      }).catch(function (err) {
        expect(err.name).to.equal('MongoError');
        expect(err.code).to.equal(11000);
        done();
      });
    });

    it('传递了_id字段，不是ObjectId类型', function (done) {
      let userData = generateUserData();
      userData._id = 'test' + Date.now();
      proxyUser.createOne(Object.assign({}, userData, {
        name: _user.name,
        email: _user.email
      })).then(function (user) {
        done(new Error('不应该创建成功，name和email是唯一key'));
      }).catch(function (err) {
        // 会验证
        expect(err.name).to.equal('ValidationError');
        expect(err.message).to.be.ok;
        done();
      });
    });

    it('传递了_id字段，是ObjectId类型', function (done) {
      let userData = generateUserData();
      let _user = new User({});
      userData._id = _user.id;
      proxyUser.createOne(userData).then(function (user) {
        expect(user.id).to.equal(userData._id.toString());
        done();
      }).catch(done);
    });

    it('传递已存在的_id', function (done) {
      let userData = generateUserData();
      userData._id = _user.id;
      proxyUser.createOne(userData).then(function (user) {
        done(new Error('不应该创建成功，_id是唯一key'));
      }).catch(function (err) {
        expect(err.name).to.equal('MongoError');
        expect(err.code).to.equal(11000);
        done();
      });
    });
  });

  it('验证用户 .verify(name, password)', function (done) {
    let userData = generateUserData();
    createUser(userData).then(function (user) {
      return proxyUser.verify(userData.name, userData.password).then(function () {
        done();
      });
    }).catch(done);
  });

  it('验证用户，失败 .verify(name, password)', function (done) {
    createUser().then(function (user) {
      return proxyUser.verify(user.name, '').catch(function (err) {
        expect(err).to.be.an.instanceof(CustomError);
        expect(err.code).to.equal(1004);
        done();
        return 'resolved';
      }).then(function (value) {
        if (value === 'resolved') {
          return;
        }
        throw new Error('不应该通过验证');
      });
    }).catch(done);
  });

  describe('更新用户信息 .updateOneById', function () {
    let _user;

    before(function (done) {
      createUser().then(function (user) {
        _user = user;
        done();
      }).catch(done);
    });

    it('更新成功', function (done) {
      proxyUser.updateOneById(_user.id, {
        status: 'deleted',
        introduction: 'men'
      }).then(function (user) {
        expect(user.name).to.equal(_user.name);
        expect(user.status).to.equal('deleted');
        expect(user.introduction).to.equal('men');
        done();
      }).catch(done);
    });

    it('更新_id会发生什么事', function (done) {

      proxyUser.updateOneById(_user.id, {
        _id: _user.id
      }).then(function (user) {
        expect(user.id).to.equal(_user.id);
        done();
      }).catch(done);
    });

    it('用已存在的_id更新，err.code竟然不是11000，而是66。_id是特殊的', function (done) {
      createUser().then(function (user) {
        return proxyUser.updateOneById(user.id, {
          _id: _user.id
        }).then(function (user) {
          done(new Error('不应该更新成功，_id是唯一key'));
        }).catch(function (err) {
          expect(err.name).to.equal('MongoError');
          expect(err.code).to.equal(66);
          done();
        });
      }).catch(done);
    });

    it('用已存在的name更新，err.code是11000', function (done) {
      createUser().then(function (user) {
        return proxyUser.updateOneById(user.id, {
          name: _user.name
        }).then(function (user) {
          done(new Error('不应该更新成功，name是唯一key'));
        }).catch(function (err) {
          expect(err.name).to.equal('MongoError');
          expect(err.code).to.equal(11000);
          done();
        });
      }).catch(done);
    });

    it('用空数据更新，会返回什么？', function (done) {
      createUser().then(function (_user) {
        return proxyUser.updateOneById(_user.id, {}).then(function (user) {
          expect(user).to.have.all.keys(_user);

          Object.keys(user).forEach(function (key) {
            let val1 = user[key];
            typeof val1 === 'object' && (val1 = val1.toString());
            let val2 = _user[key];
            typeof val2 === 'object' && (val2 = val2.toString());

            expect(val1).to.equal(val2);
          });
          done();
        });
      }).catch(done);
    });
  });

  describe('deleteOneById(id)', function () {
    let _userId;
    before(function (done) {
      createArticle().then(function (article) {
        _userId = article.userId;

        return createComments(5, article).then(function () {
          done();
        });
      }).catch(done);
    });

    it('删除一个用户', function (done) {
      proxyUser.deleteOneById(_userId).then(function (user) {
        expect(user.status).to.be.equal('deleted');

        return Promise.all([
          proxyArticle.findByUserId(user.id),
          proxyComment.findByUserId(user.id)
        ]).then(function (values) {
          expect(values[0].length).to.equal(0);
          expect(values[1].length).to.equal(0);
          done();
        });
      }).catch(done);
    });
  });

  it('屏蔽一个用户 .blockOneById(id)', function (done) {
    createUser().then(function (user) {
      return proxyUser.blockOneById(user.id).then(function (user) {
        expect(user.status).to.be.equal('blocked');
        done();
      });
    }).catch(done);
  });

  it('通过token查找一个用户 .findOneByToken(token)', function (done) {
    createUser().then(function (user) {
      let token = user.token;
      return proxyUser.findOneByToken(token).then(function (user) {
        expect(user).to.be.ok;
        expect(user.token).to.equal(token);
        // 返回token
        expect(user.token).to.be.ok;
        expect(user.password).to.not.be.ok;
        expect(user.salt).to.not.be.ok;
        done();
      }).catch(done);
    }).catch(done);
  });

  it('通过name查找一个用户 .findOneByName(name)', function (done) {
    createUser().then(function (user) {
      let name = user.name;
      return proxyUser.findOneByName(name).then(function (user) {
        expect(user).to.be.ok;
        expect(user.name).to.equal(name);
        expect(user.token).to.not.be.ok;
        expect(user.password).to.not.be.ok;
        expect(user.salt).to.not.be.ok;
        done();
      }).catch(done);
    }).catch(done);
  });

  it('通过id查找一个用户 .findOneById(id)', function (done) {
    createUser().then(function (user) {
      let id = user.id;
      return proxyUser.findOneById(id).then(function (user) {
        expect(user).to.be.ok;
        expect(user.id).to.equal(id);
        expect(user.token).to.not.be.ok;
        expect(user.password).to.not.be.ok;
        expect(user.salt).to.not.be.ok;
        done();
      }).catch(done);
    }).catch(done);
  });

  it('找不到被删除的用户 .findOneByToken, .findOneByName, .findOneById', function (done) {
    createUser().then(function (user) {
      return proxyUser.deleteOneById(user.id).then(function () {
        return Promise.all([
          proxyUser.findOneById(user.id),
          proxyUser.findOneByName(user.name),
          proxyUser.findOneByToken(user.token)
        ]).then(function (values) {
          expect(values).to.deep.equal([null, null, null]);
          done();
        });
      });
    }).catch(done);
  });

  it('通过id查找用户 .findByIds(ids)', function (done) {
    createUsers(5).then(function (users) {
      let ids = users.map(function (user) {
        return user.id;
      });

      return proxyUser.findByIds(ids).then(function (users) {
        expect(users.length).to.equal(5);

        let _ids = users.map(function (user) {
          return user.id;
        });
        expect(_ids).to.deep.equal(ids);

        // 删除一个用户
        return proxyUser.deleteOneById(_ids[1]).then(function () {
          // 传入5个，但只能找到4个用户
          return proxyUser.findByIds(_ids).then(function (users) {
            expect(users.length).to.equal(4);
            done();
          });
        });
      });
    }).catch(done);
  });

  it('分页查找 .find(page, perPage', function (done) {
    createUsers(5).then(function () {
      return proxyUser.find(1, 5).then(function (users) {
        expect(users.length).to.equal(5);
        done();
      });
    }).catch(done);
  });


  it('搜索 .search(page, perPage, selector)', function (done) {
    createUsers(5).then(function (users) {
      let p1 = proxyUser.search(1, 5, {role: 'user', status: 'normal'}).then(function (users) {
        expect(users.length).to.equal(5);
      });
      let p2 = proxyUser.search(1, 5, {name: users[0].name}).then(function (users) {
        expect(users.length).to.equal(1);
      });

      return Promise.all([p1, p2]).then(function () {
        done();
      });
    }).catch(done);
  });

  it('增加文章阅读数量 increaseArticleNum(id, num)', function (done) {
    createUser().then(function (user) {
      return proxyUser.increaseArticleNum(user.id).then(function (user) {
        expect(user.articleNum).to.equal(1);
        done();
      });
    }).catch(done);
  });

  it('减少文章数量 reduceArticleNum(id, num)', function (done) {
    createUser().then(function (user) {
      return proxyUser.reduceArticleNum(user.id).then(function (user) {
        expect(user.articleNum).to.equal(-1);
        done();
      });
    }).catch(done);
  });
});
