var module;

module = angular.module("plunker.toolbar", ["plunker.visitor", "plunker.session", "plunker.downloader", "plunker.notifier", "plunker.panes", "plunker.url", "plunker.beautifier", "angularytics", "ui.bootstrap"]);

module.directive("plunkerToolbar", [
  "$location", "Angularytics", "session", "downloader", "notifier", "panes", "visitor", "url", "beautifier", function($location, Angularytics, session, downloader, notifier, panes, visitor, url, beautifier) {
    return {
      restrict: "E",
      scope: {},
      replace: true,
      template: "<div class=\"plunker-toolbar btn-toolbar\">\n  <div class=\"btn-group\" ng-show=\"session.isPlunkDirty() && (!session.plunk || session.plunk.isWritable())\">\n    <button ng-click=\"session.save() | trackEvent:'Plunk':'Save':'Toolbar'\" class=\"btn btn-primary\" tooltip-placement=\"bottom\" tooltip=\"Save your work as a new Plunk\">\n      <i class=\"icon-save\"></i><span class=\"shrink\"> Save</span>\n    </button>\n  </div>\n  <div class=\"btn-group\" ng-show=\"!session.isPlunkDirty() && (!session.plunk || session.plunk.isWritable())\">\n    <button ng-hide=\"session.plunk.frozen_version==session.plunk.history.length - 1 && !session.currentRevisionIndex\" ng-click=\"session.freeze() | trackEvent:'Plunk':'Freeze':'Toolbar'\" class=\"btn btn-default\" tooltip-placement=\"bottom\" tooltip=\"Set this version as the version other users will see. You can then keep saving new versions that only you can see.\">\n      <i class=\"icon-lock\"></i><span class=\"shrink\"> Freeze</span>\n    </button>\n    <button ng-show=\"session.plunk.frozen_version==session.plunk.history.length - 1 && !session.currentRevisionIndex\" ng-click=\"session.unfreeze() | trackEvent:'Plunk':'Unfreeze':'Toolbar'\" class=\"btn btn-default\" tooltip-placement=\"bottom\" tooltip=\"Unfreeze this plunk so that no revisions are hidden from other users.\">\n      <i class=\"icon-unlock\"></i><span class=\"shrink\"> Unfreeze</span>\n    </button>\n  </div>\n  <div class=\"btn-group\" ng-show=\"session.isSaved()\">\n    <button ng-click=\"session.fork() | trackEvent:'Plunk':'Fork':'Toolbar'\" class=\"btn\" tooltip-placement=\"bottom\" tooltip=\"Save your changes as a fork of this Plunk\">\n      <i class=\"icon-git-fork\"></i><span class=\"shrink\"> Fork</span>\n    </button>\n    <button ng-if=\"visitor.isMember()\" data-toggle=\"dropdown\" class=\"btn dropdown-toggle\" tooltip-placement=\"bottom\" tooltip=\"Fork and toggle the privacy of this Plunk\"><span class=\"caret\"></span></button>\n    <ul ng-if=\"visitor.isMember()\" class=\"dropdown-menu\" ng-switch on=\"session.private\">\n      <li ng-switch-when=\"false\"><a ng-click=\"session.fork({private: true}) | trackEvent:'Plunk':'Fork Private':'Toolbar'\">Fork to private plunk</a></li>\n      <li ng-switch-when=\"true\"><a ng-click=\"session.fork({private: false}) | trackEvent:'Plunk':'Fork Public':'Toolbar'\">Fork to public plunk</a></li>\n    </ul>\n  </div>\n  <div ng-show=\"session.plunk.isWritable() && session.plunk.isSaved()\" class=\"btn-group\">\n    <button ng-click=\"promptDestroy() | trackEvent:'Plunk':'Destroy':'Toolbar'\" class=\"btn btn-danger\" tooltip-placement=\"bottom\" tooltip=\"Delete the current plunk\">\n      <i class=\"icon-trash\"></i>\n    </button>\n  </div>\n  <div class=\"btn-group\">\n    <button ng-click=\"promptReset() | trackEvent:'Plunk':'Reset':'Toolbar'\" class=\"btn btn-success\" tooltip-placement=\"bottom\" tooltip=\"Create a new Plunk\">\n      <i class=\"icon-file\"></i><span class=\"shrink\"> New</span>\n    </button>\n    <button data-toggle=\"dropdown\" class=\"btn btn-success dropdown-toggle\" tooltip-placement=\"bottom\" tooltip=\"Create a new Plunk from a template\"><span class=\"caret\"></span></button>\n    <ul class=\"dropdown-menu\">\n      <li><a href=\"/edit/gist:1986619\">jQuery<a href=\"/edit/gist:1992850\" class=\"coffee\" title=\"In coffee-script\"><img src=\"/img/coffeescript-logo-small_med.png\"></a></a></li>\n      <li><a href=\"/edit/gist:2006604\">jQuery UI</a></li>\n      <li class=\"divider\"></li>\n      <li class=\"dropdown-submenu\">\n        <a tabindex=\"-1\" href=\"#\" title=\"Angular 1.x\">AngularJS</a>\n        <ul class=\"dropdown-menu\">\n          <li><a href=\"/edit/gist:3510140\">1.0.x<a href=\"/edit/gist:3189582\" class=\"coffee\" title=\"In coffee-script\"><img src=\"/img/coffeescript-logo-small_med.png\"></a></a></li>\n          <li><a href=\"/edit/gist:5301635\">1.0.x + Jasmine</a></li>\n          <li class=\"divider\"></li>\n          <li><a href=\"/edit/gist:3662702\">1.1.x (unstable)<a href=\"/edit/gist:3662696\" class=\"coffee\" title=\"In coffee-script\"><img src=\"/img/coffeescript-logo-small_med.png\"></a></a></li>\n          <li class=\"divider\"></li>\n          <li><a href=\"/edit/tpl:FrTqqTNoY8BEfHs9bB0f\">1.2.x<a href=\"/edit/tpl:9dz4TT6og6hHx9QAOBT3\" class=\"coffee\" title=\"In coffee-script\"><img src=\"/img/coffeescript-logo-small_med.png\"></a></a></li>\n          <li class=\"divider\"></li>\n          <li><a href=\"/edit/tpl:rfqcl9AHEoJZEEJxyNn2\">1.3.x<a href=\"/edit/tpl:RJc8D4Z6KMf74ffWOTn5\" class=\"coffee\" title=\"In coffee-script\"><img src=\"/img/coffeescript-logo-small_med.png\"></a></a></li>\n          <li class=\"divider\"></li>\n          <li><a href=\"/edit/tpl:8rFfZljYNl3z1A4LKSL2\">1.4.x<a href=\"/edit/tpl:zxQbqlOd9vSmkCLQm5ke\" class=\"coffee\" title=\"In coffee-script\"><img src=\"/img/coffeescript-logo-small_med.png\"></a></a></li>\n          <li class=\"divider\"></li>\n          <li><a href=\"/edit/tpl:CR2TtS1zz9wFGgsl5z2c\">1.5.x</a></li>\n          <li><a href=\"/edit/tpl:qvZ8Iri6jRUioBEDsa32\">1.5.x + Typescript</a></li>\n        </ul>\n      </li>\n      <li><a href=\"/edit/tpl:AvJOMERrnz94ekVua0u5\" title=\"Just Angular\">Angular</a></li>\n      <li class=\"divider\"></li>\n      <li class=\"dropdown-submenu\">\n        <a tabindex=\"-1\" href=\"#\">React.js</a>\n        <ul class=\"dropdown-menu\">\n          <li><a href=\"/edit/tpl:a3vkhunC1Na5BG6GY2Gf\">React.js</a></li>\n          <li><a href=\"/edit/tpl:wxQVHKHmyJVjcBJQsk6q\">React.js with addons</a></li>\n        </ul>\n      </li>\n      <li class=\"divider\"></li>\n      <li><a href=\"/edit/gist:2016721\">Bootstrap<a href=\"/edit/gist:2016721\" class=\"coffee\" title=\"In coffee-script\"><img src=\"/img/coffeescript-logo-small_med.png\"></a></a></li>\n      <li class=\"divider\"></li>\n      <li><a href=\"/edit/gist:2050713\">Backbone.js<a href=\"/edit/gist:2050746\" class=\"coffee\" title=\"In coffee-script\"><img src=\"/img/coffeescript-logo-small_med.png\"></a></a></li>\n      <li class=\"divider\"></li>\n      <li><a href=\"/edit/gist:3510115\">YUI</a></li>\n      <li class=\"divider\"></li>\n      <li><a href=\"/edit/tpl:tyvqGwgayf3COZGsB81s\">KendoUI</a></li>\n    </ul>\n  </div>\n  <div class=\"btn-group\">\n    <button ng-click=\"togglePreview() | trackEvent:'Multipane':panes.active.id=='preview'&&'Show Preview'||'Hide Preview':'Toolbar'\" class=\"btn btn-inverse\" ng-class=\"{active: panes.active.id=='preview'}\" ng-switch on=\"panes.active.id=='preview'\" tooltip-placement=\"bottom\" tooltip=\"Preview your work\">\n      <div ng-switch-when=\"false\">\n        <i class=\"icon-play\" />\n        <span class=\"shrink\">Run</span>\n      </div>\n      <div ng-switch-when=\"true\">\n        <i class=\"icon-stop\" />\n        <span class=\"shrink\">Stop</span>\n      </div>\n    </button>\n  </div>\n  <div class=\"btn-group pull-right\" ng-show=\"session.isSaved()\">\n    <a ng-href=\"{{url.embed}}/{{session.plunk.id}}/\" target=\"_blank\" class=\"btn\" tooltip-placement=\"bottom\" tooltip=\"Open the embedded view\">\n      <i class=\"icon-external-link\" />\n    </a>\n  </div>\n  <div class=\"btn-group pull-right\">\n    <button ng-click=\"triggerDownload() | trackEvent:'Plunk':'Download Zip':'Toolbar'\" class=\"btn\" tooltip-placement=\"bottom\" tooltip=\"Download your Plunk as a zip file\">\n      <i class=\"icon-download-alt\" />\n    </button>\n  </div>\n  <div class=\"btn-group pull-right\" ng-show=\"session.isSaved() && visitor.isMember()\">\n    <button ng-click=\"toggleFavorite() | trackEvent:'Plunk':'Star':'Toolbar'\" class=\"btn\" ng-class=\"{activated: session.plunk.thumbed, 'active': session.plunk.thumbed}\" tooltip-placement=\"bottom\" tooltip=\"Save this Plunk to your favorites\">\n      <i class=\"icon-star\" />\n    </button>\n  </div>\n  <div class=\"btn-group pull-right\" ng-show=\"session.isSaved() && visitor.isMember()\">\n    <button ng-click=\"toggleRemembered() | trackEvent:'Plunk':session.plunk.remembered && 'Remember' || 'Forget':'Toolbar'\" class=\"btn\" ng-class=\"{activated: session.plunk.remembered, 'active': session.plunk.remembered}\" tooltip-placement=\"bottom\" tooltip=\"Save this Plunk to your list of templates\">\n      <i class=\"icon-briefcase\" />\n    </button>\n  </div>\n  <div class=\"btn-group pull-right\">\n    <button ng-click=\"beautifier.beautify() | trackEvent:'Plunk':'Beautify':'Toolbar'\" class=\"btn\" ng-class=\"{disabled: !beautifier.isBeautifiable()}\" tooltip-placement=\"bottom\" tooltip=\"Beautify your code\">\n      <i class=\"icon-ok\" />\n    </button>\n  </div>\n</div>",
      link: function($scope, el, attrs) {
        $scope.session = session;
        $scope.panes = panes;
        $scope.visitor = visitor;
        $scope.url = url;
        $scope.beautifier = beautifier;
        $scope.promptReset = function() {
          if (session.isDirty() && !session.skipDirtyCheck) {
            return notifier.confirm("You have unsaved changes. This action will reset your plunk. Are you sure you would like to proceed?", {
              confirm: function() {
                return session.reset();
              }
            });
          } else {
            return session.reset();
          }
        };
        $scope.promptDestroy = function() {
          return notifier.confirm("Confirm Deletion", "Are you sure that you would like to delete this plunk?", {
            confirm: function() {
              return session.destroy();
            }
          });
        };
        $scope.triggerDownload = function() {
          var ref;
          return downloader.download(session.toJSON(), ((ref = session.plunk) != null ? ref.id : void 0) ? "plunk-" + session.plunk.id + ".zip" : "plunk.zip");
        };
        $scope.toggleFavorite = function() {
          if (session.plunk) {
            return session.plunk.star();
          }
        };
        $scope.toggleRemembered = function() {
          if (session.plunk) {
            return session.plunk.remember();
          }
        };
        return $scope.togglePreview == function() {
          var previewer;
          previewer = panes.findById("preview");
          return panes.toggle(previewer);
        };
      }
    };
  }
]);