var module;

module = angular.module("plunker.cursor", ["plunker.activity"]);

module.service("cursor", [
  "$rootScope", "activity", "visitor", function ($rootScope, activity, visitor) {
    var Cursor;
    return new (Cursor = (function () {
      function Cursor() {
        this.buffer = "";
        this.position = {
          row: 0,
          column: 0
        };
      }
      return Cursor;
    }));
  }
]);