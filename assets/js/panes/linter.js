var module;

module = angular.module("plunker.panes");

module.requires.push("plunker.annotations");

module.requires.push("plunker.session");

module.requires.push("plunker.activity");

module.run([
  "panes", "annotations", "session", "activity", function(panes, annotations, session, activity) {
    return panes.add({
      id: "linter",
      icon: "check",
      size: 328,
      title: "Code Linting",
      description: "Display a filtered list of lint errors, warnings and messages for all of your code. Quickly see potential issues and navigate to them.",
      template: "<div class=\"plunker-linter\">\n  <div class=\"note-filters\">\n    <div class=\"btn-group\">\n      <button type=\"button\" ng-click=\"filters.error = !filters.error\" ng-class=\"{active: filters.error}\" class=\"btn btn-danger\">Errors</button>\n      <button type=\"button\" ng-click=\"filters.warning = !filters.warning\" ng-class=\"{active: filters.warning}\" class=\"btn btn-warning\">Warnings</button>\n      <button type=\"button\" ng-click=\"filters.info = !filters.info\" ng-class=\"{active: filters.info}\" class=\"btn btn-info\">Information</button>\n    </div>\n  </div>\n  <section ng-repeat=\"(buffId, notes) in annotations\">\n    <h4>{{session.buffers[buffId].filename}}</h4>\n    <ul class=\"notes-list\">\n      <li ng-hide=\"relevantNotes(notes, filters).length\" class=\"alert alert-success\">\n        No matching notes\n      </li>\n      <li ng-repeat=\"note in relevantNotes(notes, filters)\" class=\"alert alert-{{note.type}}\">\n        <a ng-click=\"moveCursorTo(buffId, note.row, note.column)\" class=\"note-line\">Line {{note.row + 1}}</a>\n        <p class=\"note-text\" ng-bind=\"note.text\"></p>\n      </li>\n    </ul>\n  </section>\n</div>",
      link: function($scope, $el, attrs) {
        var pane;
        pane = this;
        $scope.annotations = annotations;
        $scope.session = session;
        $scope.notesUpdated = false;
        $scope.filters = {
          error: true,
          warning: false,
          info: false
        };
        $scope.relevant = 0;
        $scope.counts = {
          error: 0,
          warning: 0,
          info: 0
        };
        $scope.relevantNotes = function(input, filters) {
          var i, len, note, output;
          output = [];
          for (i = 0, len = input.length; i < len; i++) {
            note = input[i];
            if (filters[note.type]) {
              output.push(note);
            }
          }
          return output;
        };
        $scope.$watch("pane.active", function(active) {
          if (active) {
            return pane["class"] = "";
          }
        });
        $scope.$watch("annotations", function(annotations) {
          var buffId, i, len, note, notes, results;
          $scope.relevant = 0;
          results = [];
          for (buffId in annotations) {
            notes = annotations[buffId];
            for (i = 0, len = notes.length; i < len; i++) {
              note = notes[i];
              $scope.counts[note.type]++;
            }
            results.push($scope.relevant += $scope.relevantNotes(notes, $scope.filters).length);
          }
          return results;
        }, true);
        return $scope.moveCursorTo = function(buffId, row, column) {
          return activity.client("linter").playback("selection", {
            buffId: buffId,
            cursor: {
              row: row,
              column: column
            }
          });
        };
      }
    });
  }
]);