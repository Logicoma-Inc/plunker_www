var module;

module = angular.module("plunker.instantiator", []);

module.service("instantiator", [
  function() {
    var instantiators;
    instantiators = {};
    return {
      register: function(type, findOrCreateFn) {
        return instantiators[type] = findOrCreateFn;
      },
      findOrCreate: function(type, json) {
        var instantiator;
        if (json == null) {
          json = {};
        }
        if (instantiator = instantiators[type]) {
          return instantiator(json);
        } else {
          return json;
        }
      }
    };
  }
]);