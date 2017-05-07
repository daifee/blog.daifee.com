const {expect} = require('chai');
const mocksHttp = require('node-mocks-http');
const respondContentType = require('../../api/middlewares/respondContentType');

describe('middlewares/respondContentType.js', function () {
  it('确实 Accept 请求头，默认响应 application/json', function () {
    let req = mocksHttp.createRequest();
    let res = mocksHttp.createResponse();

    respondContentType(req, res, function () {
      expect(res.getHeader('Content-Type')).to.match(/application\/json/);
    });
  });

  it('响应 text/html', function () {
    let req = mocksHttp.createRequest({
      headers: {
        'Accept': 'text/html'
      }
    });
    let res = mocksHttp.createResponse();

    respondContentType(req, res, function () {
      expect(res.getHeader('Content-Type')).to.match(/text\/html/);
    });
  });

  it('响应 text/plain', function () {
    let req = mocksHttp.createRequest({
      headers: {
        'Accept': 'text/plain'
      }
    });
    let res = mocksHttp.createResponse();

    respondContentType(req, res, function () {
      expect(res.getHeader('Content-Type')).to.match(/text\/plain/);
    });
  });
});
