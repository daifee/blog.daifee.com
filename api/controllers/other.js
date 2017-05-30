const config = require('../config');
const CustomError = require('../CustomError');
const childProcess = require('child_process');
const MongooseError = require('mongoose').Error;
const {ValidationError} = MongooseError;

// 响应404
exports.notFound = function (req, res, next) {
  res.status(404);
  res.json({
    message: '不存在接口'
  });
};


// 响应error
exports.error = function (err, req, res, next) {
  // 输入错误
  if (err instanceof ValidationError) {
    err = new CustomError(2001, err.toString());
  }

  // 向mongodb唯一键插入重复数据
  if (err.name === 'MongoError') {
    err = new CustomError(2002, err.message);
  }

  // 未知错误
  if (!(err instanceof CustomError)) {
    err = new CustomError(2000);
  }

  let body = {
    code: err.code,
    message: err.message,
    stack: err.stack
  };

  if (config.production && !req.query.__debug) {
    delete body.stack;
  }

  res.status(err.status);
  res.json(body);
};


// 响应gitlab-events
exports.respondGitlabEvents = function (req, res, next) {
  let token = req.headers['x-gitlab-token'];
  let body = req.body || {};

  if (token !== config.gitlabSecretToken) {
    next(new CustomError(1001, '无效x-gitlab-token'));
    return;
  }

  switch (body.object_kind) {
    case 'push':
      respondPushEvent(req, res, next);
      break;
    default:
      next();
  }
};

function respondPushEvent(req, res, next) {
  /**
   * 1. 确定“项目根目录”
   * 2. 在“项目根目录”执行`git pull`
   * 3. 重启应用
   */
  let body = req.body || {};

  // push不是对应的分支
  if (body.ref !== config.branch) {
    next(new CustomError(1001, `当前分支${config.branch}与push分支${body.ref}不对应`));
    return;
  }

  let cwd = process.cwd();
  let branch = config.production ? 'master' : 'test';
  // 拉取分支代码
  let cmd = `git pull origin ${branch}`;
  // 安装依赖&&重启应用
  cmd += ` && npm install && pm2 restart '${config.appName}'`;

  childProcess.exec(cmd, {
    cwd: cwd,
    encoding: 'utf8'
  }, function (err, stdout, stderr) {
    if (err) {
      next(err);
      return;
    }

    let message = stdout || stderr;

    res.json({message: message});
  });
}
