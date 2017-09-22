var module;

module = angular.module("plunker.taglist", []);

module.directive("plunkerTaglist", [
  function() {
    return {
      restrict: "E",
      replace: true,
      scope: {
        tags: "="
      },
      template: "<ul class=\"plunker-taglist\">\n  <li ng-repeat=\"tag in tags\">\n    <a ng-href=\"/tags/{{tag}}\">{{tag}}</a>\n  </li>\n</ul>"
    };
  }
]);