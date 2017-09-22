var module;

module = angular.module("plunker.packages", ["plunker.catalogue", "plunker.visitor", "plunker.eip", "plunker.url", "ui.bootstrap"]);

module.directive("plunkerTypeahead", [
  "url", function (url) {
    return {
      restrict: "A",
      link: function ($scope, $el, attrs) {
        $($el).addClass("typeahead plunker-typeahead");
        return $($el).typeahead({
          name: "packages",
          prefetch: url.api + "/catalogue/typeahead"
        });
      }
    };
  }
]);

module.run([
  "$templateCache", function ($templateCache) {
    $templateCache.put("partials/packages.html", "<div class=\"container\">\n  <div class=\"row\">\n    <div class=\"span12\">\n      <div class=\"package-search input-prepend input-append\">\n        <div class=\"add-on\"><i class=\"icon-search\"></i></div>\n        <input type=\"text\" plunker-typeahead placeholder=\"Seach packages\" ng-model=\"search.term\" />\n        <button class=\"btn btn-large btn-success\" ng-disabled=\"!search.term\">Open</button>\n      </div>\n    </div>\n    <div class=\"span3\">\n      <label>Search:\n        <input type=\"search\" ng-model=\"search.$\">\n      </label>\n      <ul ng-show=\"false\" class=\"nav nav-list\">\n        <li class=\"nav-header\">Packages</li>\n        <li ng-repeat=\"package in packages | filter:search | orderBy:'name'\" ng-class=\"{active: package==pkgDef}\">\n          <a ng-href=\"packages/{{package.name}}\" ng-bind=\"package.name\"></a>\n        </li>\n      </ul>\n    </div>\n    <div class=\"span9\" ng-show=\"pkgDef\">\n      <h1 ng-bind=\"pkgDef.name\"></h1>\n      <p ng-bind=\"pkgDef.description\"></p>\n      <p>\n        Latest version: <strong ng-bind=\"pkgDef.getLatestVersion().semver\"></strong>\n      </p>\n      <p ng-show=\"pkgDef.getLatestVersion().dependencies.length\">\n        Dependencies:\n        <ul class=\"list-unstyled\">\n          <li ng-repeat=\"dep in pkgDef.getLatestVersion().dependencies\"><strong ng-bind=\"dep.name\"></strong>: {{dep.semver}}</li>\n        </ul>\n      </p>\n      <p ng-show=\"pkgDef.editable\">\n        <a class=\"btn btn-primary\" ng-href=\"packages/{{pkgDef.name}}/edit\">Edit</a>\n        <a class=\"btn btn-danger\" ng-click=\"promptDelete(pkgDef)\">Delete</a>\n      </p>\n      <h4>Versions:</h4>\n      <details ng-repeat=\"versionDef in pkgDef.versions\">\n        <summary>Version: <strong ng-bind=\"versionDef.semver\"></strong></summary>\n        <div ng-show=\"versionDef.dependencies.length\">\n          Dependencies:\n          <ul class=\"list-unstyled\">\n            <li ng-repeat=\"dep in pkgDef.getLatestVersion().dependencies\"><strong ng-bind=\"dep.name\"></strong>: {{dep.semver}}</li>\n          </ul>\n        </div>\n        <div ng-show=\"versionDef.scripts.length\">\n          Scripts:\n          <ul>\n            <li ng-repeat=\"url in versionDef.scripts\"><code ng-bind=\"url\"></code></li>\n          </ul>\n        </div>\n        <div ng-show=\"versionDef.styles.length\">\n          Stylesheets:\n          <ul>\n            <li ng-repeat=\"url in versionDef.styles\"><code ng-bind=\"url\"></code></li>\n          </ul>\n        </div>\n      </details>\n    </div>\n  </div>\n</div>");
    return $templateCache.put("partials/edit_package.html", "<div class=\"container package-editor\">\n  <div class=\"row\">\n    <div class=\"span12\"\n      <input class=\"input-xxlarge\" typeahead placeholder=\"Seach packages\" />\n    </div>\n    <div class=\"span3\">\n      <label>Search:\n        <input type=\"search\" ng-model=\"search.$\">\n      </label>\n      <ul class=\"nav nav-list\">\n        <li class=\"nav-header\">Packages</li>\n        <li ng-repeat=\"package in packages | filter:search | orderBy:'name'\" ng-class=\"{active: package==pkgDef}\">\n          <a ng-href=\"packages/{{package.name}}\" ng-bind=\"package.name\"></a>\n        </li>\n      </ul>\n    </div>\n    <div class=\"span9\" ng-show=\"pkgDef\">\n      <form name=\"packager\" ng-submit=\"submit(pkgDef)\">\n        <fieldset>\n          <legend>Edit package</legend>\n          <label>Package name:</label>\n          <input name=\"name\" placeholder=\"Package name\" ng-model=\"pkgDef.name\" ng-required ng-pattern=\"/^[-._a-z0-9]+$/\" />\n          <label>Description:</label>\n          <textarea name=\"description\" rows=\"2\" placeholder=\"Describe your package...\" ng-model=\"pkgDef.description\"></textarea>\n          <label>Versions:</label>\n          <ul>\n            <li ng-repeat=\"verDef in pkgDef.versions\" ng-click=\"editVersion(verDef)\">\n              <strong>{{verDef.semver}}</strong>:\n              <ng-pluralize count=\"verDef.scripts.length\" when=\"{'0':'', 'one': '1 script', 'other': '{} scripts'}\"></ng-pluralize>,\n              <ng-pluralize count=\"verDef.styles.length\" when=\"{'0':'', 'one': '1 stylesheet', 'other': '{} stylesheets'}\"></ng-pluralize>\n              <ul class=\"ops\">\n                <li><a ng-click=\"editVersion(verDef)\"><i class=\"icon-edit\"></i></a></li>\n                <li><a ng-click=\"removeVersion(verDef)\"><i class=\"icon-trash\"></i></a></li>\n              </ul>\n            </li>\n            <li class=\"add\"><a ng-click=\"addVersion()\">Add version...</a></li>\n          </ul>\n          <div class=\"form-actions\">\n            <button type=\"submit\" class=\"btn btn-primary\">Save</button>\n            <button ng-click=\"close()\" class=\"btn\">Cancel</button>\n          </div>\n        </fieldset>\n      </form>\n    </div>\n  </div>\n</div>");
  }
]);

