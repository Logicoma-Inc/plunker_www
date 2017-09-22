var module;

module = angular.module("plunker.userpanel", ["plunker.visitor", "ui.bootstrap"]);

module.directive("plnkrPress", [
  "$parse", function($parse) {
    return function(scope, element, attrs) {
      var fn, tapping;
      tapping = false;
      fn = $parse(attrs.plnkrPress);
      element.bind('touchstart', function(e) {
        return (tapping = true);
      });
      element.bind('touchmove', function(e) {        
        return (tapping = false);
      });
      element.bind('touchend', function(e) {
        if (tapping) {
          return scope.$apply(function() {
            return fn(scope, {
              $event: e
            });
          });
        }
      });
      return element.bind('click', function(e) {
        return scope.$apply(function() {
          return fn(scope, {
            $event: e
          });
        });
      });
    };
  }
]);

module.directive("plunkerUserpanel", [
  function() {
    return {
      restrict: "E",
      replace: true,
      template: "<div class=\"plunker-userpanel pull-right\" ng-switch on=\"visitor.logged_in\">\n  <div class=\"btn-group\" ng-switch-when=\"true\">\n    <button class=\"user-menu btn dropdown-toggle\" data-toggle=\"dropdown\" title=\"User options\">\n      <img class=\"gravatar\" src=\"https://www.gravatar.com/avatar/{{visitor.user.gravatar_id}}?s=20\" />\n      <span class=\"text shrink\">{{visitor.user.login}}</span>\n      <b class=\"caret\" />\n    </button>\n    <ul class=\"dropdown-menu\">\n      <li>\n        <a href=\"/users/{{visitor.user.login}}\">My plunks</a>\n      </li>\n      <li>\n        <a href=\"/users/{{visitor.user.login}}/favorites\">Starred plunks</a>\n      </li>\n      <li class=\"divider\"></li>\n      <li>\n        <a class=\"logout\" href=\"javascript:void(0)\" plnkr-press=\"visitor.logout()\">Logout</a>\n      </li>\n    </ul>\n  </div>\n  <button ng-switch-when=\"false\" ng-disabled=\"visitor.isLoading()\" class=\"user-login btn btn-primary\" tooltip=\"Sign in to get full access\" tooltip-placement=\"bottom\" ng-click=\"visitor.login()\">\n    <i class=\"icon-github\" />\n    <span class=\"text shrink\">Sign in with Github</span>\n  </button>\n</div>",
      controller: [
        "$scope", "visitor", function($scope, visitor) {
            $scope.visitor = visitor;
          return visitor;
        }
      ]
    };
  }
]);