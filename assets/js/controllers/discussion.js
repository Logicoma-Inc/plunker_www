var module;

module = angular.module("plunker.discussion", ["plunker.menu"]);

module.config([
  "$routeProvider", function($routeProvider) {
    return $routeProvider.when("/group", {
      template: "<div class=\"container\">\n  <iframe id=\"forum_embed\" src=\"javascript:void(0)\" scrolling=\"no\" frameborder=\"0\" width=\"100%\" height=\"500\"></iframe>\n</div>",
      controller: [
        "$rootScope", "$scope", "$timeout", "menu", function($rootScope, $scope, $timeout, menu) {
          var $footer, $iframe;
          $rootScope.page_title = "Group";
          menu.activate("group");
          $iframe = $("#forum_embed");
          $footer = $(".container footer");
          $scope.$parent.section = "discuss";
          $scope.resizeDiscussion = function() {
            var minHeight;
            minHeight = 400;
            return $iframe.height(Math.max(minHeight, $(window).height() - 60 - 8 - $footer.outerHeight()));
          };
          $(window).resize($scope.resizeDiscussion);
          $timeout(function() {
            return $scope.resizeDiscussion();
          }, 2000);
          return $iframe.attr("src", 'https://groups.google.com/forum/embed/?place=forum/plunker&showsearch=true&showpopout=true&hideforumtitle=true&showtabs=false&parenturl=' + encodeURIComponent(window.location.href));
        }
      ]
    });
  }
]);

module.run([
  "menu", function(menu) {
    return menu.addItem("discuss", {
      title: "Open the discussion group",
      href: "/group",
      'class': "icon-comments-alt",
      text: "Group"
    });
  }
]);