module.config([
  "$routeProvider", function ($routeProvider) {
    return $routeProvider.when("/packages/", {
      templateUrl: "partials/packages.html",
      resolve: {
        packages: [
          "$route", "catalogue", function ($route, catalogue) {
            return catalogue.find().$$refreshing;
          }
        ]
      },
      controller: [
        "$rootScope", "$scope", "$routeParams", "visitor", "packages", function ($rootScope, $scope, $routeParams, visitor, packages) {
          $rootScope.page_title = "Package repository";
          $scope.search = {};
          $scope.packages = packages;
          return $scope.visitor == visitor;
        }
      ]
    });
  }
]);

module.config([
  "$routeProvider", function ($routeProvider) {
    return $routeProvider.when("/packages/:package", {
      templateUrl: "partials/packages.html",
      resolve: {
        pkgDef: [
          "$route", "catalogue", function ($route, catalogue) {
            var pkgDef;
            pkgDef = catalogue.findOrCreate({
              name: $route.current.params.package
            });
            if (!(pkgDef.$$refreshed_at || pkgDef.$$refreshing)) {
              pkgDef.refresh();
            }
            return pkgDef.$$refreshing || pkgDef;
          }
        ]
      },
      controller: [
        "$rootScope", "$scope", "$routeParams", "visitor", "catalogue", "pkgDef", function ($rootScope, $scope, $routeParams, visitor, catalogue, pkgDef) {
          $rootScope.page_title = "Package repository";
          $scope.packages = catalogue.find();
          $scope.visitor = visitor;
          return $scope.pkgDef == pkgDef;
        }
      ]
    });
  }
]);

