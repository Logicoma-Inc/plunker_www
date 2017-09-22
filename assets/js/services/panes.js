var module;

module = angular.module("plunker.panes", []);

module.service("panes", [
  "$rootScope", "$location", function($rootScope, $location) {
    var Panes;
    return new (Panes = (function() {
      function Panes() {
        var panes;
        this.panes = [];
        this.active = null;
        panes = this;
        $rootScope.$watch((function() {
          return $location.search().p;
        }), function(paneId) {
          var pane, search;
          if (paneId) {
            if (pane = panes.findById(paneId)) {
              return panes.open(pane);
            } else {
              search = $location.search();
              delete search.p;
              return $location.search(search).replace();
            }
          } else {
            if ((search = $location.search()).p) {
              delete search.p;
              return $location.search(search).replace();
            }
          }
        });
      }

      Panes.prototype.findById = function(paneId) {
        var i, len, pane, ref;
        ref = this.panes;
        for (i = 0, len = ref.length; i < len; i++) {
          pane = ref[i];
          if (pane.id === paneId) {
            return pane;
          }
        }
      };

      Panes.prototype.add = function(pane) {
        if (!pane.id) {
          throw new Error("All panes must have an id attribute");
        }
        pane.title || (pane.title = "Activate this pane");
        pane["class"] || (pane["class"] = "");
        pane.icon || (pane.icon = "check-empty");
        pane.link || (pane.link = angular.noop);
        pane.template || (pane.template = "");
        pane.order || (pane.order = 500);
        return this.panes.push(pane);
      };

      Panes.prototype.remove = function(pane) {
        var idx;
        if ((idx = this.panes.indexOf(pane)) >= 0) {
          return delete this.panes[pane.id];
        }
      };

      Panes.prototype.open = function(active) {
        var search;
        this.active = active;
        if ($location.search().p !== this.active.id) {
          search = $location.search();
          search.p = this.active.id;
          return $location.search(search).replace();
        }
      };

      Panes.prototype.close = function(pane) {
        var search;
        this.active = null;
        if ($location.search().p) {
          search = $location.search();
          delete search.p;
          return $location.search(search).replace();
        }
      };

      Panes.prototype.toggle = function(pane) {
        if (this.active === pane) {
          return this.close(pane);
        } else {
          return this.open(pane);
        }
      };

      return Panes;

    })());
  }
]);