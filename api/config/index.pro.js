const secret = require('../../secret.json');

module.exports = {
  // pm2管理的应用名称
  appName: 'blog.daifee.com',

  // 端口
  port: 8088,

  // mongodb配置
  mongodb: {
    uri: 'mongodb://localhost/blog_daifee_com',
    options: {
      user: 'blog_daifee_com',
      pass: secret.mongodbPassword
    }
  },
  // 生产环境运行的代码分支
  branch: 'refs/heads/master'
};
