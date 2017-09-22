var module;

module = angular.module("plunker.panes");

module.requires.push("plunker.activity");

module.requires.push("plunker.session");

module.requires.push("plunker.notifier");

module.requires.push("plunker.player");

module.run([
  "$timeout", "panes", "activity", "session", "notifier", function($timeout, panes, activity, session, notifier) {
    return panes.add({
      id: "recorder",
      icon: "facetime-video",
      size: 328,
      order: 400,
      title: "Session Recorder",
      hidden: true,
      description: "Record all of your activities while you are working on your plunker and share them with other users.",
      template: "<div class=\"plunker-recorder\">\n  <button class=\"btn btn-success\" ng-click=\"startRecording()\" ng-show=\"!recording && !events.length\">\n    <i class=\"icon-play-circle\"></i>\n    Start recording\n  </button>\n  <button class=\"btn btn-success\" ng-click=\"stopRecording()\" ng-show=\"recording\">\n    <i class=\"icon-stop\"></i>\n    Finish recording\n  </button>\n  <button class=\"btn btn-primary\" ng-click=\"promptSave()\" ng-show=\"!recording && events.length\">\n    <i class=\"icon-save\"></i>\n    Save\n  </button>\n  <button class=\"btn btn-danger\" ng-click=\"promptReset()\" ng-show=\"!recording && events.length\">\n    <i class=\"icon-eject\"></i>\n    Reset\n  </button>\n  <plunker-player events=\"events\" ng-show=\"events.length && !recording\"></plunker-player>\n</div>",
      link: function($scope, $el, attrs) {
        var stopListening;
        stopListening = null;
        $scope.startRecording = function() {
          $scope.recording = Date.now();
          $scope.events.length = 0;
          $scope.events.push({
            time: 0,
            type: "reset",
            event: session.toJSON({
              includeBufferId: true
            })
          });
          return stopListening = activity.client("recorder").watch(function(type, event) {
            return $scope.events.push({
              time: Date.now() - $scope.recording,
              type: type,
              event: event
            });
          });
        };
        $scope.stopRecording = function() {
          stopListening();
          $scope.recording = 0;
          return $scope.final = session.toJSON();
        };
        $scope.reset = function() {
          $scope.playing = 0;
          $scope.events = [];
          return $scope.final = null;
        };
        $scope.promptReset = function() {
          return notifier.confirm("This will cause your session recording to be lost. Are you sure you would like to reset the recorder?", {
            confirm: $scope.reset
          });
        };
        $scope.promptSave = function() {
          return notifier.confirm("Are you sure that you would like to attach this recording to your Plunk?", {
            confirm: function() {
              return session.addBuffer("recording.json", JSON.stringify($scope.events));
            }
          });
        };
        return $scope.reset();
      }
    });
  }
]);