var module;

module = angular.module("plunker.session", ["plunker.plunks", "plunker.notifier", "plunker.activity", "plunker.visitor"]);

module.service("session", [
  "$rootScope", "$q", "$timeout", "plunks", "notifier", "activity", "visitor", function($rootScope, $q, $timeout, plunks, notifier, activity, visitor) {
    var Session, genid, valueAtPath;
    genid = function(len, prefix, keyspace) {
      if (len == null) {
        len = 16;
      }
      if (prefix == null) {
        prefix = "";
      }
      if (keyspace == null) {
        keyspace = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      }
      while (len-- > 0) {
        prefix += keyspace.charAt(Math.floor(Math.random() * keyspace.length));
      }
      return prefix;
    };
    valueAtPath = function(obj, path) {
      var k, len1, ref, seg;
      if (path == null) {
        path = [];
      }
      if (path && !angular.isArray(path)) {
        path = [path];
      }
      if (!path.length) {
        return obj;
      }
      if (obj == null) {
        return obj;
      }
      ref = obj;
      for (k = 0, len1 = path.length; k < len1; k++) {
        seg = path[k];
        ref = ref[seg];
        if (ref == null) {
          return ref;
        }
      }
      return ref;
    };
    return new (Session = (function() {
      var $$asyncOp, $$cleanState, $$counter, $$currentRevision, $$history, $$savedState, $$uid;

      $$cleanState = {};

      $$savedState = {};

      $$currentRevision = null;

      $$history = [];

      $$counter = 0;

      $$uid = genid.bind(null, 16, "__");

      $$asyncOp = function(operation, fn) {
        var dfd;
        dfd = $q.defer();
        fn.call(this, dfd);
        return dfd.promise.then(function() {
          return this.loading = "";
        }, function() {
          return this.loading = "";
        });
      };

      function Session() {
        var client, e, session, state;
        this.currentRevisionIndex = 0;
        this.plunk = null;
        this.source = "";
        this.loading = "";
        this.description = "";
        this.tags = [];
        this["private"] = true;
        this.buffers = {};
        if (state = window.localStorage.getItem("plnkr_dirty_exit")) {
          try {
            this.lastSession = JSON.parse(state);
          } catch (_error) {
            e = _error;
            console.log("[ERR] Invalid saved state.");
          }
        }
        this.reset();
        client = activity.client("session");
        session = this;
        client.handleEvent("reset", function(type, event) {
          return session.reset(event, {
            soft: true
          });
        });
        client.handleEvent("files.add", function(type, event) {
          return $rootScope.$apply(function() {
            return session.addBuffer(event.filename, event.content, {
              id: event.buffId
            });
          });
        });
        client.handleEvent("files.remove", function(type, event) {
          return $rootScope.$apply(function() {
            var buffer;
            if (buffer = session.buffers[event.buffId]) {
              return session.removeBuffer(buffer.filename);
            }
          });
        });
        client.handleEvent("files.rename", function(type, event) {
          return $rootScope.$apply(function() {
            var buffer;
            if (buffer = session.buffers[event.buffId]) {
              return session.renameBuffer(buffer.filename, event.filename);
            }
          });
        });
        window.onbeforeunload = (function(_this) {
          return function() {
            if (_this.isDirty()) {
              return "You have unsaved work on this Plunk.";
            }
          };
        })(this);
        setInterval(function() {
          if (session.isDirty()) {
            return window.localStorage.setItem("plnkr_dirty_exit", JSON.stringify(session.toJSON({
              includeBufferId: true,
              includeSource: true,
              includePlunk: true,
              includeState: true
            })));
          } else {
            return window.localStorage.removeItem("plnkr_dirty_exit");
          }
        }, 1000);
      }

      Session.prototype.isSaved = function() {
        return !!this.plunk && this.plunk.isSaved();
      };

      Session.prototype.isWritable = function() {
        return !!this.plunk && this.plunk.isWritable();
      };

      Session.prototype.isPlunkDirty = function(path, state) {
        var current, previous;
        previous = valueAtPath(state || $$savedState, path);
        current = valueAtPath(this.toJSON({
          raw: true
        }), path);
        return !angular.equals(previous, current);
      };

      Session.prototype.isDirty = function(path, state) {
        var current, previous;
        previous = valueAtPath(state || $$cleanState, path);
        current = valueAtPath(this.toJSON({
          raw: true
        }), path);
        return !angular.equals(previous, current);
      };

      Session.prototype.getRevision = function(rel, current) {
        var chg, dmp, i, j, k, l, len1, patch, ref1, ref2, remove, rename, session, size;
        if (rel == null) {
          rel = 0;
        }
        if (current == null) {
          current = $$currentRevision;
        }
        session = this;
        size = this.plunk.history.length - 1;
        dmp = new diff_match_patch();
        rename = function(fn, to) {
          var file;
          if (file = current.files[fn]) {
            file.filename = to;
            delete current.files[fn];
            return current.files[to] = file;
          }
        };
        patch = function(fn, patches) {
          var file, ref1;
          if (file = current.files[fn]) {
            return ref1 = dmp.patch_apply(patches, file.content), file.content = ref1[0], ref1;
          }
        };
        remove = function(fn) {
          return delete current.files[fn];
        };
        for (i = k = 0, ref1 = rel; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
          ref2 = this.plunk.history[size - i].changes;
          for (j = l = 0, len1 = ref2.length; l < len1; j = ++l) {
            chg = ref2[j];
            if (chg.pn) {
              if (chg.fn) {
                if (chg.pl) {
                  patch(chg.fn, dmp.patch_fromText(chg.pl));
                }
                if (chg.pn !== chg.fn) {
                  rename(chg.fn, chg.pn);
                }
              } else {
                current.files[chg.pn] = {
                  filename: chg.pn,
                  content: chg.pl
                };
              }
            } else if (chg.fn) {
              remove(chg.fn);
            }
          }
        }
        return current;
      };

      Session.prototype.revertTo = function(rel) {
        var dfd;
        if (rel == null) {
          rel = 0;
        }
        dfd = $q.defer();
        $script("/vendor/diff_match_patch/diff_match_patch.js", (function(_this) {
          return function() {
            var json;
            if (rel || !$$currentRevision) {
              json = _this.getRevision(rel, angular.copy($$currentRevision || ($$currentRevision = _this.toJSON({
                includeBufferId: false
              }))));
            } else {
              json = angular.copy($$currentRevision);
            }
            _this.reset(json, {
              soft: true
            });
            _this.currentRevisionIndex = rel;
            return dfd.resolve(json);
          };
        })(this));
        return dfd.promise;
      };

      Session.prototype.getSaveDelta = function() {
        var buffId, buffer, inFlightState, json, k, l, lastCleanState, len1, len2, prev, ref1, ref2, ref3, ref4, ref5, renameConflict, tag;
        json = {};
        lastCleanState = angular.copy($$savedState);
        inFlightState = this.toJSON({
          raw: true
        });
        if (this.isPlunkDirty("description")) {
          json.description = this.description;
        }
        if (this.isPlunkDirty("tags")) {
          json.tags = {};
          ref1 = lastCleanState.tags;
          for (k = 0, len1 = ref1.length; k < len1; k++) {
            tag = ref1[k];
            json.tags[tag] = false;
          }
          ref2 = this.tags;
          for (l = 0, len2 = ref2.length; l < len2; l++) {
            tag = ref2[l];
            json.tags[tag] = true;
          }
        }
        if (this.isPlunkDirty("buffers")) {
          json.files = {};
          ref3 = lastCleanState.buffers;
          for (buffId in ref3) {
            prev = ref3[buffId];
            if (!this.buffers[buffId]) {
              json.files[prev.filename] = null;
            }
          }
          ref4 = inFlightState.buffers;
          for (buffId in ref4) {
            buffer = ref4[buffId];
            if (this.isDirty(["buffers", buffId])) {
              if (prev = lastCleanState.buffers[buffId]) {
                json.files[prev.filename] = {};
                if (prev.filename !== buffer.filename) {
                  json.files[prev.filename].filename = buffer.filename;
                }
                if (prev.content !== buffer.content) {
                  json.files[prev.filename].content = buffer.content;
                }
              }
            }
          }
          ref5 = inFlightState.buffers;
          for (buffId in ref5) {
            buffer = ref5[buffId];
            if (this.isDirty(["buffers", buffId])) {
              if (!lastCleanState.buffers[buffId]) {
                if (renameConflict = json.files[buffer.filename]) {
                  json.files[renameConflict.filename] = {
                    content: renameConflict.content
                  };
                }
                json.files[buffer.filename] = {
                  content: buffer.content
                };
              }
            }
          }
        }
        return json;
      };

      Session.prototype.getBufferArray = (function() {
        var buffers;
        buffers = [];
        return function() {
          var buffId, buffer, ref1;
          buffers.length = 0;
          ref1 = this.buffers;
          for (buffId in ref1) {
            buffer = ref1[buffId];
            buffers.push(buffer);
          }
          return buffers;
        };
      })();

      Session.prototype.getActiveBuffer = function() {
        var buffId, buffer;
        if (!$$history.length) {
          throw new Error("Attempting return the active buffer while the Session is out of sync");
        }
        buffId = $$history[0];
        return buffer = this.buffers[buffId];
      };

      Session.prototype.getBufferByFilename = function(filename) {
        var buffId, buffer, ref1, test;
        test = function(against) {
          if (filename.test) {
            return filename.test(against);
          } else {
            return filename === against;
          }
        };
        ref1 = this.buffers;
        for (buffId in ref1) {
          buffer = ref1[buffId];
          if (test(buffer.filename)) {
            return buffer;
          }
        }
      };

      Session.prototype.getEditPath = function() {
        if (this.plunk) {
          return this.plunk.id || "";
        } else {
          return this.source || "";
        }
      };

      Session.prototype.toJSON = function(options) {
        var buffId, buffer, json, ref1;
        if (options == null) {
          options = {};
        }
        if (options.raw) {
          json = {
            description: this.description,
            tags: angular.copy(this.tags),
            "private": this["private"],
            buffers: angular.copy(this.buffers),
            source: angular.copy(this.source)
          };
          json;
        } else {
          json = {
            description: this.description,
            tags: angular.copy(this.tags),
            'private': this["private"],
            files: {}
          };
          ref1 = this.buffers;
          for (buffId in ref1) {
            buffer = ref1[buffId];
            json.files[buffer.filename] = {
              filename: buffer.filename,
              content: buffer.content
            };
            if (options.includeBufferId) {
              json.files[buffer.filename].id = buffId;
            }
          }
          if (options.includeSource) {
            json.source = angular.copy(this.source);
          }
          if (options.includePlunk) {
            json.plunk = angular.copy(this.plunk);
          }
          if (options.includeState) {
            json.$$cleanState = angular.copy($$cleanState);
            json.$$savedState = angular.copy($$savedState);
          }
        }
        return json;
      };

      Session.prototype.reset = function(json, options) {
        var buffId, buffer, file, filename, ref1, ref2, ref3, ref4;
        if (json == null) {
          json = {};
        }
        if (options == null) {
          options = {};
        }
        $$savedState = {};
        this.$resetting = true;
        if (!options.soft) {
          this.plunk = null;
          if (json.plunk) {
            delete json.plunk.$$refreshing;
            this.plunk = plunks.findOrCreate(json.plunk);
          }
          this.source = json.source || "";
        }
        this.description = json.description || "";
        this.tags = json.tags || [];
        if (!(((ref1 = json.plunk) != null ? ref1["private"] : void 0) === false || json["private"] === false)) {
          this["private"] = true;
        }
        ref2 = this.buffers;
        for (buffId in ref2) {
          buffer = ref2[buffId];
          this.removeBuffer(buffer);
        }
        if (json.files) {
          ref3 = json.files;
          for (filename in ref3) {
            file = ref3[filename];
            this.addBuffer(file.filename, file.content, {
              id: file.id,
              activate: true,
              snippet: file.snippet
            });
          }
        }
        if (!$$history.length) {
          this.addBuffer("index.html", "");
        }
        if (buffer = options.open || this.getBufferByFilename(/^index\./i)) {
          this.activateBuffer(buffer);
        }
        if (this.plunk && this.plunk.frozen_version && !this.isWritable()) {
          this.currentRevisionIndex = this.plunk.history.length - 1 - this.plunk.frozen_version;
        }
        activity.client("session").record("reset", this.toJSON({
          includeBufferId: true
        }));
        $$cleanState = angular.copy(json.$$cleanState) || this.toJSON({
          raw: true
        });
        if ((ref4 = this.plunk) != null ? ref4.isSaved() : void 0) {
          $$savedState = angular.copy(json.$$savedState) || this.toJSON({
            raw: true
          });
        }
        if (!options.soft) {
          $$currentRevision = null;
        }
        this.$resetting = false;
        return this;
      };

      Session.prototype.open = function(source) {
        var self;
        if (!source) {
          return notifier.warning("Open cancelled: No source provided.".trim());
        }
        self = this;
        return $$asyncOp.call(this, "open", function(dfd) {
          return importer["import"](source).then(function(json) {
            self.reset(json);
            return dfd.resolve(self);
          }, function(err) {
            dfd.reject(err);
            return notifier.error(("Open failed: " + err).trim());
          });
        });
      };

      Session.prototype.save = function(options) {
        var create, ref1, self, update;
        if (options == null) {
          options = {};
        }
        if (this.plunk && !this.plunk.isWritable()) {
          return notifier.warning("Save cancelled: You do not have permission to change this plunk.".trim());
        }
        self = this;
        update = (function(_this) {
          return function(plunk) {
            var inFlightState, json, lastCleanState;
            lastCleanState = angular.copy($$savedState);
            inFlightState = _this.toJSON({
              raw: true
            });
            json = angular.extend(_this.getSaveDelta(), options);
            return $$asyncOp.call(_this, "save", function(dfd) {
              return plunk.save(json).then(function(plunk) {
                $$cleanState = angular.copy(inFlightState);
                $$savedState = angular.copy(inFlightState);
                $$currentRevision = null;
                notifier.success("Plunk updated");
                return dfd.resolve(self);
              }, function(err) {
                dfd.reject(err);
                return notifier.error(("Save failed: " + err).trim());
              });
            });
          };
        })(this);
        create = (function(_this) {
          return function(plunk) {
            var inFlightState, json, lastCleanState;
            lastCleanState = angular.copy($$savedState);
            inFlightState = _this.toJSON({
              raw: true
            });
            json = angular.extend(_this.toJSON(), options);
            return $$asyncOp.call(_this, "save", function(dfd) {
              return plunk.save(json).then(function(plunk) {
                $$cleanState = angular.copy(inFlightState);
                $$savedState = angular.copy(inFlightState);
                self.plunk = plunk;
                notifier.success("Plunk created");
                return dfd.resolve(self);
              }, function(err) {
                dfd.reject(err);
                return notifier.error(("Save failed: " + err).trim());
              });
            });
          };
        })(this);
        if ((ref1 = this.plunk) != null ? ref1.isSaved() : void 0) {
          return update(this.plunk);
        } else {
          return create(this.plunk || plunks.findOrCreate());
        }
      };

      Session.prototype.fork = function(options) {
        var inFlightState, json, ref1, self;
        if (options == null) {
          options = {};
        }
        if (!((ref1 = this.plunk) != null ? ref1.isSaved() : void 0)) {
          return notifier.warning("Fork cancelled: You cannot fork a plunk that does not exist.".trim());
        }
        if (!visitor.isMember()) {
          options["private"] = true;
        }
        json = angular.extend(this.getSaveDelta(), options);
        self = this;
        inFlightState = this.toJSON({
          raw: true
        });
        return $$asyncOp.call(this, "fork", function(dfd) {
          return plunks.fork(self.plunk, json).then(function(plunk) {
            self.plunk = plunk;
            $$cleanState = angular.copy(inFlightState);
            $$savedState = angular.copy(inFlightState);
            $$currentRevision = null;
            notifier.success("Plunk forked");
            return dfd.resolve(self);
          }, function(err) {
            dfd.reject(err);
            return notifier.error(("Fork failed: " + err).trim());
          });
        });
      };

      Session.prototype.destroy = function() {
        var self;
        if (!this.plunk.isSaved()) {
          return notifier.warning("Delete cancelled: You cannot delete a plunk that is not saved.".trim());
        }
        self = this;
        return $$asyncOp.call(this, "destroy", function(dfd) {
          return this.plunk.destroy().then(function() {
            self.reset();
            notifier.success("Plunk deleted");
            return dfd.resolve(self);
          }, function(err) {
            dfd.reject(err);
            return notifier.error(("Delete failed: " + err).trim());
          });
        });
      };

      Session.prototype.freeze = function(rel, options) {
        var ref1, self;
        if (rel == null) {
          rel = this.currentRevisionIndex;
        }
        if (options == null) {
          options = {};
        }
        if (!((ref1 = this.plunk) != null ? ref1.isSaved() : void 0)) {
          return notifier.warning("Freeze cancelled: You cannot freeze a plunk that does not exist.".trim());
        }
        self = this;
        return $$asyncOp.call(this, "freeze", function(dfd) {
          return self.plunk.freeze(rel).then(function() {
            notifier.success("Plunk frozen");
            return dfd.resolve(self);
          }, function(err) {
            notifier.error(("Freeze failed: " + err).trim());
            return dfd.reject(err);
          });
        });
      };

      Session.prototype.unfreeze = function(options) {
        var ref1, self;
        if (options == null) {
          options = {};
        }
        if (!((ref1 = this.plunk) != null ? ref1.isFrozen() : void 0)) {
          return notifier.warning("Unfreeze cancelled: You cannot unfreeze a plunk that is not frozen.".trim());
        }
        self = this;
        return $$asyncOp.call(this, "unfreeze", function(dfd) {
          return self.plunk.unfreeze().then(function() {
            notifier.success("Plunk unfrozen");
            return dfd.resolve(self);
          }, function(err) {
            notifier.error(("Unfreeze failed: " + err).trim());
            return dfd.reject(err);
          });
        });
      };

      Session.prototype.addBuffer = function(filename, content, options) {
        var buffId;
        if (content == null) {
          content = "";
        }
        if (options == null) {
          options = {};
        }
        if (this.getBufferByFilename(filename)) {
          return notifier.warning(("File not added: A file named '" + filename + "' already exists.").trim());
        }
        buffId = options.id || $$uid();
        this.buffers[buffId] = {
          id: buffId,
          filename: filename,
          content: content,
          participants: {}
        };
        if (options.snippet) {
          this.buffers[buffId].snippet = options.snippet;
        }
        $$history.push(buffId);
        if (!this.$resetting) {
          activity.client("session").record("files.add", {
            buffId: buffId,
            filename: filename,
            content: content
          });
        }
        if (options.activate === true) {
          this.activateBuffer(filename);
        }
        return this;
      };

      Session.prototype.removeBuffer = function(filename) {
        var buffer, idx;
        if (angular.isObject(filename)) {
          buffer = filename;
        } else if (!(buffer = this.getBufferByFilename(filename))) {
          return notifier.warning(("Cannot remove file: A file named '" + filename + "' does not exist.").trim());
        }
        if ((idx = $$history.indexOf(buffer.id)) < 0) {
          throw new Error("Session @buffers and $$history are out of sync");
        }
        $$history.splice(idx, 1);
        delete this.buffers[buffer.id];
        if (idx === 0 && $$history.length) {
          this.activateBuffer(this.buffers[$$history[0]]);
        }
        if (!this.$resetting) {
          activity.client("session").record("files.remove", {
            buffId: buffer.id
          });
        }
        return this;
      };

      Session.prototype.activateBuffer = function(filename) {
        var buffer, idx;
        if (angular.isObject(filename)) {
          buffer = filename;
        } else if (!(buffer = this.getBufferByFilename(filename))) {
          return notifier.warning(("Cannot activate file: A file named '" + filename + "' does not exist.").trim());
        }
        if ((idx = $$history.indexOf(buffer.id)) < 0) {
          throw new Error("Session @buffers and $$history are out of sync");
        }
        $$history.splice(idx, 1);
        $$history.unshift(buffer.id);
        this.activeBuffer = buffer;
        return this;
      };

      Session.prototype.switchBuffer = function(go) {
        var buffId, buffer, filenames, idx, ref1;
        if (go == null) {
          go = 1;
        }
        filenames = [];
        ref1 = this.buffers;
        for (buffId in ref1) {
          buffer = ref1[buffId];
          filenames.push(buffer.filename);
        }
        filenames.sort();
        idx = filenames.indexOf(this.activeBuffer.filename);
        go = go % filenames.length;
        go = (filenames.length + idx + go) % filenames.length;
        return this.activateBuffer(filenames[go]);
      };

      Session.prototype.renameBuffer = function(filename, new_filename) {
        var buffer;
        if (angular.isObject(filename)) {
          buffer = filename;
        } else if (!(buffer = this.getBufferByFilename(filename))) {
          return notifier.warning(("Cannot rename file: A file named '" + filename + "' does not exist.").trim());
        }
        buffer.filename = new_filename;
        if (!this.$resetting) {
          activity.client("session").record("files.rename", {
            buffId: buffer.id,
            filename: new_filename,
            previous: filename
          });
        }
        return this;
      };

      return Session;

    })());
  }
]);