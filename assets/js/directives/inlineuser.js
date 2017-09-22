var module;

module = angular.module("plunker.inlineuser", []);

module.directive("plunkerInlineUser", [
  "$rootScope", function($rootScope) {
    return {
      restrict: "E",
      scope: {
        user: "="
      },
      replace: true,
      template: "<span class=\"inline-user\" ng-class=\"{registered: !!user}\" ng-switch on=\"!!user\">\n  <a ng-href=\"/users/{{user.login}}\" ng-switch-when=\"true\">\n    <img class=\"gravatar\" ng-src=\"https://www.gravatar.com/avatar/{{user.gravatar_id}}?s=18&amp;d=mm\" />\n    {{user.login}}\n  </a>\n  \n  <span ng-switch-when=\"false\">\n    <img class=\"gravatar\" ng-src=\"https://www.gravatar.com/avatar/0?s=18&amp;d=mm\" src=\"https://www.gravatar.com/avatar/0?s=18&amp;d=mm\" />\n    Anonymous\n  </span>\n</span>",
      link: function($scope, $el, attrs) {}
    };
  }
]);