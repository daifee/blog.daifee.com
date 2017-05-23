const request = require('supertest');
const app = require('../index');
const {expect} = require('chai');
const {
  generateUserData,
  createUser,
  createUsers
} = require('./helper');

const agent = request(app);


describe('restful API user部分', function () {
  describe('用户授权 post /', function () {
    let userData = generateUserData();
    before(function (done) {
      createUser(userData).then(function () {
        done();
      }).catch(done);
    });

    it('授权成功', function (done) {
      agent
        .post('/api')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          name: userData.name,
          password: userData.password
        }))
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            let user = res.body;
            expect(user).to.have.any.keys('name', 'articleNum', 'email', 'role', 'avatar', 'introduction', 'token');
            expect(user.name).to.be.equal(userData.name);
            expect(user.email).to.be.equal(userData.email);
            done();
          }
        });
    });

    it('缺少用户名和密码', function (done) {
      agent
        .post('/api')
        .set('Content-Type', 'application/json')
        .expect('Content-Type', /application\/json/)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.message).to.be.ok;
            done();
          }
        });
    });

    it('密码错误', function (done) {
      agent
        .post('/api')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          name: userData.name,
          password: 'error'
        }))
        .expect('Content-Type', /application\/json/)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.message).to.be.ok;
            done();
          }
        });
    });

    it('用户名错误', function (done) {
      agent
        .post('/api')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          name: 'error',
          password: userData.password
        }))
        .expect('Content-Type', /application\/json/)
        .expect(400)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body.message).to.be.ok;
            done();
          }
        });
    });
  });


  describe('获取所有用户 get /users', function () {
    before(function (done) {
      createUsers(5).then(function () {
        done();
      }).catch(done);
    });

    it('获取所有用户，默认 page=1 get /api/users', function (done) {
      agent
        .get('/api/users')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.be.ok;
            done();
          }
        });
    });

    it('获取所有用户，page=99999 get /api/users', function (done) {
      agent
        .get('/api/users?page=99999')
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            expect(res.body).to.be.an('array');
            expect(res.body.length).to.equal(0);
            done();
          }
        });
    });
  });


  describe('获取所有用户 get /users/search', function () {
    let _administrator;

    before(function (done) {
      createUsers(5).then(function () {
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

    it('获取所有用户，默认 page=1 get /api/users/search', function (done) {
      agent
        .get('/api/users/search')
        .set('X-Token', _administrator.token)
        .query({
          role: 'user',
          status: 'normal',
          page: 1,
          per_page: 5
        })
        .expect('Content-Type', /application\/json/)
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


  describe('通过用户名获取一位用户 get /users/:name', function () {
    let _user;

    before(function (done) {
      createUser().then(function (user) {
        _user = user;
        done();
      }).catch(done);
    });

    it('获取一个用户 get /users/:name', function (done) {
      agent
        .get(`/api/users/${_user.name}`)
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
            return;
          }

          let body = res.body;
          expect(body).to.be.ok;
          expect(body.name).to.equal(_user.name);
          done();
        });
    });

    it('获取一个用户，用户名不存在 get /users/:name', function (done) {
      agent
        .get(`/api/users/notFound`)
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
            return;
          }

          let body = res.body;
          expect(body).to.not.be.ok;
          done();
        });
    });
  });


  describe('创建用户 post /users', function () {
    let _user;
    before(function (done) {
      createUser().then(function (user) {
        _user = user;
        done();
      }).catch(done);
    });

    it('创建用户 post /api/users', function (done) {
      let userData = generateUserData({
        role: 'administrator',
        articleNum: 9999
      });
      agent
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(userData))
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            let user = res.body;
            expect(user).to.have.any.keys('name', 'articleNum', 'email', 'role', 'avatar', 'introduction', 'token');
            expect(user.name).to.be.equal(userData.name);
            expect(user.email).to.be.equal(userData.email);
            expect(user.role).to.not.equal(userData.role);
            expect(user.articleNum).to.not.equal(userData.articleNum);
            done();
          }
        });
    });

    it('创建用户，缺少邮箱 post /api/users', function (done) {
      let userData = generateUserData();
      agent
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          name: userData.name,
          password: userData.password
        }))
        .expect('Content-Type', /application\/json/)
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

    it('创建用户，用户名已被注册 post /api/users', function (done) {
      let userData = generateUserData();

      agent
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          name: _user.name,
          password: userData.password,
          email: userData.email
        }))
        .expect('Content-Type', /application\/json/)
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

    it('创建用户，邮箱已被注册 post /api/users', function (done) {
      let userData = generateUserData();
      agent
        .post('/api/users')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          name: userData.name,
          password: userData.password,
          email: _user.email
        }))
        .expect('Content-Type', /application\/json/)
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


  describe('更新用户信息 patch /users/:id', function () {
    let _user1;
    let _user2;
    let _administrator;
    before(function (done) {
      createUsers(2).then(function (users) {
        _user1 = users[0];
        _user2 = users[1];
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

    it('成功更新', function (done) {
      let userData = {
        introduction: 'test',
        // exclude follow
        _id: 'zxcvbnm',
        articleNum: 999,
        salt: '456789',
        password: 'dfghjk',
        token: 'sdfghjk',
        status: 'deleted'
      };

      agent
        .patch(`/api/users/${_user1.id}`)
        .set('X-Token', _user1.token)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify(userData))
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            let body = res.body;
            expect(body).to.be.ok;
            expect(body.id).to.equal(_user1.id);
            expect(body.introduction).to.equal('test');
            expect(body.articleNum).to.not.equal(userData.articleNum);
            expect(body.salt).to.not.equal(userData.salt);
            expect(body.password).to.not.equal(userData.password);
            expect(body.token).to.not.equal(userData.token);
            expect(body.status).to.not.equal(userData.status);
            done();
          }
        });
    });

    it('未授权', function (done) {
      agent
        .patch(`/api/users/${_user1.id}`)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          introduction: 'test',
          avatar: 'https://tva2.sinaimg.cn/crop.0.0.180.180.180/852a97e7jw1e8qgp5bmzyj2050050aa8.jpg'
        }))
        .expect('Content-Type', /application\/json/)
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

    it('没权限更新他人信息', function (done) {
      agent
        .patch(`/api/users/${_user1.id}`)
        .set('X-Token', _user2.token)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          introduction: 'test',
          avatar: 'https://tva2.sinaimg.cn/crop.0.0.180.180.180/852a97e7jw1e8qgp5bmzyj2050050aa8.jpg'
        }))
        .expect('Content-Type', /application\/json/)
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

    it('提交格式错误的信息', function (done) {
      agent
        .patch(`/api/users/${_user1.id}`)
        .set('X-Token', _user1.token)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          introduction: 'test',
          avatar: '不是http'
        }))
        .expect('Content-Type', /application\/json/)
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

    it('管理员可以更新他人信息, 并修改role的值', function (done) {
      agent
        .patch(`/api/users/${_user1.id}`)
        .set('X-Token', _administrator.token)
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          introduction: 'test',
          role: 'administrator'
        }))
        .expect('Content-Type', /application\/json/)
        .expect(200)
        .end(function (err, res) {
          if (err) {
            done(err);
          } else {
            let body = res.body;
            expect(body).to.be.ok;
            expect(body.id).to.equal(_user1.id);
            expect(body.role).to.equal('administrator');
            done();
          }
        });
    });
  });


  describe('删除用户 delete /users/:id', function () {
    let _user1;
    let _user2;
    let _administrator;
    before(function (done) {
      createUsers(2).then(function (users) {
        _user1 = users[0];
        _user2 = users[1];
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

    it('管理员才可以删除用户', function (done) {
      agent
        .delete(`/api/users/${_user1.id}`)
        .set('X-Token', _administrator.token)
        .expect('Content-Type', /application\/json/)
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

    it('非管理员没有权限删除用户', function (done) {
      agent
        .delete(`/api/users/${_user2.id}`)
        .set('X-Token', _user2.token)
        .expect('Content-Type', /application\/json/)
        .expect(403)
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

    it('未授权', function (done) {
      agent
        .delete(`/api/users/${_user2.id}`)
        .expect('Content-Type', /application\/json/)
        .expect(401)
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
