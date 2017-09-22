var module;

module = angular.module("plunker.panes");

module.requires.push("plunker.session");

module.requires.push("plunker.plunks");

module.requires.push("plunker.url");

module.requires.push("plunker.visitor");

module.requires.push("plunker.plunkinfo");

module.requires.push("plunker.quickview");

module.requires.push("plunker.timeago");

module.requires.push("plunker.pager");

module.requires.push("plunker.taglist");

module.run([
  "panes", "session", "plunks", "url", "visitor", "quickview", function(panes, session, plunks, url, visitor, quickview) {
    return panes.add({
      id: "templates",
      icon: "briefcase",
      size: 440,
      order: 300,
      title: "Templates",
      description: "Create a new plunk from a template.",
      template: "<div class=\"plunker-templates\">\n  <ul class=\"nav nav-tabs\">\n    <li ng-class=\"{active: filter=='forked'}\">\n      <a ng-click=\"filter='forked'\">Most popular</a>\n    </li>\n    <li ng-show=\"visitor.isMember()\" ng-class=\"{active: filter=='own'}\">\n      <a ng-click=\"filter='own'\">Saved templates</a>\n    </li>\n  </ul>\n  <div class=\"alert alert-block\" ng-show=\"filter=='own' && templates.length == 0 && !templates.$$refreshing\">\n    <h4>You do not have any saved templates</h4>\n    <p>To add saved templates, load up a Plunk or gist/template in the editor and hit the briefcase icon at\n      the right end of the toolbar.\n    </p>\n  </div>\n  <ul class=\"nav nav-list\">\n    <li class=\"template\" ng-repeat=\"plunk in templates\">\n      <h4 ng-bind=\"plunk.description || 'Untitled'\"></h4>\n      \n      <plunker-plunk-info plunk=\"plunk\"></plunker-plunk-info>\n      \n      <p>\n        <plunker-inline-user user=\"plunk.user\"></plunker-inline-user>\n        <abbr class=\"timeago updated_at\" title=\"{{plunk.updated_at}}\" timeago=\"{{plunk.updated_at | date:'medium'}}\"></abbr>\n      </p>\n      <plunker-taglist class=\"pull-right\" tags=\"plunk.tags\"></plunker-taglist>\n      <p>\n        <button class=\"btn btn-mini\" ng-click=\"preview(plunk)\">\n          <i class=\"icon-play\"></i>\n          Preview\n        </button>\n        <a class=\"btn btn-mini btn-primary\" ng-click=\"close()\" ng-href=\"/edit/tpl:{{plunk.id}}\">\n          <i class=\"icon-file\"></i>\n          Edit\n        </a>\n      </p>\n    </li>\n  </ul>\n  <plunker-pager class=\"pagination-right\" collection=\"templates\" nav=\"moveTo(url)\"></plunker-pager>\n\n</div>",
      link: function($scope, $el, attrs) {
        var activated, pane;
        pane = this;
        activated = false;
        $scope.session = session;
        $scope.visitor = visitor;
        $scope.preview = function(plunk) {
          return quickview.show(plunk, {
            hideOperations: true
          });
        };
        $scope.close = function() {
          return pane.active = false;
        };
        $scope.moveTo = function(url) {
          return $scope.templates.pageTo(url);
        };
        $scope.$watch("pane.active", function(active) {
          var ref;
          if (active && !activated) {
            activated = true;
            $scope.filter = visitor.isMember() ? "own" : "forked";
          }
          if (active) {
            return (ref = $scope.templates) != null ? ref.refresh() : void 0;
          }
        });
        $scope.$watch("visitor.isMember()", function(member) {
          if ($scope.filter === "own" && !member) {
            return $scope.filter = "forked";
          }
        });
        return $scope.$watch("filter", function(filter) {
          if (activated) {
            if (filter === "forked") {
              $scope.templates = plunks.query({
                url: url.api + "/plunks/forked"
              });
            } else if (filter === "own") {
              $scope.templates = plunks.query({
                url: url.api + "/plunks/remembered"
              });
            }
            return $scope.templates.page = 1;
          }
        });
      }
    });
  }
]);