var module;

module = angular.module("plunker.panes");

module.requires.push("plunker.annotations");

module.requires.push("plunker.session");

module.requires.push("plunker.participants");

module.requires.push("plunker.visitor");

module.requires.push("plunker.notifier");

module.requires.push("plunker.activity");

module.requires.push("plunker.url");

module.requires.push("plunker.overlay");

module.run([
  "$rootScope", "$q", "$location", "panes", "session", "participants", "visitor", "notifier", "activity", "url", "overlay", function($rootScope, $q, $location, panes, session, participants, visitor, notifier, activity, url, overlay) {
    var SharedState, Stream, VisitorState, async, genid;
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
    VisitorState = (function() {
      function VisitorState(streamRef, identity) {
        var cursorRef, state;
        state = this;
        this.identityRef = streamRef.child(identity.id);
        this.identityRef.update(identity, function(err) {
          if (err) {
            console.log("Error setting identity", err);
          }
          if (err) {
            return notifier.error("Error syncing identity.");
          }
        });
        this.identityRef.on("value", function(snapshot) {
          return angular.copy(snapshot.val(), identity);
        });
        cursorRef = this.identityRef.child("state");
        this.identityRef.onDisconnect().remove();
        activity.client("stream").watchEvent("selection", function(type, event) {
          return cursorRef.set({
            buffId: event.buffId,
            cursor: event.cursor,
            selection: {
              start: event.selection.start,
              end: event.selection.end
            }
          }, function(err) {
            if (err) {
              console.log(err);
            }
            if (err) {
              return notifier.error(err);
            }
          });
        });
      }

      VisitorState.prototype.disconnect = function() {
        this.identityRef.off();
        return this.identityRef.remove();
      };

      return VisitorState;

    })();
    SharedState = (function() {
      function SharedState() {}

      SharedState.prototype.initialize = function() {
        return this.initialized || (this.initialized = (function() {
          var dfd;
          dfd = $q.defer();
          $script.get("https://cdn.firebase.com/v0/firebase.js", function() {
            return $rootScope.$apply(function() {
              if (typeof Firebase !== "undefined" && Firebase !== null) {
                return dfd.resolve(new Firebase('https://plunker.firebaseIO.com/participants/'));
              } else {
                return dfd.reject("Unable to load Firebase");
              }
            });
          });
          return dfd.promise;
        })());
      };

      SharedState.prototype.identify = function() {
        var dfd, handle;
        dfd = $q.defer();
        if (visitor.logged_in) {
          dfd.resolve({
            id: visitor.session.public_id,
            handle: visitor.user.login,
            gravatar_id: visitor.user.gravatar_id,
            type: "member"
          });
        } else if (handle = $.cookie("plnk_stream_handle")) {
          dfd.resolve({
            id: visitor.session.public_id,
            handle: handle,
            gravatar_id: visitor.session.public_id,
            type: "guest"
          });
        } else {
          notifier.prompt("How would you like to be identified for collaboration?", genid(4, "Guest", "0123456789"), {
            confirm: function(handle) {
              $.cookie("plnk_stream_handle", handle, {
                expires: 14,
                path: "/edit/"
              });
              return dfd.resolve({
                id: visitor.session.public_id,
                handle: handle,
                type: "guest"
              });
            },
            deny: function() {
              return dfd.reject();
            }
          });
        }
        return dfd.promise;
      };

      SharedState.prototype.connect = function(id) {
        var state;
        state = this;
        if (!id.match(/^[-_a-z0-9]{1,}$/i)) {
          notifier.error("Invalid stream id", "Stream ids must contain only alphanumeric characters, '_' or '-'");
          return $q.reject("Invalid stream id");
        }
        return $q.all([this.initialize(), this.identify()]).then(function(arg) {
          var firebase, identity;
          firebase = arg[0], identity = arg[1];
          state.identity = identity;
          state.streamRef = firebase.child(id);
          state.track(state.streamRef);
          return state.visitor = new VisitorState(state.streamRef, identity);
        }, function() {
          return notifier.error("You must chose a handle before using the collaboration feature.");
        });
      };

      SharedState.prototype.track = function(streamRef) {
        var state;
        state = this;
        streamRef.on("child_added", function(snapshot) {
          return async(function() {
            var name;
            if (snapshot.name() !== state.identity.id) {
              return angular.copy(snapshot.val(), (participants[name = snapshot.name()] || (participants[name] = {})));
            }
          });
        });
        streamRef.on("child_changed", function(snapshot) {
          return async(function() {
            var key, results, val, value;
            if (snapshot.name() !== state.identity.id) {
              val = snapshot.val();
              results = [];
              for (key in val) {
                value = val[key];
                if (key === "handle" || key === "id" || key === "gravatar_id" || key === "state") {
                  results.push(participants[snapshot.name()][key] = value);
                }
              }
              return results;
            }
          });
        });
        return streamRef.on("child_removed", function(snapshot) {
          return async(function() {
            return delete participants[snapshot.name()];
          });
        });
      };

      SharedState.prototype.disconnect = function() {
        if (this.streamRef) {
          this.streamRef.off();
        }
        return this.visitor.disconnect();
      };

      return SharedState;

    })();
    async = function(cb) {
      if ($rootScope.$$phase) {
        return cb();
      } else {
        return $rootScope.$apply(cb);
      }
    };
    Stream = (function() {
      function Stream() {
        this.id = genid(16);
        this.state = null;
        this.streaming = false;
        this.doc = null;
        this.cleanup = [];
        this.type = "public";
      }

      Stream.prototype.getLocalState = function(type) {
        var buffer, defaultPerms, filename, json, ref, state;
        state = session.toJSON({
          includeBufferId: true
        });
        defaultPerms = type === "public" ? {
          read: true,
          write: true,
          admin: false
        } : {
          read: true,
          write: false,
          admin: false
        };
        json = {
          files: {},
          permissions: {
            $default: defaultPerms
          }
        };
        ref = state.files;
        for (filename in ref) {
          buffer = ref[filename];
          json.files[buffer.id] = buffer;
        }
        return json;
      };

      Stream.prototype.initialize = function() {
        this.state || (this.state = new SharedState);
        return $q.all([
          this.state.initialize(), (function() {
            var dfd;
            dfd = $q.defer();
            $script(url.collab + "/js/share.js", function() {
              return async(function() {
                if (typeof sharejs !== "undefined" && sharejs !== null) {
                  return dfd.resolve();
                } else {
                  return dfd.reject("Unable to load streaming code");
                }
              });
            });
            return dfd.promise;
          })()
        ]);
      };

      Stream.prototype.connectTo = function(id, type) {
        var options, promise, stream;
        if (id == null) {
          id = uid();
        }
        if (type == null) {
          type = "public";
        }
        if (!id.match(/^[-_a-z0-9]{1,}/i)) {
          $q.reject("Invalid stream ID: " + id);
        }
        stream = this;
        options = {
          origin: url.collab + "/channel",
          authentication: visitor.session.id
        };
        promise = this.initialize().then(function() {
          var dfd;
          dfd = $q.defer();
          sharejs.open(id, "json", options, function(err, doc) {
            return async(function() {
              if (err) {
                return dfd.reject("Unable to join stream");
              }
              stream.id = id;
              stream.doc = doc;
              stream.keep = doc.created === true && doc.version === 0;
              stream.streaming = "streaming";
              if (stream.keep) {
                return doc.submitOp([
                  {
                    p: [],
                    od: doc.snapshot,
                    oi: stream.getLocalState(type)
                  }
                ], function(err) {
                  if (err) {
                    doc.close();
                    return async(function() {
                      return dfd.reject("Error setting initial state");
                    });
                  } else {
                    return async(function() {
                      return dfd.resolve(stream);
                    });
                  }
                });
              } else {
                return async(function() {
                  return dfd.resolve(stream);
                });
              }
            });
          });
          return dfd.promise;
        });
        return promise.then(function() {
          return stream.state.connect(id);
        });
      };

      Stream.prototype.start = function() {
        var client, stream;
        stream = this;
        client = activity.client("stream");
        if (!stream.keep) {
          client.playback("reset", stream.doc.get());
        }
        stream.doc.on("remoteop", function(ops, snapshot) {
          var i, len1, op, results;
          results = [];
          for (i = 0, len1 = ops.length; i < len1; i++) {
            op = ops[i];
            if (0 === op.p.length && op.od && op.oi) {
              results.push(client.playback("reset", stream.doc.get()));
            } else if (4 === op.p.length && "files" === op.p[0] && "content" === op.p[2]) {
              if (op.sd) {
                client.playback("remove", {
                  buffId: op.p[1],
                  offset: op.p[3],
                  text: op.sd
                });
              }
              if (op.si) {
                results.push(client.playback("insert", {
                  buffId: op.p[1],
                  offset: op.p[3],
                  text: op.si
                }));
              } else {
                results.push(void 0);
              }
            } else if (3 === op.p.length && "files" === op.p[0] && "filename" === op.p[2]) {
              if (op.od && op.oi) {
                results.push(client.playback("files.rename", {
                  buffId: op.p[1],
                  filename: op.oi,
                  previous: op.od
                }));
              } else {
                results.push(void 0);
              }
            } else if (2 === op.p.length && "files" === op.p[0]) {
              if (op.od) {
                client.playback("files.remove", {
                  buffId: op.p[1]
                });
              }
              if (op.oi) {
                results.push(client.playback("files.add", {
                  buffId: op.p[1],
                  filename: op.oi.filename,
                  content: op.oi.content
                }));
              } else {
                results.push(void 0);
              }
            } else {
              results.push(console.log("[ERR] Unhandled remote op", op));
            }
          }
          return results;
        });
        this.cleanup.push(client.watchEvent("reset", function(type, event) {
          return stream.doc.set(stream.getLocalState());
        }));
        this.cleanup.push(client.watchEvent("files.add", function(type, json) {
          return stream.doc.submitOp({
            p: ["files", json.buffId],
            oi: json
          });
        }));
        this.cleanup.push(client.watchEvent("files.remove", function(type, json) {
          return stream.doc.submitOp({
            p: ["files", json.buffId],
            od: stream.doc.at(["files", json.buffId]).get()
          });
        }));
        this.cleanup.push(client.watchEvent("files.rename", function(type, json) {
          return stream.doc.submitOp({
            p: ["files", json.buffId, "filename"],
            od: json.previous,
            oi: json.filename
          });
        }));
        this.cleanup.push(client.watchEvent("insert", function(type, json) {
          return stream.doc.submitOp({
            p: ["files", json.buffId, "content", json.offset],
            si: json.text
          });
        }));
        return this.cleanup.push(client.watchEvent("remove", function(type, json) {
          return stream.doc.submitOp({
            p: ["files", json.buffId, "content", json.offset],
            sd: json.text
          });
        }));
      };

      Stream.prototype.stop = function() {
        var deregister;
        while (this.cleanup.length) {
          deregister = this.cleanup.pop();
          deregister();
        }
        if (this.doc) {
          this.doc.close();
        }
        if (this.state) {
          this.state.disconnect();
        }
        activity.client("stream").playback("reset", session.toJSON());
        return this.streaming = false;
      };

      return Stream;

    })();
    return panes.add({
      id: "streamer",
      icon: "retweet",
      size: 328,
      title: "Collaboration",
      description: "Collaborate with others in real-time.",
      template: "<div class=\"plunker-streamer\" ng-switch=\"stream.streaming\">\n  <div ng-switch-when=\"streaming\">\n    <plunker-channel ng-repeat=\"buffer in scratch.buffers.queue\"></plunker-channel>\n    <div class=\"status\">\n      <h4>Streaming enabled</h4>\n      Stream: <a ng-href=\"{{url.www}}/edit/?p=streamer&s={{stream.id}}\" target=\"_blank\" title=\"Link to this stream\"><code class=\"stream-id\" ng-bind=\"stream.id\"></code></a>\n      <button class=\"btn btn-mini btn-danger\" ng-click=\"stopStream()\" title=\"Disconnect from stream\">\n        <i class=\"icon-stop\"></i> Disconnect\n      </button>\n    </div>\n    <div>\n      <ul class=\"participants\">\n        <li ng-class=\"participant.style\" ng-repeat=\"(public_id, participant) in participants\">\n          <img ng-src=\"https://www.gravatar.com/avatar/{{participant.gravatar_id}}?s=14&d=identicon\" />\n          <span ng-bind=\"participant.handle\"></span>\n        </li>\n      <ul>\n    </div>\n  </div>\n  <div ng-switch-default>\n    <h3>Streaming</h3>\n    <p>\n      Streaming enables real-time collaboraboration on Plunker. When you\n      join a stream, the contents of your editor are kept in sync with the\n      stream and reflect changes made by others in the same stream.\n    </p>\n    <form ng-submit=\"startStream(stream)\">\n      <input class=\"mediumtext\" ng-model=\"stream.id\" size=\"32\" />\n      <button class=\"btn btn-primary\" type=\"submit\">Stream</button>\n      <div>\n        <label class=\"radio inline\" title=\"By default, anyone can make changes\">\n          <input type=\"radio\" value=\"public\" ng-model=\"stream.type\" />\n          Public\n        </label>\n        <label class=\"radio inline\" title=\"By default, only the stream's creator can make changes\">\n          <input type=\"radio\" value=\"presenter\" ng-model=\"stream.type\" />\n          Presenter\n        </label>\n      </div>\n    </form>\n    <h4>What happens if I hit save?</h4>\n    <p>\n      The current contents of your plunk will be saved as if you had\n      made all the changes to the files yourstream. No one else in the stream\n      will be affected at all by saving your state.\n    </p>\n    <h4>What happens if I load a template?</h4>\n    <p>\n      If you load a template, the resulting files will be sent to\n      everyone else in the stream as if you had made the changes yourself.\n      This is usually not what you want to do.\n    </p>\n  </div>\n</div>",
      link: function($scope, $el, attrs) {
        var id, pane, stream;
        pane = this;
        stream = new Stream;
        $scope.participants = participants;
        $scope.stream = stream;
        $scope.startStream = function(stream) {
          return async(function() {
            return overlay.show("Starting stream", stream.connectTo(stream.id, stream.type).then(function() {
              return stream.start();
            }, function(err) {
              return async(function() {
                stream.streaming = null;
                return notifier.error(err);
              });
            }));
          });
        };
        $scope.stopStream = function() {
          if (stream.streaming) {
            return stream.stop();
          }
        };
        $scope.$watch("stream.streaming", function(streaming) {
          var search;
          search = $location.search();
          if (streaming) {
            search.s = stream.id;
          } else {
            delete search.s;
          }
          return $location.search(search).replace();
        });
        if (id = $location.search().s) {
          stream.id = id;
          stream.type = $location.search().st;
          return $scope.startStream(stream);
        }
      }
    });
  }
]);