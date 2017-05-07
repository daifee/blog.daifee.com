/**
 * 文章
 */
const mongoose = require('mongoose');
const {Schema} = mongoose;
const {ObjectId} = Schema;

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
  toJSON: {virtuals: true}
};

const schema = new Schema(DEFINITION, OPTIONS);


const Article = mongoose.model('Article', schema);

// 方便测试
Article._DEFINITION = DEFINITION;
Article._OPTIONS = OPTIONS;

module.exports = Article;
