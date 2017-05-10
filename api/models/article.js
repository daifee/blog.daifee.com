/**
 * 文章
 */
const mongoose = require('mongoose');
const {Schema} = mongoose;
const {ObjectId} = Schema;
const marked = require('marked');

const DEFINITION = {
  // 关联用户模型数据
  userId: {
    type: ObjectId,
    required: [true, '用户ID不能为空']
  },
  // 评论数量
  commentNum: {  // 评论数量
    type: Number,
    default: 0
  },
  // 标题
  title: {
    type: String,
    required: [true, '标题不能为空']
  },
  // 内容（markdown）
  content: {
    type: String,
    required: [true, '内容不能为空']
  },
  // 内容（HTML）
  html: {
    type: String,
    default: ''
  },
  // 导语（content前140个字符）
  introduction: {
    type: String,
    get: function () {
      let content = this.content;
      return content ? content.substring(0, 140) : '';
    }
  },
  // 状态
  status: {
    type: String,
    default: 'published',
    // 发布，未发布，已删除
    enum: ['published', 'unpublished', 'deleted']
  },
  // 阅读量
  views: {
    type: Number,
    default: 0
  }
};
const OPTIONS = {
  timestamps: true,
  toJSON: {virtuals: true, getters: true}
};

const schema = new Schema(DEFINITION, OPTIONS);


schema.methods.setHTML = function (content) {
  // Model methods 用法
  // else
  // instance methods 用法
  if (content) {
    return marked(content);
  } else {
    this.html = marked(this.content);
  }
};

const Article = mongoose.model('Article', schema);

// 方便测试
Article._DEFINITION = DEFINITION;
Article._OPTIONS = OPTIONS;

module.exports = Article;
