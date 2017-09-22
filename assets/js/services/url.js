module = angular.module("plunker.url", []);

module.service("url", function() {
  return window._plunker.url;
});