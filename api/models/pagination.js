/**
 * 分页
 */
const mongoose = require('mongoose');
const {Schema} = mongoose;

const DEFINITION = {
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


const schema = new Schema(DEFINITION);

const Pagination = mongoose.model('Pagination', schema);

// 方便测试
Pagination._DEFINITION = DEFINITION;

module.exports = Pagination;

