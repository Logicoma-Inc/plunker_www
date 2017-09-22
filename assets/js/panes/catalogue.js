var module,
  slice = [].slice;

module = angular.module("plunker.panes");

module.requires.push("plunker.url");

module.requires.push("plunker.catalogue");

module.requires.push("plunker.notifier");

module.requires.push("plunker.pager");

module.requires.push("plunker.updater");

module.requires.push("plunker.session");

module.run([
  "$q", "$timeout", "panes", "url", "updater", "session", "catalogue", function($q, $timeout, panes, url, updater, session, catalogue) {
    return panes.add({
      id: "catalogue",
      icon: "book",
      size: "50%",
      order: 300,
      title: "Find and external libraries",
      description: "Find external libraries and add them to your plunk.",
      template: "<plunker-catalogue></plunker-catalogue>",
      link: function($scope, $el, attrs) {
        var recheck, updateAnnotations;
        $scope.$watch("pane.active", function(active) {
          if (active) {
            return $scope.popular || ($scope.popular = catalogue.findAll());
          }
        });
        $scope.$watch((function() {
          return session.getActiveBuffer();
        }), function(buffer) {
          delete $scope.markup;
          delete $scope.updater;
          delete $scope.clean;
          if (buffer.filename.match(/\.html$/)) {
            $scope.clean = buffer.content;
            $scope.updater = true;
            $scope.markup = updater.parse(buffer.content);
            return $scope.markup.findAllDependencies();
          }
        });
        $scope.$watch((function() {
          return session.getActiveBuffer().content;
        }), function(content) {
          return $scope.dirty = $scope.clean !== content;
        });
        recheck = function() {
          if ($scope.updater && $scope.dirty) {
            $scope.markup = updater.parse($scope.clean = session.getActiveBuffer().content);
            $scope.markup.findAllDependencies();
            return $scope.dirty = false;
          }
        };
        updateAnnotations = function(deps) {
          return console.log.apply(console, ["Updated", $scope.markup, session.getActiveBuffer()].concat(slice.call(arguments)));
        };
        setInterval(function() {
          return $scope.$apply(recheck);
        }, 2000);
        return recheck();
      }
    });
  }
]);

module.filter("sortBySemver", [
  function() {
    return function(arr) {
      return arr.sort(function(l, r) {
        return semver.rcompare(l.semver, r.semver);
      });
    };
  }
]);

module.directive("plunkerPackageBlock", [
  function() {
    return {
      restrict: "E",
      replace: true,
      scope: {
        'package': "=",
        click: "&",
        insert: "&",
        updater: "="
      },
      template: "<div class=\"plunker-package-block\">\n  <div class=\"package-header\">\n    <h4>\n      <ul class=\"package-meta inline pull-right\">\n        <li><i class=\"icon-download\"></i><span ng-bind=\"package.bumps | shorten\"></span></li>\n      </ul>\n      <a ng-click=\"click(package)\" ng-bind=\"package.name\"></a>\n      \n      <button class=\"btn btn-mini\" ng-class=\"{disabled: !updater}\" ng-disabled=\"!updater\" ng-click=\"insert(package)\" tooltip=\"Add the selected package and its dependencies to your active plunk\">\n        <i class=\"icon-magic\"></i>\n      </button>\n\n      <ul class=\"package-versions inline\">\n        <li ng-repeat=\"version in package.versions | sortBySemver | limitTo:3\">\n          <a class=\"label\" ng-class=\"{'label-warning': version.unstable}\" ng-click=\"click({package: package, version: version})\" ng-bind=\"version.semver\"></a>\n        </li>\n        <li class=\"dropdown\" ng-show=\"package.versions.length > 3\">\n          <a class=\"more dropdown-toggle\">More...</a>\n          <ul class=\"dropdown-menu\">\n            <li ng-repeat=\"version in package.versions | sortBySemver | limitTo:3 - package.versions.length\">\n              <a ng-click=\"click({package: package, version: version})\" ng-bind=\"version.semver\"></a>\n            </li>\n          </ul>\n        </li>\n      </ul>\n    </h4>\n  </div>\n  <p class=\"package-description\" ng-bind=\"package.description\"></p>\n\n</div>",
      link: function($scope, $el, attrs) {}
    };
  }
]);

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

