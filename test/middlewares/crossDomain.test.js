const {expect} = require('chai');
const mocksHttp = require('node-mocks-http');
const crossDomain = require('../../api/middlewares/crossDomain');

describe.only('middlewares/crossDomain.js', function () {
  it('允许所有请求域', function () {
    let request = mocksHttp.createRequest({
      method: 'POST',
      headers: {
        'Origin': 'www.google.com'
      }
    });
    let response = mocksHttp.createResponse();
    let called = false;

    crossDomain(request, response, function () {
      called = true;
      expect(response.getHeader('Access-Control-Allow-Origin')).to.equal('*');
    });

    expect(called).to.be.ok;
  });

  it('响应跨域的preflight请求', function () {
    let request = mocksHttp.createRequest({
      method: 'OPTIONS',
      headers: {
        'Origin': 'www.google.com',
        'Access-control-Request-Method': 'GET, PUT, DELETE',
        'Access-Control-Request-Headers': 'X-Token'
      }
    });
    let response = mocksHttp.createResponse();

    crossDomain(request, response, function () {
      throw new Error('没有正确处理preflight请求才会执行到这里');
    });

    expect(response.statusCode).to.equal(204);
    expect(response._getData()).to.equal('');
    expect(response.getHeader('Access-Control-Allow-Origin')).to.equal('*');
    expect(response.getHeader('Access-Control-Allow-Methods'))
      .to.equal('GET,POST,PUT,DELETE,PATCH');
    expect(response.getHeader('Access-Control-Allow-Headers'))
      .to.equal('X-Token');
    expect(response.getHeader('Access-Control-Max-Age'))
      .to.equal('86400');
  });

  it('不是有效的preflight请求', function () {
    let request = mocksHttp.createRequest({
      method: 'POST',
      headers: {
        // 'Origin': 'www.google.com',
        'Access-control-Request-Method': 'GET, PUT, DELETE',
        'Access-Control-Allow-Headers': 'X-Token'
      }
    });
    let response = mocksHttp.createResponse();
    let called = false;

    crossDomain(request, response, function () {
      called = true;
      expect(response.getHeader('Access-Control-Allow-Origin'))
        .to.equal(undefined);
    });

    expect(called).to.be.ok;
  });

});
