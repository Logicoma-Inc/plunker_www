var module;

module = angular.module("plunker.catalogue", ["plunker.visitor", "plunker.url"]);

module.factory("catalogue", [
  "$http", "visitor", "url", function($http, visitor, url) {
    var Package, apiUrl, identityMap;
    apiUrl = url.api;
    identityMap = {};
    Package = (function() {
      function Package(data) {
        if (data == null) {
          data = {};
        }
        this.update(data);
      }

      Package.prototype.update = function(data) {
        if (data == null) {
          data = {};
        }
        angular.copy(data, this);
        return this;
      };

      Package.prototype.save = function(data, options) {
        var payload, pkg, request;
        if (data == null) {
          data = {};
        }
        if (options == null) {
          options = {};
        }
        pkg = this;
        if (!data.name) {
          throw new Error("Attempting to save a package without a primary key");
        }
        options.cache = false;
        options.params || (options.params = {});
        options.params.sessid = visitor.session.id;
        payload = {
          description: data.description,
          homepage: data.homepage,
          documentation: data.documentation
        };
        request = $http.post(apiUrl + "/catalogue/packages/" + pkg.name, payload, options).then(function(response) {
          pkg.update(response.data);
          delete pkg.then;
          delete pkg.$$v;
          return pkg;
        });
        pkg.then = request.then.bind(request);
        return pkg;
      };

      Package.prototype.addVersion = function(data, options) {
        var payload, pkg, request;
        if (data == null) {
          data = {};
        }
        if (options == null) {
          options = {};
        }
        pkg = this;
        if (!pkg.name) {
          throw new Error("Attempting to add a version without a primary key");
        }
        options.cache = false;
        options.params || (options.params = {});
        options.params.sessid = visitor.session.id;
        payload = {
          semver: data.semver,
          unstable: !!data.unstable
        };
        if (data.scripts.length) {
          payload.scripts = angular.copy(data.scripts);
        }
        if (data.styles.length) {
          payload.styles = angular.copy(data.styles);
        }
        if (data.dependencies.length) {
          payload.dependencies = angular.copy(data.dependencies);
        }
        request = $http.post(apiUrl + "/catalogue/packages/" + pkg.name + "/versions", payload, options).then(function(response) {
          pkg.update(response.data);
          delete pkg.then;
          delete pkg.$$v;
          return pkg;
        });
        pkg.then = request.then.bind(request);
        return pkg;
      };

      Package.prototype.updateVersion = function(data, options) {
        var payload, pkg, request;
        if (data == null) {
          data = {};
        }
        if (options == null) {
          options = {};
        }
        pkg = this;
        if (!pkg.name) {
          throw new Error("Attempting to add a version without a primary key");
        }
        if (!data.semver) {
          throw new Error("Attempting to update a version without a primary key");
        }
        options.cache = false;
        options.params || (options.params = {});
        options.params.sessid = visitor.session.id;
        payload = {
          unstable: !!data.unstable
        };
        if (data.scripts) {
          payload.scripts = angular.copy(data.scripts);
        }
        if (data.styles) {
          payload.styles = angular.copy(data.styles);
        }
        if (data.dependencies) {
          payload.dependencies = angular.copy(data.dependencies);
        }
        request = $http.post(apiUrl + "/catalogue/packages/" + pkg.name + "/versions/" + data.semver, payload, options).then(function(response) {
          pkg.update(response.data);
          delete pkg.then;
          delete pkg.$$v;
          return pkg;
        });
        pkg.then = request.then.bind(request);
        return pkg;
      };

      Package.prototype.destroyVersion = function(data, options) {
        var pkg, request;
        if (data == null) {
          data = {};
        }
        if (options == null) {
          options = {};
        }
        pkg = this;
        if (!pkg.name) {
          throw new Error("Attempting to destroy a version without a primary key");
        }
        if (!data.semver) {
          throw new Error("Attempting to destroy a version without a primary key");
        }
        options.cache = false;
        options.params || (options.params = {});
        options.params.sessid = visitor.session.id;
        request = $http["delete"](apiUrl + "/catalogue/packages/" + pkg.name + "/versions/" + data.semver, options).then(function(response) {
          pkg.update(response.data);
          delete pkg.then;
          delete pkg.$$v;
          return pkg;
        });
        pkg.then = request.then.bind(request);
        return pkg;
      };

      Package.prototype.bump = function(options) {
        var pkg, request;
        if (options == null) {
          options = {};
        }
        pkg = this;
        if (!pkg.name) {
          throw new Error("Attempting to bump a package without a primary key");
        }
        options.cache = false;
        options.params || (options.params = {});
        options.params.sessid = visitor.session.id;
        return request = $http.post(apiUrl + "/catalogue/packages/" + pkg.name + "/bump", {}, options).then(function(response) {
          return pkg.update(response.data);
        });
      };

      Package.prototype.destroy = function(options) {
        var pkg, request;
        if (options == null) {
          options = {};
        }
        pkg = this;
        if (!pkg.name) {
          throw new Error("Attempting to destroy a package without a primary key");
        }
        options.cache = false;
        options.params || (options.params = {});
        options.params.sessid = visitor.session.id;
        request = $http["delete"](apiUrl + "/catalogue/packages/" + pkg.name, options).then(function(response) {
          pkg.update({});
          delete pkg.then;
        });
        pkg.then = request.then.bind(request);
        return pkg;
      };

      Package.prototype.refresh = function(options) {
        var pkg, request;
        if (options == null) {
          options = {};
        }
        pkg = this;
        if (!pkg.name) {
          throw new Error("Attempting to refresh a package without a primary key");
        }
        options.cache = false;
        options.params || (options.params = {});
        options.params.sessid = visitor.session.id;
        request = $http.get(apiUrl + "/catalogue/packages/" + pkg.name, options).then(function(response) {
          pkg.update(response.data);
          delete pkg.then;
          return pkg;
        });
        pkg.then = request.then.bind(request);
        return pkg;
      };

      Package.prototype.getMatchingVersion = function(range) {
        var bestMatch, i, len, ref, version;
        if (range == null) {
          range = "*";
        }
        bestMatch = null;
        if (!this.versions) {
          return bestMatch;
        }
        ref = this.versions;
        for (i = 0, len = ref.length; i < len; i++) {
          version = ref[i];
          if (semver.satisfies(version.semver, range) && (!bestMatch || semver.gt(version.semver, bestMatch.semver))) {
            bestMatch = version;
          }
        }
        return bestMatch;
      };

      Package.prototype.getMatchingVersions = function(range) {
        var i, len, matches, ref, version;
        if (range == null) {
          range = "*";
        }
        matches = [];
        ref = this.versions;
        for (i = 0, len = ref.length; i < len; i++) {
          version = ref[i];
          if (semver.satisfies(version.semver, range)) {
            matches.push(version);
          }
        }
        return matches;
      };

      return Package;

    })();
    return {
      findOne: function(data) {
        if (data == null) {
          data = {};
        }
        return identityMap[data.name] || this.fetch(data);
      },
      fetch: function(data, options) {
        var request;
        if (data == null) {
          data = {};
        }
        if (options == null) {
          options = {};
        }
        if (!data.name) {
          throw new Error("Attempting to refresh a package without a primary key");
        }
        options.cache = false;
        options.params || (options.params = {});
        options.params.sessid = visitor.session.id;
        return (request = $http.get(apiUrl + "/catalogue/packages/" + data.name, options).then(function(response) {
          var name;
          return (identityMap[name = data.name] || (identityMap[name] = new Package())).update(response.data);
        }));
      },
      search: function(query) {
        return this.findAll({
          params: {
            query: query
          }
        });
      },
      findAll: function(options) {
        var links, packages;
        if (options == null) {
          options = {};
        }
        options.cache = false;
        options.url || (options.url = apiUrl + "/catalogue/packages");
        options.params || (options.params = {});
        options.params.sessid = visitor.session.id;
        links = {};
        packages = [];
        packages.loading = true;
        packages.links = function(rel) {
          if (rel) {
            return links[rel] || "";
          } else {
            return links;
          }
        };
        packages.refresh = function(url) {
          var request;
          if (url == null) {
            url = options.url;
          }
          request = $http.get(url, options).then(function(response) {
            var i, json, len, link, ref;
            angular.copy({}, links);
            if (link == response.headers("link")) {
              link.replace(/<([^>]+)>;\s*rel="(\w+)"/gi, function(match, href, rel) {
                return (links[rel] = href);
              });
            }
            packages.length = 0;
            ref = response.data;
            for (i = 0, len = ref.length; i < len; i++) {
              json = ref[i];
              packages.push(new Package(json));
            }
            delete packages.loading;
            delete packages.then;
            return packages;
          });
          packages.then = request.then.bind(request);
          return packages;
        };
        packages.then = function() {
          return packages.refresh().then;
        };
        return packages;
      },
      create: function(data, options) {
        var request;
        if (options == null) {
          options = {};
        }
        if (options.cache == null) {
          options.cache = true;
        }
        options.url || (options.url = apiUrl + "/catalogue/packages");
        options.params || (options.params = {});
        options.params.sessid = visitor.session.id;
        return request = $http.post(options.url, data, options).then(function(response) {
          return new Package(response.data);
        }, function(err) {
          return new Error("Failed to create package" + err.message);
        });
      }
    };
  }
]);