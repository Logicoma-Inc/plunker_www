var module;

module = angular.module("plunker.api", []);

module.provider("api", function() {
  var $$apis, $$definitions, service;
  $$definitions = {};
  $$apis = {};
  service = null;
  return {
    define: function(name, apiOptions) {
      if (apiOptions == null) {
        apiOptions = {};
      }
      return $$definitions[name] = apiOptions;
    },
    $get: [
      "$http", "$q", "$injector", "url", "visitor", function($http, $q, $injector, url, visitor) {
        return service || (service = (function() {
          var apiOptions, fn, name;
          fn = function(name, apiOptions) {
            return $$apis[name] || ($$apis[name] = (function() {
              var Record, api, baseUrl, identityMap, method, methodDef, parser, primaryKey, ref;
              identityMap = this.identityMap = {};
              baseUrl = "" + url.api + (apiOptions.basePath || '/');
              primaryKey = apiOptions.primaryKey || "id";
              parser = apiOptions.parser || function(json) {
                return json;
              };
              Record = (function() {
                var methodBody, methodName, ref;

                ref = apiOptions.methods;
                for (methodName in ref) {
                  methodBody = ref[methodName];
                  Record.prototype[methodName] = methodBody;
                }

                function Record(json, constructorOptions) {
                  var id, inst;
                  if (constructorOptions == null) {
                    constructorOptions = {};
                  }
                  id = json[primaryKey];
                  if (inst = identityMap[id]) {
                    angular.extend(inst, json);
                    return inst;
                  }
                  angular.copy(parser(json, constructorOptions), this);
                  if (apiOptions.initialize) {
                    $injector.invoke(apiOptions.initialize, this);
                  }
                }

                Record.prototype.getUrl = function() {
                  var id;
                  if (this.url) {
                    return this.url;
                  } else if (id = this[primaryKey]) {
                    return baseUrl + "/" + id;
                  }
                };

                Record.prototype.refresh = function(refreshOptions) {
                  var record;
                  if (refreshOptions == null) {
                    refreshOptions = {};
                  }
                  record = this;
                  refreshOptions.url || (refreshOptions.url = record.getUrl());
                  refreshOptions.cache = false;
                  refreshOptions.params || (refreshOptions.params = {});
                  refreshOptions.params.sessid = visitor.session.id;
                  if (!refreshOptions.url) {
                    return $q.reject("No url property");
                  }
                  return record.$$refreshing = $http.get(refreshOptions.url, refreshOptions).then(function(res) {
                    angular.extend(record, parser(res.data, res));
                    record.$$refreshing = null;
                    record.$$refreshed_at = Date.now();
                    return record;
                  });
                };

                return Record;

              })();
              api = {
                findOrCreate: function(json, instOptions) {
                  var id, inst;
                  if (json == null) {
                    json = {};
                  }
                  if (instOptions == null) {
                    instOptions = {};
                  }
                  id = json[primaryKey];
                  if (id) {
                    if (!(inst = identityMap[id])) {
                      inst = identityMap[id] = new Record(json, instOptions);
                    } else {
                      angular.extend(inst, json);
                    }
                  } else {
                    inst = new Record(json, instOptions);
                  }
                  return inst;
                }
              };
              ref = apiOptions.api;
              for (method in ref) {
                methodDef = ref[method];
                if (methodDef.isArray) {
                  api[method] = function(methodOptions) {
                    var results;
                    if (methodOptions == null) {
                      methodOptions = {};
                    }
                    results = [];
                    methodOptions.params || (methodOptions.params = {});
                    methodOptions.params.sessid = visitor.session.id;
                    methodOptions.url || (methodOptions.url = "" + baseUrl + (methodDef.path || ''));
                    methodOptions.cache = true;
                    results.$$refreshing = $http.get(methodOptions.url, methodOptions).then(function(res) {
                      var i, json, len, ref1;
                      ref1 = res.data;
                      for (i = 0, len = ref1.length; i < len; i++) {
                        json = ref1[i];
                        results.push(api.findOrCreate(parser(json, res)));
                      }
                      results.$$refreshing = null;
                      results.$$refreshed_at = Date.now();
                      return results;
                    });
                    return results;
                  };
                }
              }
              return api;
            })());
          };
          for (name in $$definitions) {
            apiOptions = $$definitions[name];
            fn(name, apiOptions);
          }
          return {
            get: function(name) {
              return $$apis[name];
            }
          };
        })());
      }
    ]
  };
});