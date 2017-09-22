var module;

module = angular.module("plunker.activity", []);

module.value("activity", (function() {
  var $$emit, $$guard, $$register, Client, Server;
  $$emit = function(arr, type, event) {
    var fn, i, len, results;
    if (arr) {
      results = [];
      for (i = 0, len = arr.length; i < len; i++) {
        fn = arr[i];
        results.push(fn.call(this, type, event));
      }
      return results;
    }
  };
  $$register = function(arr, handler) {
    arr.push(handler);
    return function() {
      var idx;
      if (0 <= (idx = arr.indexOf(handler))) {
        return arr.splice(idx, 1);
      }
    };
  };
  $$guard = false;
  Client = (function() {
    function Client(server, name1) {
      this.server = server;
      this.name = name1;
      this.watchers = [];
      this.handlers = [];
    }

    Client.prototype.record = function(type, event) {
      if (!$$guard) {
        return this.server.emitEvent(this, type, event);
      }
    };

    Client.prototype.playback = function(type, event) {
      $$guard = true;
      this.server.emitAction(this, type, event);
      return $$guard = false;
    };

    Client.prototype.watch = function(watcher) {
      return $$register(this.watchers, watcher);
    };

    Client.prototype.handle = function(handler) {
      return $$register(this.handlers, handler);
    };

    Client.prototype.watchEvent = function(eventType, handler) {
      return this.watch(function(type, event) {
        if (type === eventType) {
          return handler(type, event);
        }
      });
    };

    Client.prototype.handleEvent = function(eventType, handler) {
      return this.handle(function(type, event) {
        if (type === eventType) {
          return handler(type, event);
        }
      });
    };

    return Client;

  })();
  return new (Server = (function() {
    function Server() {
      this.clients = {};
    }

    Server.prototype.client = function(name) {
      var base;
      return (base = this.clients)[name] || (base[name] = new Client(this, name));
    };

    Server.prototype.emitAction = function(emitter, type, event) {
      var client, name, ref, results;
      ref = this.clients;
      results = [];
      for (name in ref) {
        client = ref[name];
        if (name !== emitter.name) {
          results.push($$emit(client.handlers, type, event));
        }
      }
      return results;
    };

    Server.prototype.emitEvent = function(emitter, type, event) {
      var client, name, ref, results;
      ref = this.clients;
      results = [];
      for (name in ref) {
        client = ref[name];
        if (name !== emitter.name) {
          results.push($$emit(client.watchers, type, event));
        }
      }
      return results;
    };

    return Server;

  })());
})());