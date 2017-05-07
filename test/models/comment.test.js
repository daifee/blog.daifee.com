const {
  expect
} = require('chai');
const Comment = require('../../api/models/comment');
const {_DEFINITION, _OPTIONS} = Comment;
const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;


describe('models/comment.test.js', function () {
  it('模块返回model构造函数', function () {
    expect(Comment).to.equal(mongoose.model('Comment'));
  });

  it('检测Schema的definition', function () {
    expect(_DEFINITION).to.be.deep.equal({
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
    });
  });

  it('检测Schema的options', function () {
    expect(_OPTIONS).to.have.property('timestamps', true);
    expect(_OPTIONS.toJSON).to.deep.equal({virtuals: true});
  });
});
