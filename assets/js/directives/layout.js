var module,
  slice = [].slice;

module = angular.module("plunker.layout", ["plunker.panes", "plunker.sidebar", "plunker.ace", "plunker.multipane", "plunker.paneselector"]);

module.directive("plunkerEditorLayout", [
  "panes", function(panes) {
    return {
      restrict: "E",
      replace: true,
      template: "<div class=\"plunker-editor-layout\">\n  <div class=\"ui-layout-west\">\n    <plunker-sidebar></plunker-sidebar>\n  </div>\n  <div class=\"ui-layout-center\">\n    <div class=\"ui-layout-center\">\n      <plunker-ace></plunker-ace>\n    </div>\n    <plunker-multipane class=\"ui-layout-east\"></plunker-multipane>\n  </div>\n  <plunker-paneselector class=\"ui-layout-east\">\n  </plunker-paneselector>\n</div>",
      link: function($scope, $el, attrs) {
        var center, layout;
        layout = $el.layout({
          defaults: {
            spacing_open: 4,
            spacing_closed: 8,
            onresize: function() {
              return $scope.$broadcast.apply($scope, ["resize"].concat(slice.call(arguments)));
            }
          },
          west: {
            size: 200,
            minSize: 160,
            maxSize: 320,
            onresize: function() {
              return $scope.$broadcast.apply($scope, ["resize"].concat(slice.call(arguments)));
            }
          },
          center: {
            children: {
              defaults: {
                spacing_open: 4,
                spacing_closed: 0,
                onresize: function() {
                  return $scope.$broadcast.apply($scope, ["resize"].concat(slice.call(arguments)));
                }
              },
              center: {
                size: "50%"
              },
              east: {
                maskContents: true,
                onresize: function(el, name, state) {
                  if (panes.active) {
                    return panes.active.size == state.size;
                  }
                },
                onclose: function() {
                  if (panes.active) {
                    return $scope.$apply(function() {
                      return panes.close();
                    });
                  }
                }
              }
            }
          },
          east: {
            size: 41,
            closable: false,
            resizable: false,
            spacing_open: 1,
            spacing_closed: 1
          }
        });
        center = layout.panes.center.layout();
        center.resizers.east.mousedown(function() {
          return center.showMasks("east");
        });
        center.resizers.east.mouseup(function() {
          return center.hideMasks("east");
        });
        return $scope.$watch((function() {
          return panes.active;
        }), function(pane) {
          if (pane) {
            center.sizePane("east", pane.size);
            return center.open("east");
          } else {
            return center.close("east");
          }
        });
      }
    };
  }
]);