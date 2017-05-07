const {expect} = require('chai');
const copyObject = require('../../api/utils/copyObject');


describe('utils/copyObject', function () {
  it('返回预期结果', function () {
    let result = copyObject({
      a: 'a',
      b: 'b',
      c: 'c',
      d: 'd'
    }, ['b', 'd', 'a']);

    expect(result).to.deep.equal({c: 'c'});
  });

  it('n个source', function () {
    let result = copyObject({
      a: 'a',
      b: 'b'
    }, {
      c: 'c',
      d: 'd'
    }, ['b', 'd', 'a']);

    expect(result).to.deep.equal({c: 'c'});
  });
});