module.controller("plunkerCatalogueController", [
  "$scope", "catalogue", "session", "visitor", function($scope, catalogue, session, visitor) {
    var state;
    $scope.state = state = this;
    $scope.visitor = visitor;
    $scope.moveTo = state.moveTo = function(view) {
      return state.view = view;
    };
    $scope.goHome = state.goHome = function() {
      $scope.moveTo("popular");
      $scope.popular.refresh();
      return $scope.query = "";
    };
    $scope.openPackages = state.openPackages = function() {
      $scope.moveTo("dependencies");
      return $scope.query = "";
    };
    $scope.refreshDependencies = state.updateDependencies = function() {
      if ($scope.markup) {
        $scope.markup.parse($scope.clean = session.getActiveBuffer().content);
      }
      $scope.markup.findAllDependencies();
      $scope.moveTo("dependencies");
      return $scope.query = "";
    };
    $scope.updateInclude = state.updateInclude = function(entry, verDef) {
      var child, i, len, ref;
      ref = entry.children;
      for (i = 0, len = ref.length; i < len; i++) {
        child = ref[i];
        $scope.markup.updateEntry(child);
      }
      $scope.markup.updateEntry(entry, verDef);
      $scope.markup.parse($scope.clean = session.activeBuffer.content = $scope.markup.toHtml());
      return $scope.markup.findAllDependencies();
    };
    $scope.updateAll = state.updateAll = function() {
      var entry, i, len, ref;
      ref = $scope.markup.obsolete;
      for (i = 0, len = ref.length; i < len; i++) {
        entry = ref[i];
        $scope.markup.updateEntry(entry);
      }
      $scope.markup.parse($scope.clean = session.activeBuffer.content = $scope.markup.toHtml());
      return $scope.markup.findAllDependencies();
    };
    $scope.insertPackage = state.insertPackage = function(pkg, verDef) {
      var required, semver;
      semver = (verDef != null ? verDef.semver : void 0) || "*";
      required = pkg.name + "@" + semver;
      pkg.bump();
      return $scope.markup.addRequired(required).then($scope.updateInclude);
    };
    $scope.search = state.search = function() {
      $scope.moveTo("search");
      $scope.query = $scope.searchTerm;
      return $scope.results = catalogue.search($scope.query);
    };
    $scope.createPackage = state.createPackage = function() {
      $scope.moveTo("package.edit");
      return $scope["package"] = null;
    };
    $scope.createPackageVersion = state.createPackageVersion = function(pkg) {
      $scope.moveTo("package.version.edit");
      $scope["package"] = pkg;
      return $scope.currentVersion = null;
    };
    $scope.editPackage = state.editPackage = function(pkg) {
      $scope.moveTo("package.edit");
      return $scope["package"] = pkg;
    };
    $scope.destroyPackage = state.destroyPackage = function(pkg) {
      return pkg.destroy().then(function() {
        return state.goHome();
      });
    };
    $scope.editPackageVersion = state.editPackageVersion = function(pkg, version) {
      $scope.moveTo("package.version.edit");
      $scope["package"] = pkg;
      return $scope.currentVersion = version || pkg.getMatchingVersion();
    };
    $scope.destroyPackageVersion = state.destroyPackageVersion = function(pkg, version) {
      return pkg.destroyVersion(version).then(function(pkg) {
        return state.editPackage(pkg);
      });
    };
    $scope.openVersion = state.openVersion = function(pkg, version) {
      $scope.moveTo("package.version");
      $scope["package"] = pkg;
      return $scope.currentVersion = version || pkg.getMatchingVersion();
    };
    return $scope.moveTo("popular");
  }
]);

