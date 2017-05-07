const {expect} = require('chai');
const {createUser, generateUserData} = require('../helper');
const mocksHttp = require('node-mocks-http');
const authorize = require('../../api/middlewares/authorize');

describe('middlewares/authorize.js', function () {
  let user1, user2, administrator1;

  before(function (done) {
    let administrator1Data = generateUserData({role: 'administrator'});

    Promise.all([
      createUser(),
      createUser(),
      createUser(administrator1Data)
    ]).then(function (values) {
      user1 = values[0];
      user2 = values[1];
      administrator1 = values[2];
      done();
    }).catch(done);
  });

  it('有效参数', function () {
    let fn1 = function () {
      authorize('');
    };
    expect(fn1).to.throw(Error);

    let fn2 = function () {
      authorize('guest');
    };
    expect(fn2).to.throw(Error);

    expect(authorize('user')).to.be.a('function');
    expect(authorize('self')).to.be.a('function');
    expect(authorize('administrator')).to.be.a('function');
  });

  describe('限制user可访问', function () {
    it('游客访问', function (done) {
      let request = mocksHttp.createRequest();
      let response = mocksHttp.createResponse();

      authorize('user')(request, response, function (err) {
        expect(err.code).to.equal(1002);
        expect(err.status).to.equal(401);
        expect(request._visitor).to.not.be.ok;
      }).then(done).catch(done);
    });

    it('无效X-Token访问', function (done) {
      let request = mocksHttp.createRequest({
        headers: {
          'X-Token': 'xxxxxxxxxx无效'
        }
      });
      let response = mocksHttp.createResponse();

      authorize('user')(request, response, function (err) {
        expect(err.code).to.equal(1003);
        expect(err.status).to.equal(403);
        expect(request._visitor).to.not.be.ok;
      }).then(done).catch(done);
    });

    it('用户访问', function (done) {
      let request = mocksHttp.createRequest({
        headers: {
          'X-Token': user1.token
        }
      });
      let response = mocksHttp.createResponse();

      authorize('user')(request, response, function (err) {
        expect(err).to.equal(undefined);
        expect(request._visitor).to.be.ok;
        expect(request._visitor.id).to.equal(user1.id);
      }).then(done).catch(done);
    });

    it('自己访问', function (done) {
      let request = mocksHttp.createRequest({
        headers: {
          'X-Token': user1.token
        },
        params: {
          userId: user1.id  // 模拟自己
        }
      });
      let response = mocksHttp.createResponse();

      authorize('user')(request, response, function (err) {
        expect(err).to.equal(undefined);
        expect(request._visitor).to.be.ok;
        expect(request._visitor.id).to.equal(user1.id);
      }).then(done).catch(done);
    });

    it('管理员访问', function (done) {
      let request = mocksHttp.createRequest({
        headers: {
          'X-Token': administrator1.token
        }
      });
      let response = mocksHttp.createResponse();

      authorize('user')(request, response, function (err) {
        expect(err).to.equal(undefined);
        expect(request._visitor).to.be.ok;
        expect(request._visitor.id).to.equal(administrator1.id);
      }).then(done).catch(done);
    });
  });


  describe('限制self可访问', function () {
    it('游客访问', function (done) {
      let request = mocksHttp.createRequest({
        params: {
          userId: user1.id  // 模拟自己
        }
      });
      let response = mocksHttp.createResponse();

      authorize('self')(request, response, function (err) {
        expect(err.code).to.equal(1002);
        expect(err.status).to.equal(401);
        expect(request._visitor).to.not.be.ok;
      }).then(done).catch(done);
    });

    it('无效X-Token访问', function (done) {
      let request = mocksHttp.createRequest({
        params: {
          userId: user1.id  // 模拟自己
        },
        headers: {
          'X-Token': 'xxxxxxxxxx无效'
        }
      });
      let response = mocksHttp.createResponse();

      authorize('self')(request, response, function (err) {
        expect(err.code).to.equal(1003);
        expect(err.status).to.equal(403);
        expect(request._visitor).to.not.be.ok;
      }).then(done).catch(done);
    });

    it('用户访问，不是自己', function (done) {
      let request = mocksHttp.createRequest({
        params: {
          userId: user1.id  // 模拟自己
        },
        headers: {
          'X-Token': user2.token
        }
      });
      let response = mocksHttp.createResponse();

      authorize('self')(request, response, function (err) {
        expect(err.code).to.equal(1003);
        expect(err.status).to.equal(403);
        expect(request._visitor).to.not.be.ok;
      }).then(done).catch(done);
    });

    it('自己访问', function (done) {
      let request = mocksHttp.createRequest({
        params: {
          userId: user1.id // 模拟自己
        },
        headers: {
          'X-Token': user1.token
        }
      });
      let response = mocksHttp.createResponse();

      authorize('self')(request, response, function (err) {
        expect(err).to.equal(undefined);
        expect(request._visitor).to.be.ok;
        expect(request._visitor.id).to.equal(user1.id);
      }).then(done).catch(done);
    });

    it('管理员访问', function (done) {
      let request = mocksHttp.createRequest({
        headers: {
          'X-Token': administrator1.token
        }
      });
      let response = mocksHttp.createResponse();

      authorize('self')(request, response, function (err) {
        expect(err).to.equal(undefined);
        expect(request._visitor).to.be.ok;
        expect(request._visitor.id).to.equal(administrator1.id);
      }).then(done).catch(done);
    });
  });



  describe('限制administrator可访问', function () {
    it('游客访问', function (done) {
      let request = mocksHttp.createRequest({
        params: {
          userId: user1.id  // 模拟自己
        }
      });
      let response = mocksHttp.createResponse();

      authorize('administrator')(request, response, function (err) {
        expect(err.code).to.equal(1002);
        expect(err.status).to.equal(401);
        expect(request._visitor).to.not.be.ok;
      }).then(done).catch(done);
    });

    it('无效X-Token访问', function (done) {
      let request = mocksHttp.createRequest({
        params: {
          userId: user1.id  // 模拟自己
        },
        headers: {
          'X-Token': 'xxxxxxxxxx无效'
        }
      });
      let response = mocksHttp.createResponse();

      authorize('administrator')(request, response, function (err) {
        expect(err.code).to.equal(1003);
        expect(err.status).to.equal(403);
        expect(request._visitor).to.not.be.ok;
      }).then(done).catch(done);
    });

    it('用户访问，不是自己', function (done) {
      let request = mocksHttp.createRequest({
        params: {
          userId: user1.id  // 模拟自己
        },
        headers: {
          'X-Token': user2.token
        }
      });
      let response = mocksHttp.createResponse();

      authorize('administrator')(request, response, function (err) {
        expect(err.code).to.equal(1003);
        expect(err.status).to.equal(403);
        expect(request._visitor).to.not.be.ok;
      }).then(done).catch(done);
    });

    it('自己访问，但不是管理员', function (done) {
      let request = mocksHttp.createRequest({
        params: {
          userId: user1.id // 模拟自己
        },
        headers: {
          'X-Token': user1.token
        }
      });
      let response = mocksHttp.createResponse();

      authorize('administrator')(request, response, function (err) {
        expect(err.code).to.equal(1003);
        expect(err.status).to.equal(403);
        expect(request._visitor).to.not.be.ok;
      }).then(done).catch(done);
    });

    it('管理员访问', function (done) {
      let request = mocksHttp.createRequest({
        headers: {
          'X-Token': administrator1.token
        }
      });
      let response = mocksHttp.createResponse();

      authorize('administrator')(request, response, function (err) {
        expect(err).to.equal(undefined);
        expect(request._visitor).to.be.ok;
        expect(request._visitor.id).to.equal(administrator1.id);
      }).then(done).catch(done);
    });
  });

});
