var module;

module = angular.module("plunker.panes");

module.requires.push("plunker.url");

module.requires.push("plunker.session");

module.requires.push("plunker.settings");

module.requires.push("plunker.notifier");

module.requires.push("plunker.visitor");

module.service("previewer", ["$http", "$timeout", "url", "settings", "notifier", function($http, $timeout, url, settings, notifier) {}]);

module.run([
  "$q", "$document", "$timeout", "url", "panes", "session", "settings", "notifier", "annotations", "visitor", function($q, $document, $timeout, url, panes, session, settings, notifier, annotations, visitor) {
    var debounce, genid;
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
    debounce = function(delay, fn) {
      var timeout;
      timeout = null;
      return function() {
        var args, context;
        context = this;
        args = arguments;
        if (timeout) {
          clearTimeout(timeout);
        }
        return timeout = setTimeout(function() {
          return fn.apply(context, args);
        }, delay);
      };
    };
    return panes.add({
      id: "preview",
      icon: "eye-open",
      order: 1,
      title: "Live Preview",
      description: "See a live preview of your code on the web in either a pane or as a pop-out window.",
      size: "50%",
      template: "<div class=\"plunker-previewer\" ng-switch on=\"mode\">\n  <div ng-switch-when=\"embedded\">\n    <div class=\"plunker-previewer-ops\">\n      <div class=\"btn-toolbar\">\n        <div class=\"btn-group\">\n          <button id=\"refresh-preview\" ng-click=\"refresh()\" class=\"btn btn-mini btn-success\" title=\"Manually trigger a refresh of the preview\"><i class=\"icon-refresh icon-white\"></i></button>\n          <button id=\"expand-preview\" ng-click=\"expand()\" class=\"btn btn-mini btn-primary\" title=\"Launch the preview in a separate window\"><i class=\"icon-fullscreen icon-white\"></i></button>\n        </div>\n      </div>\n    </div>\n    <iframe name=\"plunkerPreviewTarget\" src=\"about:blank\" class=\"plunker-previewer-iframe\" frameborder=\"0\" width=\"100%\" height=\"100%\" scrolling=\"auto\"></iframe>\n  </div>\n  <div ng-switch-when=\"windowed\">\n    <div class=\"well\">\n      <h4>Previewing in windowed mode</h4>\n      <p>You've switched to previewing your work in windowed mode. This can be useful for using the developer tools without having to navigate\n        down through the iframe that is used for the in-window preview.</p>\n      <p>You can return to the in-window preview at any time simply by clicking below.</p>\n      <p>You can also scan this QR code to load the preview on your mobile device.</p>\n      <p id=\"preview-qrcode\"></p>\n      <p>\n        <button class=\"btn btn-success\" ng-click=\"refresh()\">\n          <i class=\"icon-refresh\"></i>\n          Refresh\n        </button>\n        <button class=\"btn btn-danger\" ng-click=\"contract()\">\n          <i class=\"icon-remove\"></i>\n          Close\n        </button>\n      </p>\n    </div>\n  </div>\n</div>",
      link: function($scope, $el, attrs) {
        var iframe, pane;
        pane = this;
        iframe = $("iframe.plunker-previewer-iframe", $el)[0];
        this.childWindow = null;
        $scope.previewUrl || ($scope.previewUrl = url.run + "/" + (genid()) + "/");
        $scope.iframeUrl = "about:blank";
        $scope.session = session;
        $scope.mode = "disabled";
        $scope.expand = function() {
          return $scope.mode = "windowed";
        };
        $scope.contract = function() {
          return $scope.mode = pane.active ? "embedded" : "disabled";
        };
        $scope.refresh = debounce(settings.previewer.delay, function() {
          var field, file, filename, form, ref, sessionField;
          if ($scope.mode === "disabled") {
            return;
          }
          if (false && (function() {
            var annotation, filename, i, len1, notes;
            for (filename in annotations) {
              notes = annotations[filename];
              for (i = 0, len1 = notes.length; i < len1; i++) {
                annotation = notes[i];
                if (!(annotation.type === "error")) {
                  continue;
                }
                $scope.previewBlocker = filename;
                console.log("Preview refresh skipped. Syntax errors detected.");
                return true;
              }
            }
            return false;
          })()) {
            return;
          }
          $scope.previewBlocker = "";
          form = document.createElement("form");
          form.style.display = "none";
          form.setAttribute("method", "post");
          form.setAttribute("action", $scope.previewUrl);
          form.setAttribute("target", "plunkerPreviewTarget");
          sessionField = document.createElement("input");
          sessionField.setAttribute("type", "hidden");
          sessionField.setAttribute("name", "sessid");
          sessionField.setAttribute("value", visitor.session.id);
          form.appendChild(sessionField);
          ref = session.toJSON().files;
          for (filename in ref) {
            file = ref[filename];
            field = document.createElement("input");
            field.setAttribute("type", "hidden");
            field.setAttribute("name", "files[" + filename + "][content]");
            field.setAttribute("value", file.content);
            form.appendChild(field);
          }
          document.body.appendChild(form);
          form.submit();
          return document.body.removeChild(form);
        });
        $scope.$watch("mode", function(mode, old_mode) {
          var childWindow, qrcode;
          switch (mode) {
            case "embedded":
              if (typeof childWindow !== "undefined" && childWindow !== null) {
                childWindow.close();
              }
              childWindow = null;
              break;
            case "windowed":
              pane.childWindow = window.open("about:blank", "plunkerPreviewTarget", "resizable=yes,scrollbars=yes,status=yes,toolbar=yes");
              qrcode = new QRCode("preview-qrcode", {
                text: $scope.previewUrl,
                width: 256,
                height: 256,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
              });
              break;
            default:
              return;
          }
          return setTimeout(function() {
            return $scope.$apply(function() {
              return $scope.refresh();
            });
          });
        });
        $scope.$watch("pane.active", function(active) {
          if (!active && $scope.mode === "embedded") {
            $scope.mode = "disabled";
          }
          if (active && $scope.mode === "disabled") {
            return setTimeout(function() {
              return $scope.$apply(function() {
                return $scope.mode = "embedded";
              });
            });
          }
        });
        $scope.$watch("session.updated_at", function() {
          if (settings.previewer.auto_refresh && (pane.active || $scope.mode === "windowed")) {
            return $scope.refresh();
          }
        });
        return this.startInterval($scope);
      },
      startInterval: function($scope) {
        var pane;
        pane = this;
        return setInterval(function() {
          var ref;
          if ($scope.mode === "windowed" && (!pane.childWindow || ((ref = pane.childWindow) != null ? ref.closed : void 0))) {
            return $scope.$apply(function() {
              var childWindow;
              $scope.contract();
              return childWindow = null;
            });
          }
        }, 1000);
      }
    });
  }
]);