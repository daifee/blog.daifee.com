const {expect} = require('chai');
const containKeys = require('../../api/utils/containKeys');


describe('utils/containKeys', function () {
  it('返回预期结果', function () {
    let result = containKeys({
      a: '',
      b: '',
      c: [],
      d: {}
    }, ['b', 'd', 'a']);

    expect(result).to.have.all.members(['b', 'd', 'a']);

    let result2 = containKeys({
      a: '',
      b: '',
      c: [],
      d: {}
    }, ['b', 'd', 'a', 'f', 'c']);

    expect(result2).to.have.all.members(['a', 'b', 'c', 'd']);
  });
});
