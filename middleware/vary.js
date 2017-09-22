module.exports.middleware = function(options) {
  if (options == null) {
    options = {};
  }
  return function(req, res, next) {
    res.set("Vary", "Accept-Encoding, Cookie");
    return next();
  };
};
