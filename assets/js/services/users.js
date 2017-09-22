module = angular.module("plunker.users", ["plunker.url", "plunker.visitor", "plunker.api", "plunker.plunks"]);

module.config([
  "apiProvider", function(apiProvider) {
    return apiProvider.define("users", {
      basePath: "/users",
      primaryKey: "login",
      api: {
        find: {
          isArray: true
        }
      },
      initialize: [
        "plunks", "url", function(plunks, url) {
          this.getPlunks = function(options) {
            if (options == null) {
              options = {};
            }
            options.url || (options.url = url.api + "/users/" + this.login + "/plunks");
            return plunks.query(options);
          };
          this.getTaggedPlunks = function(tag, options) {
            if (options == null) {
              options = {};
            }
            options.url || (options.url = url.api + "/users/" + this.login + "/plunks/tagged/" + tag);
            return plunks.query(options);
          };
          return this.getFavorites = function(options) {
            if (options == null) {
              options = {};
            }
            options.url || (options.url = url.api + "/users/" + this.login + "/thumbed");
            return plunks.query(options);
          };
        }
      ]
    });
  }
]);

module.service("users", [
  "$http", "api", "plunks", "url", function($http, api, plunks, url) {
    var users;
    return users = api.get("users");
  }
]);