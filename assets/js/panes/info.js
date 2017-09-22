var module;

module = angular.module("plunker.panes");

module.requires.push("plunker.session");

module.requires.push("plunker.activity");

module.requires.push("plunker.inlineuser");

module.requires.push("plunker.markdown");

module.requires.push("plunker.url");

module.requires.push("plunker.timeago");

module.run([
  "$timeout", "panes", "session", "activity", "url", function($timeout, panes, session, activity, url) {
    return panes.add({
      id: "info",
      icon: "dashboard",
      size: 430,
      title: "Info",
      hidden: true,
      description: "Plunk information.",
      template: "<div class=\"plunker-info\">\n  <h3>\n    <a class=\"permalink pull-right\" ng-href=\"{{session.plunk.raw_url}}\" target=\"_blank\"><i class=\"icon icon-link\"></i></a>\n    {{session.plunk.description}}\n  </h3>\n  <div class=\"info-creation\">\n    <plunker-plunk-info plunk=\"session.plunk\" class=\"pull-right\"></plunker-plunk-info>\n    <plunker-inline-user user=\"session.plunk.user\"></plunker-inline-user>\n    <abbr class=\"timeago updated_at\" title=\"{{session.plunk.updated_at}}\" timeago=\"{{session.plunk.updated_at | date:'medium'}}\"></abbr>\n  </div>\n  <plunker-taglist tags=\"session.plunk.tags\" ng-show=\"tags.length\"></plunker-taglist>\n  <p></p>\n  <div class=\"info-ad\" ng-show=\"adcode\">\n    <div id=\"carbonads-container\">\n      <div class=\"carbonad\">\n        <div id=\"azcarbon\"></div>\n      </div>\n    </div>\n  </div>\n  <div class=\"info-readme\" ng-show=\"session.plunk.getReadme()\" markdown=\"session.plunk.getReadme()\">\n  </div>\n  <div class=\"alert alert-info\" ng-hide=\"session.plunk.getReadme()\">\n    <h4>Describe your plunks in Markdown</h4>\n    <p>You can give your plunks long-form descriptions now by creating a README.md\n      file. The first two paragraphs of the readme (including title) will be shown\n      on the plunk 'cards' on the front page. The readme will also be available in its\n      full form here and at other relevant places in the Plunker ecosystem.\n    </p>\n  </div>\n  <div style=\"display: none\">\n    <ul class=\"plunker-comment-list\">\n      <li ng-repeat=\"comment in session.plunk.comments\">\n        <plunker-inline-user user=\"comment.user\"></plunker-inline-comment>\n        <div ng-bind=\"comment.body\"></div>\n      </li>\n    </ul>\n    <div class=\"plunker-comment-box\">\n      <textarea ng-keypress=\"onKeyPress()\" ng-model=\"draft\"></textarea>\n    </div>\n  </div>\n</div>",
      link: function($scope, $el, attrs) {
        var $textarea, pane;
        pane = this;
        $scope.$watch((function() {
          return pane.active;
        }), function(active) {
          if (active && !$scope.adcode && url.carbonadsH) {
            $scope.adcode = true;
            return $timeout(function() {
              return $script(url.carbonadsH);
            });
          }
        });
        $scope.session = session;
        $scope.$watch("session.plunk.id", function(id) {
          return pane.hidden = !id;
        });
        $textarea = $(".plunker-comment-box textarea", $el).autosize({
          append: "\n"
        }).css("height", "24px");
        $textarea.on("blur", function() {
          return $textarea.css("height", "24px");
        });
        return $textarea.on("focus", function() {
          return $textarea.trigger("autosize");
        });
      }
    });
  }
]);