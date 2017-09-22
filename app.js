var JSONStream, Morph, addSession, apiUrl, app, assetOptions, assets, authom, bodyParser, compression, cookieParser, errorHandler, es, express, expstate, github, hbs, highlighter, jade, less, localsMiddleware, maybeLoadPlunk, modelist, morgan, nconf, path, pkginfo, request, runUrl, secureFilters, serveStatic, staticOptions, theme, wwwUrl, xmlbuilder;

less = require("less");
jade = require("jade");
express = require("express");
expstate = require("express-state");
assets = require("connect-assets");
nconf = require("nconf");
authom = require("authom");
request = require("request");
compression = require("compression");
serveStatic = require("serve-static");
bodyParser = require("body-parser");
cookieParser = require("cookie-parser");
morgan = require("morgan");
errorHandler = require("errorhandler");
path = require("path");
xmlbuilder = require("xmlbuilder");
es = require("event-stream");
hbs = require("hbs");
JSONStream = require("JSONStream");
pkginfo = require("./package.json");
require("./configure");
app = module.exports = express();

expstate.extend(app);

github = authom.createServer({
  service: "github",
  id: nconf.get("oauth:github:id"),
  secret: nconf.get("oauth:github:secret"),
  scope: ["gist"]
});

staticOptions = {
  maxAge: 1000 * 60 * 60 * 24 * 7
};

assetOptions = {
  paths: [__dirname + "/assets/js", __dirname + "/assets/css", __dirname + "/assets/vendor"],
  buildDir: "build",
  buildFilenamer: function(filename) {
    var base, dir, ext;
    dir = path.dirname(filename);
    ext = path.extname(filename);
    base = path.basename(filename, ext);
    return path.join(dir, base + "-" + pkginfo.version + ext);
  },
  helperContext: app.locals
};

apiUrl = nconf.get("url:api");

runUrl = nconf.get("url:run");

wwwUrl = nconf.get("url:www");

app.set("views", __dirname + "/views");

app.set("view engine", "jade");

app.set("view options", {
  layout: false
});

app.engine("html", hbs.__express);

app.use(require("./middleware/redirect").middleware(nconf.get("redirect")));

app.use(require("./middleware/vary").middleware());

app.use(serveStatic(__dirname + "/build", staticOptions));

app.use(serveStatic(__dirname + "/assets", staticOptions));

app.use("/css/font", serveStatic(__dirname + "/assets/vendor/Font-Awesome-More/font/", staticOptions));

if (nconf.get("NODE_ENV") === "production") {
  console.log("Starting Plunker in: PRODUCTION");
  app.locals.js = function(route) {
    return "<script src=\"/js/" + route + "-" + pkginfo.version + ".js\"></script>";
  };
  app.locals.css = function(route) {
    return "<link rel=\"stylesheet\" href=\"/css/" + route + "-" + pkginfo.version + ".css\" />";
  };
} else {
  console.log("Starting Plunker in: DEVELOPMENT");
  app.use(assets(assetOptions));
}

app.use(cookieParser());

app.use(bodyParser.urlencoded({
  limit: "2mb",
  extended: true
}));

app.use(bodyParser.json({
  limit: "2mb"
}));

app.expose(nconf.get("url"), "_plunker.url");

app.expose(pkginfo, "_plunker.package");

app.expose(null, "_plunker.bootstrap");

app.use(function(req, res, next) {
  res.locals.url = nconf.get("url");
  return next();
});

app.use(require("./middleware/subdomain").middleware());

addSession = require("./middleware/session").middleware();

maybeLoadPlunk = require('./middleware/maybeLoadPlunk').middleware({
  apiUrl: apiUrl
});

app.get("/partials/:partial", function(req, res, next) {
  return res.render("partials/" + req.params.partial);
});

app.get("/edit/:plunkId", addSession, maybeLoadPlunk, function(req, res, next) {
  res.locals.plunk = req.plunk;
  return res.render("editor");
});

app.get("/edit/*", addSession, function(req, res, next) {
  return res.render("editor");
});

app.all("/edit/", addSession, function(req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "OPTIONS,GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Authorization, User-Agent, Referer, X-Requested-With, Proxy-Authorization, Proxy-Connection, Accept-Language, Accept-Encoding, Accept-Charset, Connection, Content-Length, Host, Origin, Pragma, Accept-Charset, Cache-Control, Accept, Content-Type");
  res.header("Access-Control-Expose-Headers", "Link");
  res.header("Access-Control-Max-Age", "60");
  if ("OPTIONS" === req.method) {
    return res.send(200);
  } else {
    return next();
  }
});

