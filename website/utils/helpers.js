const fecha = require('fecha');
const originDate = new Date(0);


exports.formatDate = function (date = originDate) {
  if (typeof date !== 'object') {
    date = new Date(date);
  }

  return fecha.format(date, 'YYYY-MM-DD');
};


// 列表内容
exports.listArticleContent = function (content) {
  content = content.replace(/\s/g, ' ');
  return content.slice(0, 200);
};
