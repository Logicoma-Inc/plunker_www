module = angular.module("plunker.visitor", ["plunker.url", "plunker.notifier"]);

module.factory("visitor", [
  "$http", "$rootScope", "$window", "url", "notifier", function($http, $rootScope, $window, url, notifier) {
    var Visitor;
    return new (Visitor = (function() {
      function Visitor() {
        var _handleOAuthError, _handleOAuthSuccess, self;
        this.session = {};
        this.user = {};
        this.logged_in = false;
        if (typeof _plunker !== "undefined" && _plunker !== null ? _plunker.session : void 0) {
          this.applySessionData(_plunker.session);
        }
        $.cookie("plnk_session", this.session.id, {
          expires: 14,
          path: "/"
        });
        self = this;
        $rootScope.$watch((function() {
          var ref;
          return (ref = self.user) != null ? ref.id : void 0;
        }), function(user) {
          return self.logged_in = !!user;
        });
        _handleOAuthSuccess = function(auth) {
          return $rootScope.$apply(function() {
            console.log("AUTH", auth);
            self.request = $http.post(self.session.user_url, {
              service: auth.service,
              token: auth.token
            });
            return self.request.then(function(response) {
              self.applySessionData(response.data);
              return delete self.request;
            }, function(error) {
              notifier.error.apply(notifier, ["Login error"].concat(slice.call(arguments)));
              return delete self.request;
            });
          });
        };
        _handleOAuthError = function(error) {
          return $rootScope.$apply(function() {
            console.error("AUTH", error);
            return notifier.error.apply(notifier, ["Authentication error", self].concat(slice.call(arguments)));
          });
        };
        $window.addEventListener('message', (function(_this) {
          return function(message) {
            var error, matches, origin, payload;
            if (typeof message.data === 'string' && (matches = message.data.match(/^plunker\.auth\.(.*)/))) {
              try {
                origin = (message.origin || message.originalEvent.origin).replace(/^https?:/, '');
                if (origin !== window.location.origin.replace(/^https?:/, '')) {
                  return _handleOAuthError('Invalid OAuth source origin');
                }
                payload = JSON.parse(matches[1]);
                if (payload.auth) {
                  return _handleOAuthSuccess(payload.auth);
                } else if (payload.error) {
                  return _handleOAuthError(payload.error);
                } else {
                  return _handleOAuthError('Invalid OAuth payload.');
                }
              } catch (_error) {
                error = _error;
                return _handleOAuthError('Unable to parse OAuth payload.');
              }
            }
          };
        })(this));
      }

      Visitor.prototype.isMember = function() {
        return !!this.logged_in;
      };

      Visitor.prototype.isLoading = function() {
        return !!this.request || !!this.loginWindow;
      };

      Visitor.prototype.applySessionData = function(data) {
        angular.copy(data.user || {}, this.user);
        return angular.copy(data, this.session);
      };

      Visitor.prototype.login = function(width, height) {
        var left, screenHeight, top;
        if (width == null) {
          width = 1000;
        }
        if (height == null) {
          height = 650;
        }
        screenHeight = screen.height;
        left = Math.round((screen.width / 2) - (width / 2));
        top = 0;
        if (screenHeight > height) {
          top = Math.round((screenHeight / 2) - (height / 2));
        }
        this.loginWindow = window.open(url.www + "/auth/github", "Sign in with Github", "left=" + left + ",top=" + top + ",width=" + width + ",height=" + height + ",personalbar=0,toolbar=0,scrollbars=1,resizable=1");
        if (this.loginWindow) {
          return this.loginWindow.focus();
        }
      };

      Visitor.prototype.logout = function() {
        var request, self;
        self = this;
        request = $http({
          url: this.session.user_url,
          method: "DELETE"
        });
        return request.then(function(response) {
          return self.applySessionData(response.data);
        }, function(error) {
          return notifier.error.apply(notifier, ["Error logging out"].concat(slice.call(arguments)));
        });
      };

      return Visitor;

    })());
  }
]);