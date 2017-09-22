var NGDOC_BASE_URL, fiddleRegex, githubRegex, manifestRegex, module, ngdocRegex, plunkerRegex, templateRegex;

NGDOC_BASE_URL = "https://code.angularjs.org/{{VERSION}}/docs/examples/";

plunkerRegex = /^\s*(?:plunk:)?([-\._a-zA-Z0-9]+)\s*$/i;

templateRegex = /^\s*tpl:([-\._a-zA-Z0-9]+)\s*$/i;

fiddleRegex = /^\s*fiddle:([-\._a-zA-Z0-9]+)(?:@([0-9]*))?\s*$/i;

githubRegex = /^\s*(?:(?:https?\:\/\/)?gist\.github\.com\/|gist\:)([0-9]+|[0-9a-z]+)(?:#.+)?\s*$/i;

ngdocRegex = /^\s*ngdoc:([^\/@]+)(?:@([^\/]+))?\s*$/i;

manifestRegex = /^\s*manifest:(.+)\s*$/i;

module = angular.module("plunker.importer", ["plunker.plunks", "plunker.updater", "plunker.notifier"]);

module.service("importer", [
  "$q", "$http", "plunks", "updater", "notifier", function($q, $http, plunks, updater, notifier) {
    return {
      "import": function(source) {
        var baseUrl, deferred, exampleId, exampleVersion, fiddleRef, fiddleUrl, manifestRequest, manifestUrl, matches, request;
        deferred = $q.defer();
        if (matches = source.match(templateRegex)) {
          plunks.findOrCreate({
            id: matches[1]
          }).refresh().then(function(plunk) {
            var file, filename, files, finalize, index, markup, ref;
            files = {};
            ref = plunk.files;
            for (filename in ref) {
              file = ref[filename];
              files[filename] = {
                filename: filename,
                content: file.content
              };
            }
            finalize = function() {
              return deferred.resolve({
                description: plunk.description,
                tags: angular.copy(plunk.tags),
                files: files,
                source: source
              });
            };
            if (index = files['index.html']) {
              markup = updater.parse(index.content);
              return markup.updateAll().then(function() {
                index.content = markup.toHtml();
                return finalize();
              });
            } else {
              return finalize();
            }
          }, function(error) {
            return deferred.reject("Plunk not found");
          });
        } else if (matches = source.match(plunkerRegex)) {
          plunks.findOrCreate({
            id: matches[1]
          }).refresh().then(function(plunk) {
            var file, filename, files, ref;
            files = {};
            ref = plunk.files;
            for (filename in ref) {
              file = ref[filename];
              files[filename] = {
                filename: filename,
                content: file.content
              };
            }
            return deferred.resolve({
              description: plunk.description,
              tags: angular.copy(plunk.tags),
              files: files,
              plunk: angular.copy(plunk)
            });
          }, function(error) {
            return deferred.reject("Plunk not found");
          });
        } else if (matches = source.match(githubRegex)) {
          request = $http.jsonp("https://api.github.com/gists/" + matches[1] + "?callback=JSON_CALLBACK");
          request.then(function(response) {
            var e, file, filename, gist, index, json, manifest, markup, ref;
            if (response.data.meta.status >= 400) {
              return deferred.reject("Gist not found");
            } else {
              gist = response.data.data;
              json = {
                'private': true
              };
              if (manifest = gist.files["plunker.json"]) {
                try {
                  angular.extend(json, angular.fromJson(manifest.content));
                } catch (_error) {
                  e = _error;
                  console.error("Unable to parse manifest file:", e);
                }
              }
              angular.extend(json, {
                source: {
                  type: "gist",
                  url: gist.html_url,
                  title: "gist:" + gist.id
                },
                files: {}
              });
              if (gist.description) {
                json.description = json.source.description = gist.description;
              }
              ref = gist.files;
              for (filename in ref) {
                file = ref[filename];
                if (filename !== "plunker.json") {
                  json.files[filename] = {
                    filename: filename,
                    content: file.content
                  };
                }
              }
              if (index = json.files['index.html']) {
                markup = updater.parse(index.content);
                return markup.updateAll().then(function() {
                  index.content = markup.toHtml();
                  return deferred.resolve(json);
                }, function(err) {
                  notifier.error("Auto-update failed", err.message);
                  return deferred.resolve(json);
                });
              } else {
                return deferred.resolve(json);
              }
            }
          });
        } else if (matches = source.match(ngdocRegex)) {
          exampleId = matches[1];
          exampleVersion = matches[2];
          manifestUrl = NGDOC_BASE_URL.replace("{{VERSION}}", exampleVersion || "") + exampleId + "/manifest.json";
          manifestRequest = $http.get(manifestUrl).then(function(manifestResponse) {
            var filename, fn, i, json, len, promises, ref;
            if (manifestResponse.status >= 400) {
              return deferred.reject("Unable to load the specified example's manifest");
            } else {
              promises = [];
              json = {
                description: "Angular documentation example: " + manifestResponse.data.name,
                tags: ["angularjs"],
                files: {}
              };
              ref = manifestResponse.data.files;
              fn = function(filename) {
                var fileUrl;
                fileUrl = NGDOC_BASE_URL.replace("{{VERSION}}", exampleVersion || "") + exampleId + "/" + filename;
                if (filename === "index-production.html") {
                  filename = "index.html";
                }
                return promises.push($http.get(fileUrl).then(function(fileResponse) {
                  if (fileResponse.status >= 400) {
                    return $q.reject("Unable to load the example's file: " + filename);
                  } else {
                    return json.files[filename] = {
                      filename: filename,
                      content: fileResponse.data
                    };
                  }
                }));
              };
              for (i = 0, len = ref.length; i < len; i++) {
                filename = ref[i];
                fn(filename);
              }
              return $q.all(promises).then(function() {
                return deferred.resolve(json);
              });
            }
          }, function(err) {
            return deferred.reject("Unable to load the specified example's manifest");
          });
        } else if (matches = source.match(manifestRegex)) {
          console.log("matched manifest", matches);
          manifestUrl = matches[1];
          baseUrl = manifestUrl.split("/").pop();
          baseUrl = baseUrl.join("/");
          manifestRequest = $http.get(manifestUrl).then(function(manifestResponse) {
            var filename, fn, i, json, len, promises, ref;
            if (manifestResponse.status >= 400) {
              return deferred.reject("Unable to load the specified example's manifest");
            } else {
              promises = [];
              json = {
                description: manifestResponse.data.name || manifestUrl,
                tags: manifestResponse.data.tags || [],
                files: {}
              };
              ref = manifestResponse.data.files;
              fn = function(filename) {
                var fileUrl;
                fileUrl = baseUrl + "/" + filename;
                if (filename === "index-production.html") {
                  filename = "index.html";
                }
                return promises.push($http.get(fileUrl).then(function(fileResponse) {
                  if (fileResponse.status >= 400) {
                    return $q.reject("Unable to load the example's file: " + filename);
                  } else {
                    return json.files[filename] = {
                      filename: filename,
                      content: fileResponse.data
                    };
                  }
                }));
              };
              for (i = 0, len = ref.length; i < len; i++) {
                filename = ref[i];
                fn(filename);
              }
              return $q.all(promises).then(function() {
                return deferred.resolve(json);
              });
            }
          }, function(err) {
            return deferred.reject("Unable to load the specified example's manifest");
          });
        } else if (matches = source.match(fiddleRegex)) {
          fiddleRef = matches[1] + (matches[2] ? "/" + matches[2] : "");
          fiddleUrl = "http://jsfiddle.net/" + fiddleRef + "/show";
          request = $http.jsonp("https://query.yahooapis.com/v1/public/yql?q=SELECT * FROM html WHERE url=\"" + fiddleUrl + "\" AND xpath=\"/html\" and compat=\"html5\"&format=xml&callback=JSON_CALLBACK");
          request.then(function(response) {
            var $script, $style, doc, fiddleHtml, index, json, markup, script, serializer, style;
            if (response.status >= 400) {
              return deferred.reject("Failed to fetch fiddle");
            } else {
              if (!(fiddleHtml = response.data.results[0])) {
                return deferred.reject("Failed to fetch fiddle");
              }
              fiddleHtml = fiddleHtml.replace(/<script([^>]*)\/>/ig, "<script$1></script>");
              fiddleHtml = fiddleHtml.replace(/(?:\/\/)?<!\[CDATA\[/g, "").replace(/(?:\/\/)?\]\]>/g, "").replace(/(?:\/\/)?\]\]>/g, "");
              doc = window.document.implementation.createHTMLDocument("");
              doc.open();
              doc.write(fiddleHtml);
              doc.innerHTML = fiddleHtml;
              json = {
                'private': true
              };
              angular.extend(json, {
                source: {
                  type: "fiddle",
                  url: fiddleUrl,
                  title: $("title", doc).text()
                },
                files: {}
              });
              json.description = $("title", doc).text();
              $("link[href]", doc).each(function() {
                var href;
                href = $(this).attr("href");
                if (href.charAt(0) === "/" && href.charAt(1) !== "/") {
                  return $(this).attr("href", "http://jsfiddle.net" + href);
                }
              });
              $("script[src]", doc).each(function() {
                var href;
                href = $(this).attr("src");
                if (href.charAt(0) === "/" && href.charAt(1) !== "/") {
                  return $(this).attr("src", "http://jsfiddle.net" + href);
                }
              });
              if (($script = $("head script:not([src])", doc)).length) {
                if (script = jQuery.trim($script.text())) {
                  json.files["script.js"] = {
                    filename: "script.js",
                    content: script
                  };
                  $script.text("").attr("src", "script.js");
                } else {
                  $script.remove();
                }
              }
              if (($style = $("head style", doc)).length) {
                if (style = jQuery.trim($style.text())) {
                  json.files["style.css"] = {
                    filename: "style.css",
                    content: style
                  };
                  $style.replaceWith('<link rel="stylesheet" href="style.css">');
                } else {
                  $style.remove();
                }
              }
              serializer = new XMLSerializer();
              json.files["index.html"] = index = {
                filename: "index.html",
                content: dominatrix.domToHtml(doc)
              };
              markup = updater.parse(index.content);
              return markup.updateAll().then(function() {
                index.content = markup.toHtml();
                return deferred.resolve(json);
              }, function(err) {
                notifier.error("Auto-update failed", err.message);
                return deferred.resolve(json);
              });
            }
          });
        } else {
          return $q.reject("Not a recognized source");
        }
        return deferred.promise;
      }
    };
  }
]);