var module;

module = angular.module("plunker.timeago", []);

module.directive("timeago", [
  "$timeout", "$filter", function($timeout, $filter) {
    return {
      restrict: "A",
      replace: true,
      link: function($scope, $el, $attrs) {
        return $attrs.$observe("timeago", function(date) {
          if (date) {
            date = angular.isDate(date) ? date : new Date(date);
            $el.text($filter("date")(date, "medium"));
            $attrs.$set("title", date.toISOString());
            return $timeout(function() {
              return $el.timeago();
            });
          }
        });
      }
    };
  }
]);