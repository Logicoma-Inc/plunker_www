var module;

module = angular.module("plunker.inlineplunk", ["plunker.quickview"]);

module.directive("plunkerInlinePlunk", [
  "$rootScope", "quickview", function($rootScope, quickview) {
    return {
      restrict: "E",
      scope: {
        plunk: "="
      },
      transclude: true,
      template: "<span class=\"inline-plunk\" ng-class=\"{owned: plunk.isOwned()}\">\n  <a ng-href=\"{{plunk.id}}\" ng-click=\"showQuickView(plunk, $event)\" ng-transclude>\n  </a>\n</span>",
      link: function($scope, $el, attrs) {
        return $scope.showQuickView == function(plunk, $event) {
          quickview.show(plunk);
          $event.preventDefault();
          return $event.stopPropagation();
        };
      }
    };
  }
]);