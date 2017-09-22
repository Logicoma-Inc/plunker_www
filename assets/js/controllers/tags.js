var module, tagsTemplate;

module = angular.module("plunker.tags", ["plunker.timeago", "plunker.menu", "plunker.gallery", "plunker.plunks"]);

module.factory("tags", [
  "$http", "url", function($http, url) {
    return $http.get(url.api + "/tags").then(function(response) {
      return response.data;
    });
  }
]);

tagsTemplate = "<div class=\"container\">\n  <div class=\"row\" ng-switch on=\"view\">\n    <div class=\"span3\">\n      <ul class=\"nav nav-list\">\n        <li class=\"nav-header\">Popular tags</li>\n        <li ng-repeat=\"tagInfo in tags\">\n          <span class=\"badge pull-right\" ng-bind=\"tagInfo.count\"></span>\n          <a ng-href=\"tags/{{tagInfo.tag}}\" ng-bind=\"tagInfo.tag\">\n          </a>\n        </li>\n      </ul>\n    </div>\n    <div class=\"span9\" ng-switch-when=\"plunks\">\n      <h1>Viewing: {{taglist}}</h1>\n      <plunker-gallery plunks=\"plunks\"></plunker-gallery>\n\n      <div class=\"row\">\n        <plunker-pager class=\"pull-right\" collection=\"plunks\"></plunker-pager>\n      </div>\n    </div>\n    <div class=\"span9\" ng-switch-default>\n      <h1>Browse tags</h1>\n      <p>\n        Using the menu on the left, you can browse the top tags on Plunker.\n        Click a tag to see the most popular plunks with that tag.\n      </p>\n      <p>\n        Also note, that if you want to filter for plunks that have more than\n        one tag, you can do so by changing the url to tag1,tag2,etc..\n      </p>\n    </div>\n  </div>\n</div>";

module.config([
  "$routeProvider", function($routeProvider) {
    $routeProvider.when("/tags", {
      template: tagsTemplate,
      controller: [
        "$rootScope", "$scope", "menu", "tags", function($rootScope, $scope, menu, tags) {
          $scope.tags = tags;
          $scope.view = "list";
          $rootScope.page_title = "Tags";
          return menu.activate("tags");
        }
      ]
    });
    return $routeProvider.when("/tags/:taglist", {
      template: tagsTemplate,
      controller: [
        "$rootScope", "$scope", "$location", "$routeParams", "plunks", "url", "menu", "tags", function($rootScope, $scope, $location, $routeParams, plunks, url, menu, tags) {
          var defaultParams;
          defaultParams = {
            pp: 12,
            files: 'yes'
          };
          $scope.tags = tags;
          $scope.view = "plunks";
          $scope.taglist = $routeParams.taglist.split(",").join(", ");
          $scope.plunks = plunks.query({
            url: url.api + "/tags/" + $routeParams.taglist,
            params: angular.extend(defaultParams, $location.search())
          });
          $rootScope.page_title = "Tags";
          return menu.activate("tags");
        }
      ]
    });
  }
]);

module.run([
  "menu", function(menu) {
    return menu.addItem("tags", {
      title: "Explore tags",
      href: "/tags",
      'class': "icon-tags",
      text: "Tags"
    });
  }
]);