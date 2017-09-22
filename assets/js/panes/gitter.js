var module;

module = angular.module("plunker.panes");

module.run([
  "$q", "$timeout", "panes", function($q, $timeout, panes) {
    var GitterChat, gitterReady;
    GitterChat = null;
    ((window.gitter = {}).chat = {}).options = {
      disableDefaultChat: true
    };
    gitterReady = $q.defer();
    document.addEventListener('gitter-sidecar-ready', function(e) {
      return gitterReady.resolve(e.detail.Chat);
    });
    return panes.add({
      id: "gitter",
      icon: "comments",
      size: "50%",
      title: "Chat",
      description: "Real-time discussion.",
      template: "<div class=\"plunker-chat gitter-chat-embed\">\n  Loading Gitter...\n</div>",
      link: function($scope, $el, attrs) {
        var chat, linked, loaded, pane;
        pane = this;
        chat = null;
        linked = true;
        loaded = false;
        document.querySelector('.gitter-chat-embed').addEventListener('gitter-chat-toggle', function(e) {
          if (!e.detail.state) {
            return panes.close(pane);
          }
        });
        $scope.$watch((function() {
          return pane.active;
        }), function(active) {
          if (active) {
            if (!loaded) {
              $script('https://sidecar.gitter.im/dist/sidecar.v1.js');
              loaded = true;
            }
            return gitterReady.promise.then(function(GitterChat) {
              if (linked) {
                angular.element($el).html('');
                return chat = new GitterChat({
                  room: 'filearts/plunker',
                  targetElement: '.gitter-chat-embed',
                  showChatByDefault: true
                });
              }
            });
          } else {
            if (chat) {
              return chat.destroy();
            }
          }
        });
        return $scope.$on('$destroy', function() {
          if (chat) {
            chat.destroy();
          }
          return linked = false;
        });
      }
    });
  }
]);