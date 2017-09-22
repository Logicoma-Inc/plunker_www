var module,
  slice = [].slice;

module = angular.module("plunker.plunks", ["plunker.url", "plunker.visitor", "plunker.instantiator", "plunker.api", "plunker.users"]);

module.run([
  "instantiator", "plunks", function(instantiator, plunks) {
    return instantiator.register("plunks", plunks.findOrCreate);
  }
]);

module.service("plunks", [
  "$http", "$rootScope", "$q", "url", "visitor", "instantiator", "api", function($http, $rootScope, $q, url, visitor, instantiator, api) {
    var $$feeds, $$findOrCreate, $$findOrCreateFeed, $$mapPlunks, $$plunks, Plunk, plunks;
    $$plunks = {};
    $$feeds = {};
    $$findOrCreate = function(json, options) {
      var plunk;
      if (json == null) {
        json = {};
      }
      if (options == null) {
        options = {};
      }
      if (json.id) {
        if (!$$plunks[json.id]) {
          $$plunks[json.id] = new Plunk(json);
        }
        plunk = $$plunks[json.id];
        angular.extend(plunk, json);
      } else {
        plunk = new Plunk(json);
      }
      if (json.user) {
        plunk.user = api.get("users").findOrCreate(json.user);
      }
      return plunk;
    };
    $$mapPlunks = function(jsonArray, options) {
      var i, json, len, results;
      if (options == null) {
        options = {
          upsert: true
        };
      }
      results = [];
      for (i = 0, len = jsonArray.length; i < len; i++) {
        json = jsonArray[i];
        json.$$refreshed_at = new Date();
        results.push($$findOrCreate(json, options));
      }
      return results;
    };
    $$findOrCreateFeed = function(defaults) {
      var id, plunk;
      if (angular.isString(defaults)) {
        defaults = {
          id: defaults
        };
      }
      id = defaults.id;
      plunk = $$findOrCreate(defaults);
      return $$feeds[id] || ($$feeds[id] = (function() {
        var addCreationEvent, feed;
        feed = [];
        addCreationEvent = function(parent) {
          if (plunk.parent) {
            feed.push({
              type: "fork",
              icon: "icon-share-alt",
              date: new Date(plunk.created_at),
              parent: plunk.parent,
              user: plunk.user
            });
          } else {
            feed.push({
              type: "create",
              icon: "icon-save",
              date: new Date(plunk.created_at),
              source: plunk.source,
              user: plunk.user
            });
          }
          plunk.children = plunks.query({
            url: url.api + "/plunks/" + plunk.id + "/forks"
          });
          return plunk.children.$$refreshing.then(function(children) {
            var child, i, len;
            for (i = 0, len = children.length; i < len; i++) {
              child = children[i];
              feed.push({
                type: "forked",
                icon: "icon-git-fork",
                date: child.created_at,
                child: child,
                user: child.user
              });
            }
            return null;
          });
        };
        if (plunk.$$refreshed_at) {
          addCreationEvent(plunk);
        } else if (plunk.$$refreshing) {
          plunk.$$refreshing.then(addCreationEvent);
        } else {
          plunk.refresh().then(addCreationEvent);
        }
        return feed;
      })());
    };
    Plunk = (function() {
      function Plunk(json) {
        var plunk, self;
        if (plunk = $$plunks[json.id]) {
          angular.extend(plunk, json);
          return plunk;
        }
        self = this;
        angular.copy(json, self);
        Object.defineProperty(self, "feed", {
          get: function() {
            return $$findOrCreateFeed(self);
          }
        });
        Object.defineProperty(self, "parent", {
          get: function() {
            if (self.fork_of) {
              return $$findOrCreate({
                id: self.fork_of
              });
            } else {
              return null;
            }
          }
        });
        if (!this.comments) {
          this.comments = [];
          this.comments.then = function() {
            var args, request;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            request = $http.get(url.api + "/plunks/" + self.id + "/comments").then(function(response) {
              var comment, i, len, ref;
              ref = response.data;
              for (i = 0, len = ref.length; i < len; i++) {
                comment = ref[i];
                self.comments.push(comment);
              }
              return self.comments;
            });
            return request.then.apply(request, args);
          };
        }
      }

      Plunk.prototype.isFrozen = function() {
        return !!this.id && !!this.frozen_at;
      };

      Plunk.prototype.isWritable = function() {
        return !this.id || !!this.token;
      };

      Plunk.prototype.isSaved = function() {
        return !!this.id;
      };

      Plunk.prototype.getReadme = function() {
        var file, filename, ref;
        ref = this.files;
        for (filename in ref) {
          file = ref[filename];
          if (filename.match(/^(?:readme|index|article)(?:\.?(?:md|markdown))$/i)) {
            return file.content;
          }
        }
      };

      Plunk.prototype.refresh = function(options) {
        var self;
        if (options == null) {
          options = {};
        }
        self = this;
        options.params || (options.params = {});
        options.params.sessid = visitor.session.id;
        if (options.cache == null) {
          options.cache = false;
        }
        return self.$$refreshing || (self.$$refreshing = $http.get(url.api + "/plunks/" + this.id, options).then(function(res) {
          angular.copy(res.data, self);
          self.$$refreshing = null;
          self.$$refreshed_at = new Date();
          return self;
        }, function(err) {
          self.$$refreshing = null;
          return $q.reject("Refresh failed");
        }));
      };

      Plunk.prototype.freeze = function(rel, options) {
        var self;
        if (rel == null) {
          rel = 0;
        }
        if (options == null) {
          options = {};
        }
        self = this;
        options.params || (options.params = {});
        options.params.sessid = visitor.session.id;
        if (rel) {
          options.params.v = this.history.length - 1 - rel;
        }
        if (options.cache == null) {
          options.cache = false;
        }
        return self.$$refreshing || (self.$$refreshing = $http.post(url.api + "/plunks/" + this.id + "/freeze", {}, options).then(function(res) {
          angular.copy(res.data, self);
          self.$$refreshing = null;
          self.$$refreshed_at = new Date();
          return self;
        }, function(err) {
          self.$$refreshing = null;
          return $q.reject("Freeze failed");
        }));
      };

      Plunk.prototype.unfreeze = function(options) {
        var self;
        if (options == null) {
          options = {};
        }
        self = this;
        options.params || (options.params = {});
        options.params.sessid = visitor.session.id;
        if (options.cache == null) {
          options.cache = false;
        }
        return self.$$refreshing || (self.$$refreshing = $http["delete"](url.api + "/plunks/" + this.id + "/freeze", options).then(function(res) {
          angular.copy(res.data, self);
          self.$$refreshing = null;
          self.$$refreshed_at = new Date();
          return self;
        }, function(err) {
          self.$$refreshing = null;
          return $q.reject("Freeze failed");
        }));
      };

      Plunk.prototype.star = function(starred, options) {
        var error, self, success;
        if (starred == null) {
          starred = !this.thumbed;
        }
        if (options == null) {
          options = {};
        }
        self = this;
        if (!visitor.logged_in) {
          throw new Error("Impossible to star a plunk when not logged in");
        }
        options.params || (options.params = {});
        options.params.sessid = visitor.session.id;
        if (options.cache == null) {
          options.cache = false;
        }
        success = function(res) {
          self.thumbs = res.data.thumbs;
          self.score = res.data.score;
          self.thumbed = starred;
          self.$$refreshing = null;
          self.$$refreshed_at = new Date();
          return self;
        };
        error = function(err) {
          self.$$refreshing = null;
          return $q.reject("Starring failed");
        };
        if (starred) {
          return self.$$refreshing || (self.$$refreshing = $http.post(url.api + "/plunks/" + this.id + "/thumb", {}, options).then(success, error));
        } else {
          return self.$$refreshing || (self.$$refreshing = $http["delete"](url.api + "/plunks/" + this.id + "/thumb", options).then(success, error));
        }
      };

      Plunk.prototype.remember = function(remembered, options) {
        var error, self, success;
        if (remembered == null) {
          remembered = !this.remembered;
        }
        if (options == null) {
          options = {};
        }
        self = this;
        if (!visitor.logged_in) {
          throw new Error("Impossible to remember a plunk when not logged in");
        }
        options.params || (options.params = {});
        options.params.sessid = visitor.session.id;
        if (options.cache == null) {
          options.cache = false;
        }
        success = function(res) {
          self.remembered = remembered;
          self.$$refreshing = null;
          self.$$refreshed_at = new Date();
          return self;
        };
        error = function(err) {
          self.$$refreshing = null;
          return $q.reject("Remembering failed");
        };
        if (remembered) {
          return self.$$refreshing || (self.$$refreshing = $http.post(url.api + "/plunks/" + this.id + "/remembered", {}, options).then(success, error));
        } else {
          return self.$$refreshing || (self.$$refreshing = $http["delete"](url.api + "/plunks/" + this.id + "/remembered", options).then(success, error));
        }
      };

      Plunk.prototype.save = function(delta, options) {
        var self;
        if (delta == null) {
          delta = {};
        }
        if (options == null) {
          options = {};
        }
        self = this;
        options.params || (options.params = {});
        options.params.sessid = visitor.session.id;
        if (options.cache == null) {
          options.cache = false;
        }
        return self.$$refreshing || (self.$$refreshing = $http.post(options.url || (url.api + "/plunks/" + (this.id || '')), delta, options).then(function(res) {
          angular.copy(res.data, self);
          self.$$refreshing = null;
          self.$$refreshed_at = new Date();
          return self;
        }, function(err) {
          self.$$refreshing = null;
          return $q.reject("Save failed");
        }));
      };

      Plunk.prototype.destroy = function(options) {
        var self;
        if (options == null) {
          options = {};
        }
        self = this;
        options.params || (options.params = {});
        options.params.sessid = visitor.session.id;
        if (options.cache == null) {
          options.cache = false;
        }
        return self.$$refreshing || (self.$$refreshing = $http["delete"](url.api + "/plunks/" + this.id, options).then(function(res) {
          delete $$plunks[self.id];
          angular.copy({}, self);
          return self;
        }, function(err) {
          self.$$refreshing = null;
          return $q.reject("Destroy failed");
        }));
      };

      return Plunk;

    })();
    return plunks = {
      findOrCreate: function(defaults) {
        if (defaults == null) {
          defaults = {};
        }
        return $$findOrCreate(defaults, {
          upsert: true
        });
      },
      fork: function(id, json, options) {
        var plunk, self;
        if (options == null) {
          options = {};
        }
        self = this;
        if (id.id) {
          id = id.id;
        }
        options.url || (options.url = url.api + "/plunks/" + id + "/forks");
        options.params || (options.params = {});
        options.params.sessid = visitor.session.id;
        options.params.api = 1;
        plunk = $$findOrCreate();
        return plunk.save(json, options).then(function(plunk) {
          return $$plunks[plunk.id] = plunk;
        });
      },
      query: function(options) {
        var base, links, results;
        if (options == null) {
          options = {};
        }
        results = options.results || [];
        links = options.links || {};
        options = angular.copy(options);
        if (options.cache == null) {
          options.cache = false;
        }
        options.params || (options.params = {});
        options.params.sessid = visitor.session.id;
        (base = options.params).pp || (base.pp = 12);
        results.url = options.url || (url.api + "/plunks");
        results.links = function(rel) {
          if (rel) {
            return links[rel] || "";
          } else {
            return links;
          }
        };
        results.pageTo = function(href) {
          results.url = href;
          return results.refresh();
        };
        (results.refresh = function() {
          return results.$$refreshing || (results.$$refreshing = $http.get(results.url, options).then(function(res) {
            var i, len, link, plunk, ref;
            angular.copy({}, links);
            if (link = res.headers("link")) {
              link.replace(/<([^>]+)>;\s*rel="(\w+)"/gi, function(match, href, rel) {
                return links[rel] = href;
              });
            }
            results.length = 0;
            ref = $$mapPlunks(res.data);
            for (i = 0, len = ref.length; i < len; i++) {
              plunk = ref[i];
              results.push(plunk);
            }
            results.$$refreshing = null;
            results.$$refreshed_at = new Date();
            return results;
          }, function(err) {
            results.$$refreshing = null;
            return $q.reject("Refresh failed");
          }));
        })();
        return results;
      }
    };
  }
]);