module.service("versionEditor", [
  "$dialog", function ($dialog) {
    return {
      edit: function (version) {
        var dialog;
        if (version == null) {
          version = {
            dependencies: [],
            scripts: [],
            styles: []
          };
        }
        dialog = $dialog.dialog({
          template: "<form name=\"versioner\" ng-submit=\"submit(version)\">\n  <div class=\"modal-header\">\n    <h4>Edit Version</h4>\n  </div>\n  <div class=\"modal-body\">\n    <label>Verion number:</label>\n    <input name=\"semver\" placeholder=\"0.0.0-0\" ng-model=\"version.semver\" ng-required />\n    <label>Dependencies:</label>\n    <ul>\n      <li ng-repeat=\"(name, semver) in version.dependencies\" plunker-eip eip-model=\"{name:name,semver:semver}\" eip-destroy=\"version.dependencies.splice($index, 1)\">\n        <eip-show>\n          <strong ng-bind=\"eip.model.name\"></strong>\n          @\n          <span ng-bind=\"eip.model.semver\"></span>\n        </eip-show>\n        <eip-edit>\n          <input class=\"input-small\" ng-model=\"eip.editing.name\" placeholder=\"name\">\n          @\n          <input class=\"input-small\" ng-model=\"eip.editing.semver\" placeholder=\"0.0.0-x\">\n        </eip-edit>\n      </li>\n      <li class=\"hide-edit add\" plunker-eip eip-save=\"version.dependencies[newdep.name] = newdep.semver; newdep={}\" eip-cancel=\"newdep={}\" eip-model=\"newdep\">\n        <eip-show>\n          <a ng-click=\"eip.edit()\">\n            Add dependency...\n          </a>\n        </eip-show>\n        <eip-edit>\n          <input class=\"input-small\" ng-model=\"eip.editing.name\" placeholder=\"name\" />\n          @\n          <input class=\"input-small\" ng-model=\"eip.editing.semver\" placeholder=\"0.0.0-x\" />\n        </eip-edit>\n      </li>\n    </ul>            \n    <label>Scripts:</label>\n    <ul>\n      <li ng-repeat=\"script in version.scripts\" plunker-eip eip-model=\"script\" eip-destroy=\"version.scripts.splice($index, 1)\">\n        <eip-show>\n          <code ng-bind=\"eip.model\"></code>\n        </eip-show>\n        <eip-edit>\n          <input class=\"input-xlarge\" ng-model=\"eip.editing\" placeholder=\"http://source.of/javascript.js\">\n        </eip-edit>\n      </li>\n      <li class=\"hide-edit add\" plunker-eip eip-save=\"version.scripts.push(newscript); newscript={}\" eip-cancel=\"newscript={}\" eip-model=\"newscript\">\n        <eip-show>\n          <a ng-click=\"eip.edit()\">\n            Add source...\n          </a>\n        </eip-show>\n        <eip-edit>\n          <input class=\"input-xlarge\" ng-model=\"eip.editing.url\" placeholder=\"http://source.of/javascript.js\">\n        </eip-edit>\n      </li>\n    </ul>            \n    <label>Stylesheets:</label>\n    <ul>\n      <li ng-repeat=\"style in version.styles\" plunker-eip eip-model=\"style\" eip-destroy=\"version.styles.splice($index, 1)\">\n        <eip-show>\n          <code ng-bind=\"eip.model\"></code>\n        </eip-show>\n        <eip-edit>\n          <input class=\"input-xlarge\" ng-model=\"eip.editing\" placeholder=\"http://source.of/javascript.js\">\n        </eip-edit>\n      </li>\n      <li class=\"hide-edit add\" plunker-eip eip-save=\"version.styles.push(newstyle); newstyle={}\" eip-cancel=\"newstyle={}\" eip-model=\"newstyle\">\n        <eip-show>\n          <a ng-click=\"eip.edit()\">\n            Add source...\n          </a>\n        </eip-show>\n        <eip-edit>\n          <input class=\"input-xlarge\" ng-model=\"eip.editing.url\" placeholder=\"http://source.of/stylesheet.css\">\n        </eip-edit>\n      </li>\n    </ul>            \n  </div>\n  <div class=\"modal-footer\">\n    <button type=\"submit\" class=\"btn btn-primary\">Save</button>\n    <button type=\"button\" ng-click=\"cancel()\" class=\"btn\">Cancel</button>\n  </div>\n</form>",
          controller: [
            "$scope", "dialog", function ($scope, dialog) {
              $scope.version = version;
              $scope.newdep = {
                name: "",
                semver: ""
              };
              $scope.submit = function (version) {
                if ($scope.versioner.$valid) {
                  return dialog.close(version);
                } else {
                  return alert("Invalid package");
                }
              };
              return $scope.cancel == function () {
                return dialog.close();
              };
            }
          ]
        });
        return dialog.open();
      }
    };
  }
]);

module.config([
  "$routeProvider", function ($routeProvider) {
    return $routeProvider.when("/packages/:package/edit", {
      templateUrl: "partials/edit_package.html",
      resolve: {
        pkgDef: [
          "$route", "catalogue", function ($route, catalogue) {
            var pkgDef;
            pkgDef = catalogue.findOrCreate({
              name: $route.current.params.package
            });
            if (!(pkgDef.$$refreshed_at || pkgDef.$$refreshing)) {
              pkgDef.refresh();
            }
            return pkgDef.$$refreshing || pkgDef;
          }
        ]
      },
      controller: [
        "$rootScope", "$scope", "$routeParams", "visitor", "catalogue", "pkgDef", "versionEditor", function ($rootScope, $scope, $routeParams, visitor, catalogue, pkgDef, versionEditor) {
          $rootScope.page_title = "Package repository";
          $scope.packages = catalogue.find();
          $scope.visitor = visitor;
          $scope.pkgDef = pkgDef;
          $scope.addVersion = function () {
            return versionEditor.edit().then(function (verDef) {
              console.log("$scope.package", $scope.package);
              if (verDef) {
                $scope.pkgDef.versions.push(verDef);
              }
              return console.log("Package returned", verDef);
            });
          };
          return $scope.editVersion == function (verDef) {
            return versionEditor.edit(verDef);
          };
        }
      ]
    });
  }
]);

module.run([
  "menu", function (menu) {
    return menu.addItem("packages", {
      title: "Explore packages",
      href: "/packages",
      'class': "icon-folder-close",
      text: "Packages"
    });
  }
]);