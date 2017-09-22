var module;

module = angular.module("plunker.markdown", []);

module.directive("markdown", [
  function() {
    return {
      restrict: "A",
      link: function($scope, $element, $attrs) {
        marked.setOptions({
          gfm: true,
          tables: false,
          breaks: false,
          pedantic: false,
          sanitize: true,
          smartLists: true,
          smartypants: false,
          langPrefix: 'lang-'
        });
        return $scope.$watch($attrs.markdown, function(markdown) {
          if (markdown) {
            return $element.html(marked(markdown || ""));
          } else {
            return $element.html("");
          }
        });
      }
    };
  }
]);