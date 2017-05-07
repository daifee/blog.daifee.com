

exports.output = function (promise, res, next) {
  // accepts content-type
  res.set('Content-Type', 'application/json');
  promise
  .then(function (resource) {
    res.json(resource);
  })
  .catch(function (err) {
    next(err);
  });
};