app.post("/edit/:plunkId?", addSession, maybeLoadPlunk, function(req, res, next) {
  var bootstrap, file, filename, ref;
  res.header("X-XSS-Protection", 0);
  bootstrap = {
    description: req.body.description || (req.plunk ? req.plunk.description : ""),
    tags: req.body.tags || (req.plunk ? req.plunk.tags : []),
    files: {},
    'private': (req.body.private || (req.plunk ? req.plunk.private : true)) !== "false"
  };
  if (req.body.files) {
    ref = req.body.files;
    for (filename in ref) {
      file = ref[filename];
      bootstrap.files[filename] = {
        filename: filename,
        content: typeof file === "string" ? file : file.content || ""
      };
    }
  }
  res.expose(bootstrap, "_plunker.bootstrap");
  return res.render("editor");
});

app.all("/edit", addSession, function(req, res, next) {
  return res.redirect("/edit/", 302);
});

app.get("/auth/:service", addSession, function(req, res, next) {
  req.headers.host = nconf.get("host");
  return authom.app.apply(authom, arguments);
});

authom.on("auth", function(req, res, auth) {
  res.expose(auth, "_plunker.auth");
  return res.render("auth/success");
});

authom.on("error", function(req, res, auth) {
  console.log("Auth error", auth);
  res.expose(auth, "_plunker.auth");
  res.status(403);
  return res.render("auth/error");
});

localsMiddleware = function(req, res, next) {
  res.locals.timestamp = "";
  res.locals.suffix = "-min";
  if (process.env.NODE_ENV === "development") {
    res.locals.timestamp = Date.now();
    res.locals.suffix = "";
  }
  return next();
};

app.get("/sitemap.xml", function(req, res) {
  var complete, finalize, outstanding, plunks, urlset;
  outstanding = 0;
  urlset = xmlbuilder.create("urlset", {
    version: "1.0",
    encoding: "UTF-8"
  });
  urlset.attribute("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9");
  finalize = function() {
    res.set('Content-Type', 'application/xml');
    return res.send(urlset.end());
  };
  complete = function() {
    if (!(--outstanding > 0)) {
      return finalize();
    }
  };
  outstanding++;
  plunks = request(apiUrl + "/plunks?pp=40000").pipe(JSONStream.parse([true])).pipe(es.mapSync(function(plunk) {
    var url;
    url = urlset.ele("url");
    url.ele("loc").text(wwwUrl + "/" + plunk.id).up();
    url.ele("lastmod").text(plunk.updated_at).up();
    url.ele("changefreq").text("daily").up();
    return url.up();
  }));
  return plunks.on("end", complete);
});

app.get("/catalogue", addSession, function(req, res) {
  return res.render("packages");
});

app.get("/catalogue/*", addSession, function(req, res) {
  return res.render("packages");
});

require("amd-loader");

secureFilters = require("secure-filters");

Morph = require('morph');

modelist = require("ace/lib/ace/ext/modelist");

highlighter = require("ace/lib/ace/ext/static_highlight");

theme = require("ace/lib/ace/theme/textmate");

hbs.registerHelper("jsObj", function(obj) {
  return new hbs.SafeString(secureFilters.jsObj(obj));
});

hbs.registerHelper("toSnake", function(obj) {
  return Morph.toSnake(obj);
});

hbs.registerHelper("syntaxHilightCode", function() {
  var Mode, rendered, syntaxMode;
  syntaxMode = modelist.getModeForPath(this.filename);
  syntaxMode = syntaxMode ? syntaxMode.mode : 'ace/mode/text';
  Mode = require('ace/lib/' + syntaxMode).Mode;
  rendered = highlighter.renderSync(this.content, new Mode(), theme);
  return new hbs.SafeString(rendered.html);
});

app.get("/embed/:plunkId*", localsMiddleware, maybeLoadPlunk, function(req, res) {
  if (!req.plunk) {
    return res.send(404);
  } else {
    res.locals.plunk = req.plunk;
    res.set('etag', req.plunk.updated_at);
    res.set('last-modified', req.plunk.updated_at);
    res.set('cache-control', 'public, max-age=' + (60 * 60));
    return res.render("embed.html");
  }
});

app.get("/plunks", addSession, function(req, res) {
  return res.render("landing");
});

app.get("/plunks/trending", addSession, function(req, res) {
  return res.render("landing");
});

app.get("/plunks/popular", addSession, function(req, res) {
  return res.render("landing");
});

app.get("/plunks/recent", addSession, function(req, res) {
  return res.render("landing");
});

app.get("/plunks/views", addSession, function(req, res) {
  return res.render("landing");
});

app.get("/users", addSession, function(req, res) {
  return res.render("landing");
});

app.get("/users/:username", addSession, function(req, res) {
  return res.render("landing");
});

app.get("/group", addSession, function(req, res) {
  return res.render("landing");
});

app.get("/tags", addSession, function(req, res) {
  return res.render("landing");
});

app.get("/tags/:tagname", addSession, function(req, res) {
  return res.render("landing");
});

app.get("/*", addSession, function(req, res) {
  return res.render("landing");
});

app.use(errorHandler());
