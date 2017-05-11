const {
  expect
} = require('chai');
const Article = require('../../api/models/article');
const {_DEFINITION, _OPTIONS} = Article;
const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema;
const {objectDeepEqual} = require('../helper');

describe('models/article.test.js', function () {
  it('模块返回model构造函数', function () {
    expect(Article).to.equal(mongoose.model('Article'));
  });

  it('检测Schema的definition', function () {
    const definition = {
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

  it('检测Schema的options', function () {
    expect(_OPTIONS).to.have.property('timestamps', true);
    expect(_OPTIONS.toJSON).to.deep.equal({virtuals: true, getters: true});
  });


  it('.renderContent()', function () {
    let article = new Article({
      content: '# H1\npppp\n## H2\npppp'
    });

    article.content = Article.renderContent(article.content);
    expect(article.content).to.equal('<h1 id="h1">H1</h1>\n<p>pppp</p>\n<h2 id="h2">H2</h2>\n<p>pppp</p>\n');
  });
});
