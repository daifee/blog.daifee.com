const {
  expect
} = require('chai');
const Article = require('../../api/models/article');
const {_DEFINITION, _OPTIONS} = Article;
const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;


describe('models/article.test.js', function () {
  it('模块返回model构造函数', function () {
    expect(Article).to.equal(mongoose.model('Article'));
  });

  it('检测Schema的definition', function () {
    expect(_DEFINITION).to.be.deep.equal({
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
    });
  });

  it('检测Schema的options', function () {
    expect(_OPTIONS).to.have.property('timestamps', true);
    expect(_OPTIONS.toJSON).to.deep.equal({virtuals: true});
  });
});
