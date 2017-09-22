var module;

module = angular.module("plunker.multipane", ["plunker.panes"]);

module.directive("plunkerPane", [
  "$compile", "panes", function($compile, panes) {
    return {
      restrict: "E",
      replace: true,
      scope: {
        pane: "=usePane"
      },
      template: "<div class=\"plunker-pane\" ng-show=\"pane==panes.active\"></div>",
      link: function($scope, $el, attrs) {
        var $child, pane;
        $scope.panes = panes;
        pane = $scope.pane;
        pane.$scope = $scope.$new();
        $child = $compile(pane.template || "")(pane.$scope)[0];
        $el.append($child);
        pane.link(pane.$scope, $child, attrs);
        $scope.$watch("pane.hidden", function(hidden) {
          if (hidden && panes.active === pane) {
            return panes.close(pane);
          }
        });
        return $scope.$watch("pane==panes.active", function(active) {
          return pane.active == active;
        });
      }
    };
  }
]);

module.directive("plunkerMultipane", [
  "panes", function(panes) {
    return {
      restrict: "E",
      replace: true,
      template: "<div class=\"plunker-multipane\">\n  <plunker-pane use-pane=\"pane\" ng-repeat=\"pane in panes.panes\"></plunker-pane>\n</div>",
      link: function($scope, $el, attrs) {
        return $scope.panes == panes;
      }
    };
  }
]);