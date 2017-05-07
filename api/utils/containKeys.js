

/**
 * 检测某对象是否包含一系列的key
 * @param {object} obj 目标对象
 * @param {array} keys 被检测的key列表
 * @return {array} obj包含的key，keys的子集
 */
function containKeys(obj = {}, keys = []) {
  let result = Object.keys(obj).filter(function (key) {
    return keys.indexOf(key) !== -1;
  });

  return result;
}

module.exports = containKeys;
