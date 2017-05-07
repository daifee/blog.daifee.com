const devConfig = require('./index.dev');
const proConfig = require('./index.pro');
const secret = require('../../secret.json');

const PRODUCTION = process.env.NODE_ENV !== 'development';
const ROOT_PATH = process.cwd();

let config = {
  production: PRODUCTION,

  rootPath: ROOT_PATH,

  salt: secret.salt
};

if (config.production) {
  Object.assign(config, proConfig);
} else {
  Object.assign(config, devConfig);
}

module.exports = config;
