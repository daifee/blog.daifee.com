
/**
 * 复制sources对象的属性
 * 最后一个参数为exclude指定不复制的属性
 */
module.exports = function (...sources) {
  let exclude = sources.pop();
  sources.unshift({});
  let result = Object.assign.apply(Object, sources);

  exclude.forEach(function (key) {
    delete result[key];
  });

  return result;
};
