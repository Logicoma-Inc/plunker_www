module.exports.middleware = function(options) {
  if (options == null) {
    options = {};
  }
  return function(req, res, next) {
    var base, key, ref, value;
    res.expose || (res.expose = {});
    for (key in options) {
      value = options[key];
      (base = res.expose)[key] || (base[key] = value);
    }
    ref = res.expose;
    for (key in ref) {
      value = ref[key];
      res.locals[key] = value;
    }
    return next();
  };
};
