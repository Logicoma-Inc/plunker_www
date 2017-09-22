var module;

module = angular.module("plunker.notfound", ["plunker.menu"]);

module.config([
  "$routeProvider", function($routeProvider) {
    return $routeProvider.otherwise({
      template: "<div class=\"plunker-notfound container\">\n  <div class=\"hero-unit\">\n    <h1>404 Not Found</h1>\n    <p>You have reached the end of Plunker.  You are one step away from the\n      end of the internet. Please proceed with caution.</p>\n    <p><a href=\"/\">I don't like it here, please take me home.</a></p>\n  </div>\n</div>",
      controller: [
        "$rootScope", function($rootScope) {
          return $rootScope.page_title = "Page not found";
        }
      ]
    });
  }
]);

module.run([
  "menu", function(menu) {
    return menu.deactivate();
  }
]);