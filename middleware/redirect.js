module.exports.middleware = function(options) {
  if (options == null) {
    options = {};
  }
  return function(req, res, next) {
    if (!(options.from && options.to)) {
      return next();
    }
    if (req.get('host') === options.from) {
      return res.redirect("https://" + options.to + req.url);
    } else {
      return next();
    }
  };
};
