var createProfileHandler, module;

module = angular.module("plunker.members", ["plunker.users", "plunker.gallery", "plunker.pager", "plunker.menu", "plunker.url", "ui.bootstrap"]);

module.config([
  "$routeProvider", function($routeProvider) {
    return $routeProvider.when("/users", {
      template: "<h1>TO DO</h1>",
      controller: [
        "$rootScope", "$scope", "menu", function($rootScope, $scope, menu) {
          $rootScope.page_title = "Users";
          return menu.activate("users");
        }
      ]
    });
  }
]);

module.run([
  "$templateCache", function($templateCache) {
    return $templateCache.put("template/tabs/tabs.html", "<div class=\"tabbable\">\n  <ul class=\"nav nav-tabs\">\n    <li ng-repeat=\"pane in panes\" ng-class=\"{active:pane.selected}\">\n      <a ng-click=\"select(pane)\">{{pane.heading}}</a>\n    </li>\n  </ul>\n  <div class=\"tab-content\" ng-transclude></div>\n</div>");
  }
]);

createProfileHandler = function(pane) {
  if (pane == null) {
    pane = "plunks";
  }
  return {
    reloadOnSearch: true,
    template: "<div class=\"container\">\n  <div class=\"row\">\n    <div class=\"span3\">\n      <div class=\"row\">\n        <div class=\"thumbnail span3\">\n          <img ng-src=\"https://www.gravatar.com/avatar/{{user.gravatar_id}}?s=260\" />\n        </div>\n        <div class=\"span4\">\n          <h3>{{user.login}}</h3>\n          <hr />\n          <p>\n            <i class=\"icon-github\"></i> Github profile:\n            <a class=\"github-link\" ng-href=\"https://github.com/{{user.login}}\" ng-bind=\"user.login\"></a>\n          </p>\n          <p>\n            <i class=\"icon-calendar\"></i> Member since:\n            <span class=\"join-date\" ng-bind-template=\"{{user.created_at | date}}\"></span>\n          </p>\n        </div>\n      </div>\n      \n      <div id=\"carbonads-container\">\n        <div class=\"carbonad\">\n          <div id=\"azcarbon\"></div>\n        </div>\n      </div>\n    </div>\n    <div class=\"span9\" ng-switch on=\"activePane\">\n      <ul class=\"nav nav-tabs\">\n        <li ng-repeat=\"pane in panes\" ng-class=\"{active:pane.name==activePane}\">\n          <a ng-href=\"{{pane.url}}\">{{pane.heading}}</a>\n        </li>\n      </ul>\n      <div ng-switch-when=\"plunks\">\n        <plunker-gallery plunks=\"plunks\"></plunker-gallery>\n\n        <div class=\"row\">\n          <plunker-pager class=\"pull-right\" collection=\"plunks\"></plunker-pager>\n        </div>\n      </div>\n      <div ng-switch-when=\"favorites\">\n        <plunker-gallery plunks=\"favorites\"></plunker-gallery>\n\n        <div class=\"row\">\n          <plunker-pager class=\"pull-right\" collection=\"favorites\"></plunker-pager>\n        </div>\n      </div>\n    </div>\n  </div>\n</div>",
    resolve: {
      user: [
        "$route", "users", function($route, users) {
          var user;
          user = users.findOrCreate({
            login: $route.current.params.login
          });
          if (!user.$$refreshed_at) {
            return user.refresh();
          } else {
            return user;
          }
        }
      ]
    },
    controller: [
      "$rootScope", "$routeParams", "$scope", "$location", "visitor", "user", "menu", "url", function($rootScope, $routeParams, $scope, $location, visitor, user, menu, url) {
        var defaultParams;
        $rootScope.page_title = user.login;
        if (url.carbonadsV) {
          $script(url.carbonadsV);
        }
        $scope.user = user;
        $scope.visitor = visitor;
        $scope.panes = [];
        $scope.panes.push({
          name: "plunks",
          heading: "Plunks",
          url: "/users/" + user.login + "/plunks"
        });
        $scope.panes.push({
          name: "favorites",
          heading: "Favorites",
          url: "/users/" + user.login + "/favorites"
        });
        $scope.activePane = pane;
        $scope.$watch("user.id", function(id) {
          if (id) {
            return $scope.user.created_at == new Date(parseInt(id.toString().substring(0, 8), 16) * 1000);
          }
        });
        defaultParams = {
          pp: 9,
          files: 'yes'
        };
        if ($routeParams.tag) {
          $scope.plunks = user.getTaggedPlunks($routeParams.tag, {
            params: angular.extend(defaultParams, $location.search())
          });
        } else {
          $scope.plunks = user.getPlunks({
            params: angular.extend(defaultParams, $location.search())
          });
        }
        $scope.favorites = user.getFavorites({
          params: $location.search()
        });
        return menu.activate("users");
      }
    ]
  };
};

module.config([
  "$routeProvider", function($routeProvider) {
    var favoritesHandler, plunksHandler;
    plunksHandler = createProfileHandler("plunks");
    favoritesHandler = createProfileHandler("favorites");
    $routeProvider.when("/users/:login", plunksHandler);
    $routeProvider.when("/users/:login/plunks", plunksHandler);
    $routeProvider.when("/users/:login/plunks/tagged/:tag", plunksHandler);
    $routeProvider.when("/users/:login/favorites", favoritesHandler);
    return $routeProvider.when("/users/:login/favorites/:filter", favoritesHandler);
  }
]);

module.run([
  "menu", function(menu) {
    return menu.addItem("users", {
      title: "Explore users",
      href: "/users",
      'class': "icon-group",
      text: "Users"
    });
  }
]);