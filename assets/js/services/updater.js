module = angular.module("plunker.updater", ["plunker.catalogue", "plunker.settings", "plunker.notifier"]);

module.service("updater", [
  "$q", "catalogue", "settings", "notifier", function($q, catalogue, settings, notifier) {
    var MarkupFile, PackageRef;
    PackageRef = (function() {
      function PackageRef(pkgRef) {
        var ref1;
        if (angular.isString(pkgRef)) {
          ref1 = pkgRef.split("@"), this.name = ref1[0], this.range = ref1[1];
        } else if (angular.isObject(pkgRef)) {
          angular.copy(pkgRef, this);
        }
        this.range || (this.range = "*");
      }

      PackageRef.prototype.toString = function() {
        return this.name + "@" + this.range;
      };

      PackageRef.prototype.fetch = function() {
        var pkgRef;
        pkgRef = this;
        return $q.when(catalogue.findOne({
          name: this.name
        })).then(function(pkg) {
          pkgRef.pkg = pkg;
          pkgRef.ver = pkg.getMatchingVersion(pkgRef.range);
          if (!pkgRef.ver) {
            return $q.reject(new Error("No matching version for " + pkg.name + "@" + pkgRef.range));
          } else {
            return pkgRef;
          }
        });
      };

      return PackageRef;

    })();
    MarkupFile = (function() {
      function MarkupFile(markup) {
        this.dependencies = [];
        this.packages = {};
        this.obsolete = [];
        this.current = [];
        this.doc = window.document.implementation.createHTMLDocument("");
        this.parse(markup);
      }

      MarkupFile.prototype.parse = function(markup) {
        var ref1;
        this.doc.open();
        this.doc.write(markup);
        return (ref1 = this.doc.documentElement) != null ? ref1.innerHTML = markup : void 0;
      };

      MarkupFile.prototype.updateOrInsert = function(pkgDef, verDef) {
        var required, self;
        self = this;
        required = pkgDef.name + "@" + verDef.semver;
        return this.addRequired(required).then(function(entry) {
          return self.updateEntry(entry, verDef);
        });
      };

      MarkupFile.prototype.addRequired = function(required, options) {
        var before, entry, idx, ref, ref1, ref2, self, type;
        if (options == null) {
          options = {};
        }
        self = this;
        ref = new PackageRef(required);
        required = ref.toString();
        if (!(entry = this.packages[ref.name])) {
          this.packages[ref.name] = entry = {
            currentVer: options.semver,
            required: required,
            ref: ref,
            scripts: [],
            styles: [],
            dependencies: [],
            children: [],
            parent: options.parent
          };
          if (options.parent) {
            options.parent.children.push(entry);
            if (!(0 > (idx = this.dependencies.indexOf(options.parent)))) {
              this.dependencies.splice(Math.max(0, idx - 1), 0, entry);
            } else {
              console.error("[WTF] This should not happen");
            }
          } else {
            this.dependencies.push(entry);
          }
        } else {
          entry.ref = ref;
        }
        if (options.el) {
          type = options.el.nodeName.toLowerCase() === "script" ? "scripts" : "styles";
          entry[type].push($(options.el));
        } else if (before = ((ref1 = options.parent) != null ? ref1.styles[0] : void 0) || ((ref2 = options.parent) != null ? ref2.scripts[0] : void 0)) {
          entry.before = before;
        }
        return entry.ref.fetch().then(function(pkgRef) {
          var childPromises, dependency, i, len, list, ref3;
          if (entry.currentVer !== pkgRef.ver.semver) {
            list = self.obsolete;
          } else {
            list = self.current;
          }
          if (list.indexOf(entry) < 0) {
            if (options.parent && !(0 > (idx = list.indexOf(options.parent)))) {
              list.splice(Math.max(0, idx - 1), 0, entry);
            } else {
              list.push(entry);
            }
          }
          childPromises = [];
          ref3 = pkgRef.ver.dependencies;
          for (i = 0, len = ref3.length; i < len; i++) {
            dependency = ref3[i];
            childPromises.push(self.addRequired(dependency, {
              parent: entry
            }));
          }
          return $q.all(childPromises).then(function() {
            return entry;
          });
        }, function() {
          return $q.reject(new Error("No suitable package found for " + required));
        });
      };

      MarkupFile.prototype.findAllDependencies = function() {
        var promises, self;
        this.dependencies = [];
        this.packages = {};
        this.obsolete = [];
        this.current = [];
        self = this;
        promises = [];
        $("script[data-require], link[data-require]", this.doc).each(function(el) {
          var required, semver;
          required = $(this).data("require");
          semver = $(this).data("semver");
          if (required) {
            return promises.push(self.addRequired(required, {
              el: this,
              semver: semver
            }));
          }
        });
        return $q.all(promises);
      };

      MarkupFile.prototype.updateEntry = function(entry, verDef) {
        var $el, $head, $last, $prev, after, before, el, i, idx, j, len, len1, markup, prev, ref1, ref2, results, url;
        $head = $("head", this.doc);
        markup = this;
        verDef || (verDef = entry.ref.ver);
        while (entry.scripts.length > verDef.scripts.length) {
          $el = entry.scripts.pop();
          $el.remove();
        }
        while (entry.styles.length > verDef.styles.length) {
          $el = entry.styles.pop();
          $el.remove();
        }
        ref1 = verDef.styles;
        for (idx = i = 0, len = ref1.length; i < len; idx = ++i) {
          url = ref1[idx];
          if (!($el = entry.styles[idx])) {
            el = document.createElement("link");
            el.setAttribute("data-require", entry.required);
            el.setAttribute("data-semver", verDef.semver);
            el.setAttribute("rel", "stylesheet");
            el.setAttribute("href", url);
            if (($prev = $last || $head.find("link[data-require]").last()).length) {
              prev = $prev[0];
              prev.parentNode.insertBefore(el, prev.nextSibling);
            } else if (($prev = $head.find("style, link[rel=stylesheet], script").first()).length) {
              prev = $prev[0];
              prev.parentNode.insertBefore(el, prev);
            } else {
              $head.append(el);
            }
            entry.styles.push($el = $(el));
          } else {
            $el.attr("href", url);
            $el.attr("data-semver", verDef.semver);
          }
          $last = $el;
        }
        ref2 = verDef.scripts;
        results = [];
        for (idx = j = 0, len1 = ref2.length; j < len1; idx = ++j) {
          url = ref2[idx];
          before = after = null;
          if (!($el = entry.scripts[idx])) {
            el = document.createElement("script");
            el.setAttribute("data-require", entry.ref.toString());
            el.setAttribute("data-semver", verDef.semver);
            el.setAttribute("src", url);
            if (($prev = $last || $head.find("script[data-require]").last()).length) {
              prev = $prev[0];
              prev.parentNode.insertBefore(el, prev.nextSibling);
            } else if (($prev = $head.find("style, link[rel=stylesheet], script").first()).length) {
              prev = $prev[0];
              prev.parentNode.insertBefore(el, prev);
            } else {
              $head.append(el);
            }
            entry.scripts.push($el = $(el));
          } else {
            $el.attr("src", url);
            $el.attr("data-semver", verDef.semver);
          }
          results.push($last = $el);
        }
        return results;
      };

      MarkupFile.prototype.updateAll = function() {
        var markup;
        markup = this;
        return this.findAllDependencies().then(function() {
          var entry, i, len, promises, ref1;
          promises = [];
          ref1 = markup.dependencies;
          for (i = 0, len = ref1.length; i < len; i++) {
            entry = ref1[i];
            promises.push(markup.updateEntry(entry));
          }
          return $q.all(promises);
        });
      };

      MarkupFile.prototype.toHtml = function() {
        return dominatrix.domToHtml(this.doc);
      };

      return MarkupFile;

    })();
    return {
      parse: function(markup) {
        return new MarkupFile(markup);
      }
    };
  }
]);