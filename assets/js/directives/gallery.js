var module;

module = angular.module("plunker.gallery", ["plunker.card"]);

module.directive("plunkerGallery", [
  "$timeout", "$location", function($timeout, $location) {
    return {
      restrict: "E",
      replace: true,
      scope: {
        plunks: "="
      },
      template: "<div class=\"plunker-gallery\">\n  <ul class=\"gallery\">\n    <li plunker-card ng-repeat=\"plunk in plunks\" plunk=\"plunk\"></li>\n  </ul>\n</div>",
      link: function($scope, $el, attrs) {
        var $gallery, nextRefresh;
        nextRefresh = null;
        $gallery = $(".gallery", $el);
        $gallery.masonry({
          columnWidth: 300
        });
        $scope.$watch("plunks.$$refreshed_at", function() {
          return $timeout(function() {
            return $gallery.masonry("reload");
          });
        });
        return $scope.$on("$destroy", function() {
          return $timeout.cancel(nextRefresh);
        });
      }
    };
  }
]);