module.directive("plunkerCatalogue", [
  function() {
    return {
      restrict: "E",
      replace: true,
      controller: "plunkerCatalogueController",
      template: "<div class=\"plunker-catalogue\">\n  <form class=\"plunker-searchbar\" ng-class=\"{markup: updater}\" ng-submit=\"search()\">\n    <div ng-show=\"updater\" class=\"pull-right\">\n      <a ng-hide=\"dirty\" class=\"label updates\" ng-class=\"{'label-important': markup.obsolete.length}\" ng-click=\"openPackages()\" ng-bind=\"markup.dependencies.length | number\"></a>\n      <a ng-show=\"dirty\" class=\"label updates\" ng-click=\"refreshDependencies()\"><i class=\"icon-refresh\"></i></a>\n    </div>\n    <a class=\"btn pull-left\" ng-click=\"goHome()\"><i class=\"icon-home\"></i></a>\n    <div class=\"plunker-searchbox input-append\">\n      <div class=\"input-wrapper\">\n        <input class=\"\" type=\"text\" ng-model=\"searchTerm\" placeholder=\"Search packages...\" />\n      </div>\n      <button class=\"btn\"><i class=\"icon-search\"></i></button>\n    </div>\n  </form>\n  <div ng-switch on=\"state.view\">\n    <div ng-switch-when=\"dependencies\">\n      <div class=\"sub-header\">\n        <small class=\"pull-right\"><a ng-show=\"markup.obsolete.length\" ng-click=\"updateAll()\">\n          <i class=\"icon-refresh\"></i>\n          Update all\n        </a></small>\n        <h3>Packages in the current file</h3>\n      </div>\n      <section ng-show=\"markup.obsolete.length\">\n        <h4>Out of date</h4>\n        <ul>\n          <li class=\"entry\" ng-repeat=\"entry in markup.obsolete\">\n            <strong ng-bind=\"entry.ref.name\"></strong>\n            <span ng-show=\"entry.currentVer\" ng-bind-template=\"@{{entry.currentVer}} is out of date\"></span>\n            <span ng-hide=\"entry.currentVer\"> is required, but not included</span>\n            <div class=\"pull-right btn-group\">\n              <button ng-click=\"updateInclude(entry)\" class=\"btn btn-success btn-small\">\n                <i class=\"icon-refresh\"></i> Update to {{entry.ref.ver.semver}}\n              </button>\n              <button class=\"btn btn-success btn-small dropdown-toggle\" data-toggle=\"dropdown\">\n                <span class=\"caret\"></span>\n              </button>\n              <ul class=\"dropdown-menu\">\n                <li ng-repeat=\"verDef in entry.ref.pkg.getMatchingVersions(entry.ref.range) | sortBySemver\">\n                  <a ng-click=\"updateInclude(entry, verDef)\">Update to {{verDef.semver}}</a>\n                </li>\n              </ul>\n            </div>\n          </li>\n        </ul>\n      </section>\n      <section ng-show=\"markup.current.length\">\n        <h4>Up to date</h4>\n        <ul>\n          <li class=\"entry\" ng-repeat=\"entry in markup.current\">\n            <strong ng-bind=\"entry.ref.name\"></strong>\n            <span ng-bind-template=\"@{{entry.currentVer}} is up to date\"></span>\n            <div class=\"pull-right btn-group\">\n              <button ng-click=\"updateInclude(entry)\" class=\"btn btn-small\">\n                <i class=\"icon-refresh\"></i> Update to {{entry.ref.ver.semver}}\n              </button>\n              <button class=\"btn btn-small dropdown-toggle\" data-toggle=\"dropdown\">\n                <span class=\"caret\"></span>\n              </button>\n              <ul class=\"dropdown-menu\">\n                <li ng-repeat=\"verDef in entry.ref.pkg.getMatchingVersions(entry.ref.range) | sortBySemver\">\n                  <a ng-click=\"updateInclude(entry, verDef)\">Update to {{verDef.semver}}</a>\n                </li>\n              </ul>\n            </div>\n          </li>\n        </ul>\n      </section>\n    </div>\n    <div ng-switch-when=\"popular\">\n      <div class=\"sub-header\">\n        <h3>\n          <small ng-show=\"visitor.user.login\" class=\"pull-right\"><a ng-click=\"createPackage()\">Add new...</a></small>\n          Popular packages\n        </h3>\n      </div>\n      <plunker-package-block insert=\"insertPackage(package)\" updater=\"updater\" click=\"openVersion(package, version)\" package=\"package\" ng-repeat=\"package in popular\"></plunker-package-block>\n      <plunker-pager nolink=\"true\" collection=\"popular\" nav=\"popular.refresh(url)\"></plunker-pager>\n    </div>\n    <div ng-switch-when=\"search\">\n      <div class=\"sub-header\">\n        <h3>\n          <small ng-show=\"visitor.user.login\" class=\"pull-right\"><a ng-click=\"createPackage()\">Add new...</a></small>\n          Search results: <span ng-bind=\"query\"></span>\n        </h3>\n      </div>\n      <plunker-package-block insert=\"insertPackage(package)\" updater=\"updater\" click=\"openVersion(package, version)\" package=\"package\" ng-repeat=\"package in results\"></plunker-package-block>\n      <p ng-hide=\"!results || results.length\">No results found for {{query}}.</p>\n      <p ng-hide=\"results && !results.loading\">Searching for {{query}}.</p>\n    </div>\n    <div ng-switch-when=\"package.version\">\n      <div class=\"sub-header\">\n        <div class=\"package-version-toggle dropdown pull-right\">\n          <div class=\"dropdown-toggle\"><span ng-bind=\"currentVersion.semver\"></span><span ng-show=\"currentVersion.unstable\"> (unstable)</span><span class=\"caret\"></span></div>\n          <ul class=\"dropdown-menu\">\n            <li ng-class=\"{active: version == currentVersion}\" ng-repeat=\"version in package.versions | sortBySemver\">\n              <a ng-click=\"openVersion(package, version)\" ng-bind=\"version.semver + (version.unstable && ' (unstable)' || '')\"></a>\n            </li>\n          </ul>\n        </div>\n        <h3>{{prefix}}<a ng-click=\"openVersion(package, version)\" ng-bind=\"package.name\"></a></h3>\n      </div>\n      <p ng-bind=\"package.description\"></p>\n      <ul class=\"package-meta inline\">\n        <li ng-show=\"package.homepage\"><i class=\"icon-link\"></i><a ng-href=\"{{package.homepage}}\">Website</a></li>\n        <li ng-show=\"package.documentation\"><i class=\"icon-info-sign\"></i><a ng-href=\"{{package.documentation}}\">Docs</a></li>\n      </ul>\n      <details class=\"package-scripts\" ng-show=\"currentVersion.scripts.length\">\n        <summary>Scripts <span ng-bind-template=\"({{currentVersion.scripts.length}})\"></span></summary>\n        <ol>\n          <li ng-repeat=\"url in currentVersion.scripts\"><code ng-bind=\"url\"></code></li>\n        </ol>\n      </details>\n      <details class=\"package-scripts\" ng-show=\"currentVersion.styles.length\">\n        <summary>Stylesheets <span ng-bind-template=\"({{currentVersion.styles.length}})\"></span></summary>\n        <ol>\n          <li ng-repeat=\"url in currentVersion.styles\"><code ng-bind=\"url\"></code></li>\n        </ol>\n      </details>\n      <details class=\"package-scripts\" ng-show=\"currentVersion.dependencies.length\">\n        <summary>Dependencies <span ng-bind-template=\"({{currentVersion.dependencies.length}})\"></span></summary>\n        <ol>\n          <li ng-repeat=\"dependency in currentVersion.dependencies\"><strong ng-bind=\"dependency.name\"></strong> - <code ng-bind=\"dependency.range\"></code></li>\n        </ol>\n      </details>\n      <ul class=\"package-ops inline pull-right\">\n        <li ng-show=\"updater\">\n          <button class=\"btn btn-small\" ng-click=\"insertPackage(package, currentVersion)\" tooltip=\"Add the selected package and its dependencies to your active plunk\">\n            <i class=\"icon-magic\"></i>\n            Add\n          </button>\n        </li>\n        <li ng-show=\"package.maintainer\">\n          <button class=\"btn btn-small btn-primary\" ng-click=\"editPackage(package)\" tooltip=\"Edit this package\">\n            <i class=\"icon-pencil\"></i>\n            Edit\n          </button>\n        </li>\n      </ul>\n    </div>\n    <div ng-switch-when=\"package.edit\">\n      <div class=\"sub-header\">\n        <h3>{{package.name && \"Edit: \" || \"Create package\" }}<a ng-click=\"openVersion(package, currentVersion)\" ng-bind=\"package.name\"></a></h3>\n      </div>\n      <package-editor package=\"package\"></package-editor>\n    </div>\n    <div ng-switch-when=\"package.version.edit\">\n      <div class=\"sub-header\">\n        <h3><a ng-click=\"openVersion(package, currentVersion)\" ng-bind=\"package.name\"></a> - {{currentVersion.semver || \"Create version:\" }}</h3>\n      </div>\n      <version-editor package=\"package\" version=\"currentVersion\"></version-editor>\n    </div>\n  </div>\n</div>"
    };
  }
]);

