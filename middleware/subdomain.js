var embedRe, host, hostEsc, nconf, pathRe;

nconf = require("nconf");

host = nconf.get("host");

hostEsc = host.replace(/[-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

embedRe = new RegExp("^embed\." + hostEsc + "$");

pathRe = /^\/embed\//;

module.exports.middleware = function(config) {
  if (config == null) {
    config = {};
  }
  return function(req, res, next) {
    if (embedRe.test(req.headers.host) && !pathRe.test(req.url)) {
      req.url = "/embed" + req.url;
    }
    return next();
  };
};
