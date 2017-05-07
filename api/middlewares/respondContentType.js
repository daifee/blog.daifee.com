

module.exports = function (req, res, next) {
  let type = req.accepts(['json', 'html', 'text']);
  let contentType;

  switch (type) {
    case 'html':
      contentType = 'text/html';
      break;
    case 'text':
      contentType = 'text/plain';
      break;
    default:
      contentType = 'application/json';
  }

  res.set('Content-Type', contentType);

  next();
};
