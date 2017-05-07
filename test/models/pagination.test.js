const {
  expect
} = require('chai');
const Pagination = require('../../api/models/pagination');
const {_DEFINITION} = Pagination;
const mongoose = require('mongoose');
const {objectDeepEqual} = require('../helper');


describe('models/pagination.test.js', function () {
  it('模块返回model构造函数', function () {
    expect(Pagination).to.equal(mongoose.model('Pagination'));
  });

  it('检测Schema的definition', function () {
    let definition = {
      page: {
        type: Number,
        get: function (val) {
          if (typeof val !== 'number') {
            val = parseInt(val, 10);
          }

          if (!val) {
            val = 1;
          }

          return val;
        }
      },

      perPage: {
        type: Number,
        get: function (val) {
          if (typeof val !== 'number') {
            val = parseInt(val, 10);
          }

          if (!val) {
            val = this.per_page;
          }

          return val;
        }
      },

      per_page: {
        type: Number,
        get: function (val) {
          if (typeof val !== 'number') {
            val = parseInt(val, 10);
          }

          if (!val) {
            val = 20;
          }

          return val;
        }
      }
    };

    objectDeepEqual(_DEFINITION, definition, function (value1, value2) {
      if (typeof value1 === 'function' && typeof value1 === 'function') {
        // 函数体代码完全相同
        value1 = value1.toString().replace(/\s/g, '');
        value2 = value2.toString().replace(/\s/g, '');
        expect(value1).to.equal(value2);
      } else {
        expect(value1).to.equal(value2);
      }
    });
  });

  it('参数per_page转为perPage', function () {
    let pagination = new Pagination({page: 3, per_page: 5});
    expect(pagination.perPage).to.equal(5);
    expect(pagination.page).to.equal(3);
  });
});
