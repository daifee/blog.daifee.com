const {expect} = require('chai');
const CustomError = require('../api/CustomError');


describe('CustomError.js', function () {
  it('自定义错误对象 class CustomError(message, code)', function () {
    let err = new CustomError(1000, 'message');

    expect(err.message).to.equal('message');
    expect(err.code).to.equal(1000);
    expect(err.status).to.equal(400);
    expect(err.name).to.equal('CustomError');
    expect(err).to.be.instanceof(CustomError);
  });

  it('自定义错误对象，将code强制转为number型 class CustomError(message, code)', function () {
    let err = new CustomError('1000');
    expect(err.code).to.equal(1000);
  });

  it('未定义的code，会抛出错误', function () {
    let fun = function () {
      return new CustomError(30021);
    };

    expect(fun).to.throw(TypeError);
  });
});
