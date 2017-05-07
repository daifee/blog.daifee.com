/**
 * 文章评论
 */
const mongoose = require('mongoose');
const {Schema} = mongoose;
const {ObjectId} = Schema;

const DEFINITION = {
  // 发起评论的用户
  userId: {
    type: ObjectId,
    required: [true, '用户ID不能为空']
  },
  // 被评论的文章
  articleId: {
    type: ObjectId,
    required: [true, '文章ID不能为空']
  },
  // 源内容（markdown）
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
  }
};

const OPTIONS = {
  timestamps: true,
  toJSON: {virtuals: true}
};


const schema = new Schema(DEFINITION, OPTIONS);

const Comment = mongoose.model('Comment', schema);

// 方便测试
Comment._DEFINITION = DEFINITION;
Comment._OPTIONS = OPTIONS;

module.exports = Comment;

