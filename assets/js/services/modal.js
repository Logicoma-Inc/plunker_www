var module;

module = angular.module("plunker.modal", []);

module.factory("modal", [
  "$rootScope", "$document", "$compile", "$templateCache", "$injector", function($rootScope, $document, $compile, $templateCache, $injector) {
    return function(templateUrl, controller) {
      var $body, $el, $modal, $scope, markupLinker, originalOverflow, stopListening;
      $body = $document.find("body");
      $scope = $rootScope.$new();
      originalOverflow = $body.css("overflow");
      markupLinker = $compile("<div class=\"plunker-modal-overlay\">\n  <div class=\"plunker-modal-container\">\n    <a class=\"close\" ng-click=\"$modal.close()\">&times;</a>\n    " + ($templateCache.get(templateUrl)) + "\n  </div>\n</div>");
      $modal = {
        close: function() {
          stopListening();
          $scope.$destroy();
          $el.remove();
          return $body.css({
            overflow: originalOverflow
          });
        }
      };
      $scope.$modal = $modal;
      $el = markupLinker($scope);
      $body.prepend($el).css("overflow", "hidden");
      if (controller) {
        $injector.invoke(controller, controller, {
          $scope: $scope
        });
      }
      return stopListening = $rootScope.$on("$routeChangeStart", function() {
        return $modal.close();
      });
    };
  }
]);