module.directive("packageEditor", [
  "catalogue", "notifier", function(catalogue, notifier) {
    return {
      restrict: "E",
      replace: true,
      require: "^plunkerCatalogue",
      scope: {
        'package': "="
      },
      template: "<form class=\"package-editor\" ng-submit=\"save()\">\n  <label>Package name:\n    <input ng-disabled=\"package.name\" ng-model=\"editing.name\" placeholder=\"package_name\" required>\n  </label>\n  <label>Description:\n    <textarea ng-model=\"editing.description\" placeholder=\"Package description...\"></textarea>\n  </label>\n  <label>Website:\n    <input ng-model=\"editing.homepage\" placeholder=\"http://homepage\">\n  </label>\n  <label>Documentation:\n    <input ng-model=\"editing.documentation\" placeholder=\"http://documentation\">\n  </label>\n  <div ng-show=\"package.name\">\n    <label>Versions:</label>\n    <ul class=\"\" ng-show=\"package.name\">\n      <li ng-repeat=\"version in editing.versions | sortBySemver\">\n        <a ng-click=\"controller.editPackageVersion(package, version)\" ng-bind=\"version.semver\"></a>\n      </li>\n      <li class=\"add-new\">\n        <a ng-click=\"controller.createPackageVersion(package)\">Add new...</a>\n      </li>\n    </ul>\n  </div>\n  <ul class=\"package-ops inline pull-right\">\n    <li>\n      <button class=\"btn btn-primary\">Save</button>\n    </li>\n    <li>\n      <button class=\"btn\" type=\"button\" ng-click=\"cancel()\">Cancel</button>\n    </li>\n    <li ng-show=\"package.name\">\n      <button class=\"btn btn-danger\" type=\"button\" ng-click=\"destroy()\">Delete</button>\n    </li>\n  </ul>\n</form>",
      link: function($scope, $el, attrs, controller) {
        var ref;
        $scope.controller = controller;
        if ((ref = $scope["package"]) != null) {
          delete ref.$$v;
        }
        $scope.editing = angular.copy($scope["package"] || {});
        $scope.save = function() {
          if ($scope["package"]) {
            return $scope["package"].save($scope.editing).then(function(pkg) {
              return controller.openVersion(pkg);
            });
          } else {
            return catalogue.create($scope.editing).then(function(pkg) {
              return controller.createPackageVersion(pkg);
            });
          }
        };
        $scope.cancel = function() {
          if ($scope["package"]) {
            return controller.openVersion($scope["package"]);
          } else {
            return controller.goHome();
          }
        };
        return $scope.destroy = function() {
          if ($scope["package"]) {
            return notifier.confirm("Are you sure you would like to delete this package?", {
              confirm: function() {
                return controller.destroyPackage($scope["package"]).then(function(pkg) {
                  return controller.goHome();
                });
              }
            });
          }
        };
      }
    };
  }
]);

