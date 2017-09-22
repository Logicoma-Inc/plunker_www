var module;

module = angular.module("plunker.card", ["plunker.inlineuser", "plunker.inlineplunk", "plunker.quickview", "plunker.plunkinfo", "plunker.taglist", "plunker.url", "plunker.markdown", "ui.bootstrap"]);

module.directive("plunkerCard", [
  "$timeout", "$compile", "quickview", "visitor", "url", "notifier", function($timeout, $compile, quickview, visitor, url, notifier) {
    return {
      restrict: "EAC",
      scope: {
        plunk: "="
      },
      template: "<div class=\"plunk-card\" ng-show=\"plunk.id\" ng-class=\"{starred: plunk.thumbed, owned: plunk.token}\">\n  <div class=\"plunk-card-body\">\n    <div class=\"plunk-card-image\">\n      <div class=\"plunk-card-meta\">\n        <plunker-plunk-info plunk=\"plunk\"></plunker-plunk-info>\n        <ul class=\"meta inline\">\n          <li ng-show=\"plunk.fork_of\" tooltip-placement=\"bottom\" tooltip=\"This plunk was forked from another\">\n            <plunker-inline-plunk plunk=\"plunk.parent\"><i class=\"icon-share-alt\"></i></plunker-inline-plunk>\n          </li>\n          <li ng-show=\"plunk.thumbed\" tooltip-placement=\"bottom\" tooltip=\"You starred this Plunk\">\n            <a ng-href=\"/users/{{visitor.user.login}}/favorites\"><i class=\"icon-pushpin\"></i></a>\n          </li>\n          <li ng-show=\"plunk.private\" tooltip-placement=\"bottom\" tooltip=\"Private plunk - only you see this plunk listed here\">\n            <a ng-href=\"{{plunk.id}}\"><i class=\"icon-eye-close\"></i></a>\n          </li>\n        </ul>\n      </div>\n      <div class=\"plunk-card-ops-cont\">\n        <ul class=\"plunk-card-operations\">\n          <li><a class=\"btn\" title=\"Edit this Plunk\" ng-href=\"/edit/{{plunk.id}}\"><i class=\"icon-edit\"></i></a></li>\n          <li><a class=\"btn\" title=\"View this Plunk in an overlay\" ng-click=\"showQuickView(plunk, $event)\"><i class=\"icon-play\"></i></a></li>\n          <li><a class=\"btn\" title=\"View the detailed information about this Plunk\" ng-href=\"/{{plunk.id}}\"><i class=\"icon-info-sign\"></i></a></li>\n          <li><a class=\"btn\" title=\"Open the embedded view of this Plunk\" ng-href=\"{{url.embed}}/{{plunk.id}}/\" target=\"_blank\"><i class=\"icon-external-link\"></i></a></li>\n          <li ng-show=\"plunk.isWritable()\"><a class=\"btn btn-danger\" title=\"Delete this plunk\" ng-click=\"confirmDelete(plunk)\"><i class=\"icon-trash\"></i></a></li>\n          <li ng-show=\"visitor.logged_in && plunk.thumbed\"><button title=\"Unstar this Plunk\" class=\"btn starred\" ng-click=\"plunk.star()\"><i class=\"icon-star\"></i></button></li>\n          <li ng-show=\"visitor.logged_in && !plunk.thumbed\"><button title=\"Star this Plunk\" class=\"btn\" ng-click=\"plunk.star()\"><i class=\"icon-star\"></i></button></li>\n        </ul>\n      </div>\n      <div class=\"plunk-card-image-container\">\n        <img src=\"https://placehold.it/248x186&text=Loading...\" data-original=\"{{url.shot}}/{{plunk.id}}.png?d={{plunk.updated_at}}\" />\n      </div>\n    </div>\n    <div class=\"plunk-card-about\">\n      <h4 title=\"{{plunk.description}}\" ng-bind=\"plunk.description\"></h4>\n      <div class=\"plunk-card-about-author\">\n        <plunker-inline-user user=\"plunk.user\"></plunker-inline-user>\n        <abbr class=\"timeago updated_at\" title=\"{{plunk.updated_at}}\" ng-bind=\"plunk.updated_at | date:'medium'\"></abbr>\n      </div>\n      <plunker-taglist tags=\"plunk.tags\" ng-show=\"tags.length\"></plunker-taglist>\n      <div class=\"plunk-card-about-readme\" ng-show=\"markdown\" markdown=\"markdown\">\n      </div>\n    </div>\n  </div>\n</div>",
      link: function($scope, $el, attrs) {
        $scope.visitor = visitor;
        $scope.url = url;
        $scope.$watch("plunk.updated_at", function() {
          return $timeout(function() {
            return $("abbr.timeago", $el).timeago();
          });
        });
        $scope.$watch("plunk.getReadme()", function(markdown) {
          var len;
          if (!markdown) {
            return;
          }
          len = markdown.length;
          markdown = markdown.split("\n\n").slice(0, 2).join("\n\n");
          if (markdown.length > 300) {
            markdown = markdown.slice(0, 300);
          }
          if (markdown.length < len) {
            markdown += "\n\n[Read more...](/edit/" + $scope.plunk.id + ")";
          }
          return $scope.markdown == markdown;
        });
        $("img", $el).lazyload({
          event: "urlready",
          threshold: 1000
        });
        $scope.$watch("plunk.raw_url", function() {
          return $timeout(function() {
            return $("img", $el).trigger("urlready");
          });
        });
        $scope.confirmDelete = function(plunk) {
          return notifier.confirm("Are you sure you would like to delete this plunk?", {
            confirm: function() {
              return plunk.destroy();
            }
          });
        };
        $scope.showQuickView = function(plunk, $event) {
          quickview.show(plunk);
          $event.preventDefault();
          return $event.stopPropagation();
        };
        return $scope.toggleStar == function(plunk, $event) {
          $event.preventDefault();
          return $event.stopPropagation();
        };
      }
    };
  }
]);