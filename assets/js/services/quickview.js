var module;

module = angular.module("plunker.quickview", ["plunker.addthis", "plunker.inlineuser", "plunker.plunkinfo"]);

module.directive("plunkerQuickView", [
  "$timeout", function($timeout) {
    return {
      restrict: "E",
      replace: true,
      template: "<div class=\"plunker-quick-view\">\n  <div class=\"inner\">\n    <a class=\"close\" ng-click=\"close()\">&times;</a>\n    <div class=\"preview\">\n      <iframe frameborder=\"0\" width=\"100%\" height=\"100%\" ng-src=\"{{plunk.raw_url}}\"></iframe>\n    </div>\n    <div class=\"about\">\n      <h3>{{plunk.description}} <small>({{plunk.id}})</small></h3>\n\n      <p><plunker-taglist tags=\"plunk.tags\"></plunker-taglist></p>\n\n      <plunker-plunk-info plunk=\"plunk\"></plunker-plunk-info>\n      \n      <plunker-inline-user user=\"plunk.user\"></plunker-inline-user>\n      <abbr class=\"timeago updated_at\" title=\"{{plunk.updated_at}}\" ng-bind=\"plunk.updated_at | date:'medium'\"></abbr>\n      \n\n      \n      <ul class=\"operations\" ng-hide=\"options.hideOperations\">\n        <li>\n          <a class=\"btn btn-primary\" ng-click=\"close()\" ng-href=\"edit/{{plunk.id}}\">\n            <i class=\"icon-edit\"></i>\n            Edit\n          </a>\n        </li>\n        <li>\n          <a class=\"btn\" ng-href=\"{{plunk.raw_url}}\" target=\"_blank\">\n            <i class=\"icon-fullscreen\"></i>\n            Fullscreen\n          </a>\n        </li>\n        <li>\n          <a class=\"btn\" ng-click=\"close()\" ng-href=\"{{plunk.id}}\">\n            <i class=\"icon-play\"></i>\n            View Details\n          </a>\n        </li>\n        <li>\n          <div class=\"addthis_default_style addthis_20x20_style\" addthis-toolbox addthis-description=\"{{plunk.description}}\" addthis-path=\"/{{plunk.id}}\">\n            <a target=\"_self\" class=\"addthis_button_twitter\"></a>\n            <a target=\"_self\" class=\"addthis_button_facebook\"></a>\n            <a target=\"_self\" class=\"addthis_button_google_plusone_share\"></a>\n            <a target=\"_self\" class=\"addthis_button_linkedin\"></a>\n            <a target=\"_self\" class=\"addthis_button_compact\"></a>\n          </div>\n        </li>\n      </ul>\n      <div class=\"readme\" ng-show=\"plunk.getReadme()\" markdown=\"plunk.getReadme()\"></div>\n    </div>\n  </div>\n</div>",
      link: function($scope, $el, attrs) {
        return $scope.$watch("plunk.updated_at", function() {
          return $timeout(function() {
            return $("abbr.timeago", $el).timeago();
          });
        });
      }
    };
  }
]);

module.service("quickview", [
  "$rootScope", "$document", "$compile", "$location", function($rootScope, $document, $compile, $location) {
    var QuickView, activeQuickView;
    QuickView = (function() {
      function QuickView(plunk1, options) {
        var $body, $el, $scope, link, restoreOverflow;
        this.plunk = plunk1;
        if (!this.plunk.$$refreshed_at) {
          this.plunk.refresh();
        }
        $scope = $rootScope.$new();
        $body = $document.find("body");
        link = $compile("<plunker-quick-view plunk=\"plunk\"></plunker-quick-view>");
        restoreOverflow = $body.css("overflow");
        $scope.plunk = this.plunk;
        $scope.options = options;
        $scope.close = this.close = function() {
          if ($scope.$parent) {
            $scope.$destroy();
            $el.remove();
            return $body.css("overflow", restoreOverflow);
          }
        };
        $el = link($scope);
        $body.prepend($el).css("overflow", "hidden");
        $rootScope.$on("$routeChangeStart", function() {
          return typeof activeQuickView !== "undefined" && activeQuickView !== null ? activeQuickView.close() : void 0;
        });
      }

      return QuickView;

    })();
    activeQuickView = null;
    return {
      show: function(plunk, options) {
        if (options == null) {
          options = {};
        }
        if (activeQuickView) {
          activeQuickView.close();
        }
        return activeQuickView = new QuickView(plunk, options);
      },
      hide: function() {
        if (activeQuickView) {
          activeQuickView.close();
        }
        return activeQuickView = null;
      }
    };
  }
]);