module.directive("versionEditor", [
  "catalogue", function(catalogue) {
    return {
      restrict: "E",
      replace: true,
      require: "^plunkerCatalogue",
      scope: {
        version: "=",
        'package': "="
      },
      template: "<form name=\"versionEditor\" class=\"version-editor\" ng-submit=\"save()\">\n  <label>Semver:\n    <input class=\"input-small\" ng-disabled=\"version.semver\" ng-model=\"editing.semver\" placeholder=\"0.0.1\" semver required>\n    <label class=\"inline-checkbox\">\n      <input type=\"checkbox\" ng-model=\"editing.unstable\">\n      Unstable\n    </label>\n  </label>\n  <label>Scripts:</label>\n  <ul class=\"editable-listing\">\n    <li ng-repeat=\"url in editing.scripts\">\n      <ul class=\"inline pull-right\">\n        <li><a ng-click=\"moveUp(editing.scripts, $index)\"><i class=\"icon-arrow-up\"></i></a></li>\n        <li><a ng-click=\"moveDown(editing.scripts, $index)\"><i class=\"icon-arrow-down\"></i></a></li>\n        <li><a ng-click=\"remove('script', editing.scripts, $index)\"><i class=\"icon-trash\"></i></a></li>\n      </ul>\n      <a class=\"existing-element\" ng-click=\"editUrl('script', editing.scripts, $index)\" ng-bind=\"url\"></a>\n    </li>\n    <li class=\"add-new\">\n      <a ng-click=\"addNewElement('script', editing.scripts)\">Add new...</a>\n    </li>\n  </ul>\n  <label>Styles:</label>\n  <ul class=\"editable-listing\">\n    <li ng-repeat=\"url in editing.styles\">\n      <ul class=\"inline pull-right\">\n        <li><a ng-click=\"moveUp(editing.styles, $index)\"><i class=\"icon-arrow-up\"></i></a></li>\n        <li><a ng-click=\"moveDown(editing.styles, $index)\"><i class=\"icon-arrow-down\"></i></a></li>\n        <li><a ng-click=\"remove('script', editing.styles, $index)\"><i class=\"icon-trash\"></i></a></li>\n      </ul>\n      <a class=\"existing-element\" ng-click=\"editUrl('script', editing.styles, $index)\" ng-bind=\"url\"></a>\n    </li>\n    <li class=\"add-new\">\n      <a class=\"add-new\" ng-click=\"addNewElement('script', editing.styles)\">Add new...</a>\n    </li>\n  </ul>\n  <label>Dependencies:</label>\n  <ul class=\"editable-listing\">\n    <li ng-repeat=\"dep in editing.dependencies\">\n      <ul class=\"inline pull-right\">\n        <li><a ng-disabled=\"$first\" ng-click=\"moveUp(editing.dependencies, $index)\"><i class=\"icon-arrow-up\"></i></a></li>\n        <li><a ng-disabled=\"$last\" ng-click=\"moveDown(editing.dependencies, $index)\"><i class=\"icon-arrow-down\"></i></a></li>\n        <li><a ng-click=\"remove('dependency', editing.dependencies, $index)\"><i class=\"icon-trash\"></i></a></li>\n      </ul>\n      <a class=\"existing-element\" ng-click=\"editDependency('dependency', editing.dependencies, $index)\" ng-bind-template=\"{{dep.name}} @ {{dep.range}}\"></a>\n    </li>\n    <li class=\"add-new\">\n      <a ng-click=\"addDependency()\">Add new...</a>\n    </li>\n  </ul>\n  <ul class=\"package-ops inline pull-right\">\n    <li>\n      <button class=\"btn btn-primary\">Save</button>\n    </li>\n    <li>\n      <button class=\"btn\" type=\"button\" ng-click=\"cancel()\">Cancel</button>\n    </li>\n    <li ng-show=\"package.name\">\n      <button class=\"btn btn-danger\" type=\"button\" ng-click=\"destroy()\">Delete</button>\n    </li>\n  </ul>\n</form>",
      link: function($scope, $el, attrs, controller) {
        var ref;
        $scope.controller = controller;
        if ((ref = $scope.version) != null) {
          delete ref.$$v;
        }
        $scope.editing = angular.copy($scope.version) || {
          scripts: [],
          styles: [],
          dependencies: []
        };
        $scope.editUrl = function(type, list, index) {
          var value;
          value = prompt("Enter the updated " + type + ":", list[index]);
          if (value) {
            return list[index] = value;
          }
        };
        $scope.addNewElement = function(type, list) {
          var value;
          value = prompt("Enter the new " + type + ":");
          if (value) {
            return list.push(value);
          }
        };
        $scope.addDependency = function() {
          var name, range, ref1, value;
          value = prompt("Enter the new dependency (as package@semver-range):");
          if (value) {
            ref1 = value.split("@").concat(["*"]), name = ref1[0], range = ref1[1];
            return $scope.editing.dependencies.push({
              name: name,
              range: range
            });
          }
        };
        $scope.moveUp = function(list, index) {
          var prev, ref1;
          if (index) {
            prev = index - 1;
            return ref1 = [list[index], list[prev]], list[prev] = ref1[0], list[index] = ref1[1], ref1;
          }
        };
        $scope.moveDown = function(list, index) {
          var next, ref1;
          if (index < list.length - 1) {
            next = index + 1;
            return ref1 = [list[index], list[next]], list[next] = ref1[0], list[index] = ref1[1], ref1;
          }
        };
        $scope.remove = function(type, list, index) {
          if (confirm("Are you sure that you would like to remove the " + type + " " + list[index] + "?")) {
            return list.splice(index, 1);
          }
        };
        $scope.save = function() {
          if ($scope.version) {
            return $scope["package"].updateVersion($scope.editing).then(function(pkg) {
              controller.openVersion(pkg, $scope.editing);
            });
          } else {
            return $scope["package"].addVersion($scope.editing).then(function(pkg) {
              controller.openVersion(pkg, $scope.editing);
            });
          }
        };
        $scope.cancel = function() {
          return controller.editPackageVersion($scope["package"], $scope.version);
        };
        return $scope.destroy = function() {
          return controller.destroyPackageVersion($scope["package"], $scope.version).then(function(pkg) {
            return controller.openVersion(pkg);
          });
        };
      }
    };
  }
]);