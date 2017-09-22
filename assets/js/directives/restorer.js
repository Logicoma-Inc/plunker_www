var module;

module = angular.module("plunker.restorer", ["plunker.session"]);

module.directive("plunkerRestorer", [
  "session", function(session) {
    return {
      restrict: "E",
      replace: true,
      scope: true,
      template: "<div class=\"alert alert-info plunker-restorer\" ng-show=\"savedState\">\n  <p><strong>Unsaved session</strong> Restore your previous session?</p>\n  <button class=\"btn btn-success btn-mini\" ng-click=\"restoreSession() | trackEvent:'Plunk':'Restore':'Sidebar'\">Restore</button>\n  <button class=\"btn btn-danger btn-mini\" data-dismiss=\"alert\">Discard</button>\n</div>",
      link: function($scope, $el, attrs) {
        $($el).alert({
          close: function() {
            return window.localStorage.removeItem("plnkr_dirty_state");
          }
        });
        $scope.restoreSession = function() {
          session.reset($scope.savedState);
          window.localStorage.removeItem("plnkr_dirty_state");
          return $($el).alert("close");
        };
        return $scope.savedState = session.lastSession;
      }
    };
  }
]);