var nconf, request;

nconf = require("nconf");

request = require("request");

module.exports.middleware = function(options) {
  var apiUrl;
  if (options == null) {
    options = {};
  }
  apiUrl = nconf.get("url:api");
  return function(req, res, next) {
    var createSession, fetchSession, finalize, sessid;
    fetchSession = function(sessid) {
      if (!sessid) {
        return createSession();
      }
      return request({
        method: "GET",
        url: "https:" + apiUrl + "/sessions/" + sessid,
        json: true
      }, function(err, response, body) {
        if (err || response.statusCode >= 400) {
          return createSession();
        } else {
          return finalize(body);
        }
      });
    };
    createSession = function() {
      return request({
        method: "POST",
        url: "https:" + apiUrl + "/sessions",
        body: {},
        json: true
      }, function(err, response, body) {
        if (err || response.statusCode >= 400) {
          console.error("[ERR] Failed to create session: " + (JSON.stringify(err || body)));
          return finalize({});
        } else {
          return finalize(body);
        }
      });
    };
    finalize = function(session) {
      res.expose(session, "_plunker.session");
      return next();
    };
    if (sessid = req.cookies.plnk_session) {
      return fetchSession(sessid);
    } else {
      return createSession();
    }
  };
};
