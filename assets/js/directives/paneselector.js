var module;

module = angular.module("plunker.paneselector", ["plunker.panes", "ui.bootstrap", "ui.bootstrap.tooltip"]);

module.directive("plunkerPaneselector", [
  "panes", function(panes) {
    return {
      restrict: "E",
      replace: true,
      template: "<div class=\"plunker-paneselector\">\n  <ul>\n    <li tooltip=\"{{pane.title}}\" tooltip-placement=\"left\" ng-repeat=\"pane in panes.panes | orderBy:'order'\" class=\"{{pane.class}} plunker-pane-{{pane.id}}\" ng-hide=\"pane.hidden\" ng-class=\"{active:pane==panes.active}\">\n      <a ng-click=\"panes.toggle(pane) | trackEvent:'Multipane':(panes.active==pane&&'Show '||'Hide ') + pane.title:'Paneselector'\">\n        <i class=\"icon-{{pane.icon}}\"></i>\n      </a>\n    </li>\n  </ul>\n</div>",
      link: function($scope, $el, attrs) {
        return $scope.panes = panes;
      }
    };
  }
]);