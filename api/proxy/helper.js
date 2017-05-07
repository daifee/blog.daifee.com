const proxyUser = require('./user');

/**
 * 生成分页查询参数
 */
exports.generatePaginationQueryOptions = function (page = 1, perPage = 20) {
  let skip = (page - 1) * perPage;
  let limit = perPage * 1;

  return {skip, limit};
};



/**
 * 将mongoose document，返回document.toJSON()
 * 或，将数组中的mongoose document返回document.toJSON()
 */
exports.toJSON = function (document) {
  if (Array.isArray(document)) {
    return document.map(function (document) {
      return exports.toJSON(document);
    });
  } else {
    return (document && document.toJSON) ? document.toJSON() : document;
  }
};


exports.associateUser = function (document) {
  if (!document) return document;

  document = exports.toJSON(document);

  // 非数组
  if (!Array.isArray(document)) {
    // 查找关联用户
    return proxyUser.findOneById(document.userId).then(function (user) {
      document.user = exports.toJSON(user);
      // 返回document对象
      return document;
    });
  }

  // 数组
  let userIds = document.map(function (item) {
    return item.userId;
  });

  // 查找关联用户
  return proxyUser.findByIds(userIds).then(function (users) {
    let mapUser = {};
    users.forEach(function (user) {
      mapUser[user.id] = user;
    });

    let result = document.map(function (item) {
      item.user = exports.toJSON(mapUser[item.userId]);

      return item;
    });

    return result;
  });
};


