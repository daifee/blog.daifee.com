/**
 * 删除无效文章
 */

var cursor = db.articles.find({});
var articles = [];


while (cursor.hasNext()) {
  articles.push(cursor.next());
}

// 没有用户的文章
function withoutUser() {
  articles.forEach(function (article) {
    var userId = article.userId;

    var user = db.users.findOne({_id: userId});

    if (!user) {
      db.articles.remove({_id: article._id});
    }
  });
}

withoutUser();

