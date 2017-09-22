var module;

module = angular.module("plunker.stream", ["firebase"]);

module.service("stream", [
  function() {
    var Stream;
    return new (Stream = (function() {
      function Stream() {}

      Stream.prototype.connect = function(streamId) {};

      return Stream;

    })());
  }
]);