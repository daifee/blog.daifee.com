module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [

    // First application
    {
      name: 'blog.daifee.com',
      script: 'index.js',
      env: {
        NODE_ENV: 'production'
      },
      watch: false,
      'error_file': './logs/pm2.err.log',
      'out_file': './logs/pm2.out.log',
      'merge_logs': true,
      'log_date_format': 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
