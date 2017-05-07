
module.exports = {
  // pm2管理的应用名称
  appName: 'test-blog.daifee.com',
  // 端口
  port: 8087,
  // mongodb配置
  mongodb: {
    uri: 'mongodb://localhost/test-blog_daifee_com',
    // 本地开发，本地数据库没有设置权限
    options: {
      user: '',
      pass: ''
    }
  },
  // 测试环境运行的代码分支
  branch: 'refs/heads/test'
};
