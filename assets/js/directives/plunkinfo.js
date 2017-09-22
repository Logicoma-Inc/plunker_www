var module;

module = angular.module("plunker.plunkinfo", ["ui.bootstrap", "plunker.inlineplunk"]);

module.filter("shorten", function() {
  return function(val) {
    val = parseInt(val, 10);
    if (val >= 10000) {
      return Math.round(val / 1000) + "k";
    } else if (val >= 1000) {
      return Math.round(val / 100) / 10 + "k";
    } else {
      return val;
    }
  };
});

module.directive("plunkerPlunkInfo", [
  "$rootScope", function($rootScope) {
    return {
      restrict: "E",
      scope: {
        plunk: "="
      },
      replace: true,
      template: "<ul class=\"plunk-info\">\n  <!--<li class=\"comments\" tooltip=\"Comments and replunks\">\n    <span><i class=\"icon-comments\"></i>{{plunk.comments.length || 0}}</span>\n  </li>-->\n  <li class=\"forks\" tooltip=\"Forks of this plunk\">\n    <span><i class=\"icon-git-fork\"></i>{{plunk.forks.length}}</span>\n  </li>\n  <li class=\"stars\" tooltip=\"{{plunk.thumbed && 'Un-star this plunk' || 'Star this plunk'}}\">\n    <span><i class=\"icon-star\"></i>{{plunk.thumbs}}</span></a>\n  </li>\n  <li class=\"views\" tooltip=\"Views of this plunk\">\n    <span><i class=\"icon-eye-open\"></i>{{plunk.views | shorten}}</span></a>\n  </li>\n</ul>",
      link: function($scope, $el, attrs) {}
    };
  }
]);