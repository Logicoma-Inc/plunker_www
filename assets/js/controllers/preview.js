var module;

module = angular.module("plunker.preview", ["plunker.addthis", "plunker.plunks", "plunker.visitor", "plunker.gallery", "plunker.overlay", "plunker.plunkinfo", "plunker.timeago"]);

module.config([
  "$routeProvider", function($routeProvider) {
    return $routeProvider.when("/:plunk_id", {
      template: "<div id=\"preview\" class=\"container\">\n  <div class=\"row\">\n    <div class=\"span12\">\n      <h1>{{plunk.description}} <small>({{plunk.id}})</small></h1>\n      <ul class=\"operations\">\n        <li>\n          <a class=\"btn btn-primary\" ng-href=\"/edit/{{plunk.id}}\">\n            <i class=\"icon-edit\"></i>\n            Launch in Editor\n          </a>\n        </li>\n        <li>\n          <a class=\"btn\" ng-href=\"{{plunk.raw_url}}\" target=\"_blank\">\n            <i class=\"icon-fullscreen\"></i>\n            Launch Fullscreen\n          </a>\n        </li>\n        <li ng-show=\"visitor.logged_in\">\n          <button class=\"btn\" ng-click=\"plunk.star()\" ng-class=\"{starred: plunk.thumbed}\">\n            <i class=\"icon-star\"></i>\n            <span ng-show=\"plunk.thumbed\">Unstar</span>\n            <span ng-hide=\"plunk.thumbed\">Star</span>\n          </button>\n        </li>\n        <li ng-switch=\"!!plunk.created_at\">\n          <div ng-switch-when=\"true\" class=\"addthis_default_style addthis_20x20_style\" addthis-toolbox addthis-description=\"{{plunk.description}}\" addthis-path=\"/{{plunk.id}}\">\n            <a target=\"_self\" class=\"addthis_button_twitter\"></a>\n            <a target=\"_self\" class=\"addthis_button_facebook\"></a>\n            <a target=\"_self\" class=\"addthis_button_google_plusone_share\"></a>\n            <a target=\"_self\" class=\"addthis_button_linkedin\"></a>\n            <a target=\"_self\" class=\"addthis_button_compact\"></a>\n          </div>\n        </li>\n      </ul>\n      <div class=\"frame\">\n        <iframe frameborder=\"0\" width=\"100%\" height=\"100%\" ng-src=\"{{plunk.raw_url}}\"></iframe>\n      </div>\n      \n      <div class=\"about\">\n        <plunker-plunk-info plunk=\"plunk\"></plunker-plunk-info>\n\n        Last saved by\n        <plunker-inline-user user=\"plunk.user\"></plunker-inline-user>\n        <abbr timeago=\"{{plunk.updated_at}}\"></abbr>\n        \n      </div>\n    </div>\n  </div>\n  <div id=\"plunk-feed\" class=\"feed\">\n    <div class=\"row\">\n      <div class=\"span12\">\n        <h2>Event Feed</h2>\n      </div>\n    </div>\n    <div class=\"row event\" ng-repeat=\"event in plunk.feed | orderBy:'-date'\" ng-class=\"{{event.type}}\" ng-switch on=\"event.type\">\n      <hr class=\"span12\"></hr>\n      <div ng-switch-when=\"fork\">\n        <div class=\"span1 type\"><i ng-class=\"event.icon\"></i></div>\n        <div class=\"span11\">\n          <plunker-inline-user user=\"event.user\"></plunker-inline-user>\n          forked this plunk off of <plunker-inline-plunk plunk=\"event.parent\">{{event.parent.id}}</plunker-inline-plunk>\n          by <plunker-inline-user user=\"event.parent.user\"></plunker-inline-user>\n          <abbr timeago=\"{{event.date}}\"></abbr>.\n        </div>\n      </div>\n      <div ng-switch-when=\"create\">\n        <div class=\"span1 type\"><i ng-class=\"event.icon\"></i></div>\n        <div class=\"span11\">\n          <plunker-inline-user user=\"event.user\"></plunker-inline-user>\n          created this plunk\n          <abbr timeago=\"{{event.date}}\"></abbr>.\n        </div>\n      </div>\n      <div ng-switch-when=\"forked\">\n        <div class=\"span1 type\"><i ng-class=\"event.icon\"></i></div>\n        <div class=\"span11\">\n          <plunker-inline-user user=\"event.user\"></plunker-inline-user>\n          created <plunker-inline-plunk plunk=\"event.child\">{{event.child.id}}</plunker-inline-plunk>\n          by forking this plunk\n          <abbr timeago=\"{{event.date}}\"></abbr>.\n        </div>\n      </div>\n    </div>\n  </div>\n</div>",
      resolve: {
        plunk: [
          "$route", "plunks", function($route, plunks) {
            var plunk;
            plunk = plunks.findOrCreate({
              id: $route.current.params.plunk_id
            });
            if (!plunk.$$refreshed_at) {
              plunk.refresh();
            }
            return plunk;
          }
        ]
      },
      controller: [
        "$rootScope", "$scope", "$routeParams", "visitor", "plunk", function($rootScope, $scope, $routeParams, visitor, plunk) {
          $rootScope.page_title = plunk.description || "Untitled plunk";
          $scope.plunk = $rootScope.plunk = plunk;
          return $scope.visitor == visitor;
        }
      ]
    });
  }
]);