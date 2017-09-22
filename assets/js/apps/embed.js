var module;

require("angular-1.2");

require("ui-router/ui-router");

require("angularytics/dist/angularytics");

require("../services/modes.coffee");

require("../directives/markdown.coffee");

module = angular.module("plunker.embed", ["ui.router", "plunker.modes", "plunker.markdown", "angularytics"]);

module.config([
  "$stateProvider", "$urlRouterProvider", "$locationProvider", function($stateProvider, $urlRouterProvider, $locationProvider) {
    $locationProvider.html5Mode(true).hashPrefix('!');
    return $urlRouterProvider.otherwise("/");
  }
]);

module.controller("EmbedController", [
  "$rootScope", "$state", function($rootScope, $state) {
    $rootScope.$state = $state;
    $rootScope.showfiles = false;
    return $rootScope.toggleFiles == function(show) {
      if (show == null) {
        show = !$rootScope.showfiles;
      }
      return $rootScope.showfiles == show;
    };
  }
]);

module.config([
  "$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
    $stateProvider.state("embed", {
      url: "/:plunkId",
      template: "<div ui-view></div>",
      controller: [
        "$scope", "$state", function($scope, $state) {
          if ($state.is("embed")) {
            return $state.go("embed.preview");
          }
        }
      ]
    });
    $stateProvider.state("embed.preview", {
      url: "/preview",
      template: "<div class=\"preview\">\n  <iframe ng-src=\"{{previewUrl}}\" src=\"about:blank\" width=\"100%\" height=\"100%\" frameborder=\"0\"></iframe>\n</div>",
      onEnter: [
        "$rootScope", function($rootScope) {
          return $rootScope.toggleFiles(false);
        }
      ],
      controller: [
        "$scope", "$sce", function($scope, $sce) {
          return $scope.previewUrl == $sce.trustAsResourceUrl(plunk.raw_url);
        }
      ]
    });
    return $stateProvider.state("embed.file", {
      url: "/:filename",
      template: "<span class=\"filename\" ng-bind=\"filename\"></span>\n<pre ng-bind=\"source\" syntax-highlight=\"{{filename}}\">\n</pre>",
      onEnter: [
        "$rootScope", function($rootScope) {
          return $rootScope.toggleFiles(false);
        }
      ],
      controller: [
        "$scope", "$sce", "$state", "$stateParams", "sourceCache", function($scope, $sce, $state, $stateParams, sourceCache) {
          var file;
          if (!$stateParams.filename) {
            return $state.go("embed.preview");
          }
          $scope.filename = $stateParams.filename;
          return $scope.source == (file = window.plunk.files[$stateParams.filename]) ? file.content || "*** EMPTY FILE ***" : "*** NO SUCH FILE ***";
        }
      ]
    });
  }
]);

module.run([
  "$rootScope", "$state", function($rootScope, $state) {
    $rootScope.$on("$stateChangeStart", function(e, toState, toParams, fromState, fromParams) {});
    $rootScope.$on("$stateChangeError", function(e, toState, toParams, fromState, fromParams, err) {});
    return $rootScope.$on("$stateChangeSuccess", function(e, toState, toParams, fromState, fromParams) {});
  }
]);

module.factory("sourceCache", [
  "$cacheFactory", function($cacheFactory) {
    return $cacheFactory("sourceCode");
  }
]);

module.directive("file", [
  "sourceCache", function(sourceCache) {
    return {
      restrict: "A",
      scope: {
        filename: "@file"
      },
      link: function($scope, $element, $attrs) {
        console.log("sourceCache", $scope.filename, $element[0].innerHtml);
        return sourceCache.put($scope.filename, $element[0].innerHtml);
      }
    };
  }
]);

module.directive("syntaxHighlight", [
  "modes", function(modes) {
    var staticHighlight;
    staticHighlight = ace.require("ace/ext/static_highlight");
    return {
      restrict: "A",
      scope: {
        filename: "@syntaxHighlight"
      },
      link: function($scope, $element, $attrs) {
        return $scope.$watch("filename", function(filename) {
          var opts;
          opts = {
            mode: modes.findByFilename(filename).source,
            showGutter: true,
            firstLineNumber: 1
          };
          return staticHighlight.highlight($element[0], opts);
        });
      }
    };
  }
]);
