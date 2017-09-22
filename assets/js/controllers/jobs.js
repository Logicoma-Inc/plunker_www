var module,
  slice = [].slice;

module = angular.module("plunker.jobs", ["plunker.menu"]);

module.directive("plunkerJobs", [
  function() {
    return {
      restrict: "E",
      replace: true,
      template: "<div class=\"plunker-jobs container\">\n  <div class=\"row\">\n    <div class=\"span12\">\n      <iframe class=\"plunker-jobs\" src=\"http://plunker.jobthread.com/\" width=\"100%\" height=\"800px\" frameborder=\"0\">\n      </iframe>\n    </div>\n  </div>\n</div>",
      link: function($scope, $el, attrs) {}
    };
  }
]);

module.run([
  "$rootScope", "menu", function($rootScope, menu) {
    return menu.addItem("jobs", {
      title: "Job directory",
      href: "/jobs",
      'class': "icon-edit",
      text: "Jobs"
    });
  }
]);

module.config([
  "$routeProvider", function($routeProvider) {
    return $routeProvider.when("/jobs", {
      template: "<plunker-jobs></plunker-jobs>",
      controller: function($scope) {
        return console.log.apply(console, ["Hello world"].concat(slice.call(arguments)));
      }
    });
  }
]);