var module;

module = angular.module("plunker.beautifier", ["plunker.session"]);

module.service("beautifier", [
  "$rootScope", "session", "activity", "settings", function($rootScope, session, activity, settings) {
    var client;
    client = activity.client("beautifier");
    return {
      isBeautifiable: function() {
        return !!session.activeBuffer.filename.match(/\.(html|css|js)$/);
      },
      beautify: function() {
        var beautified, beautyFunc, filename, options, source;
        filename = session.activeBuffer.filename;
        source = session.activeBuffer.content;
        beautyFunc = filename.match(/\.html$/) ? html_beautify : filename.match(/\.css/) ? css_beautify : filename.match(/\.js/) ? js_beautify : void 0;
        if (beautyFunc) {
          options = {
            indent_size: settings.editor.tab_size,
            indent_char: " ",
            indent_with_tab: !settings.editor.soft_tabs
          };
          beautified = beautyFunc(source, options);
          client.playback("remove", {
            buffId: session.activeBuffer.id,
            offset: 0,
            text: source
          });
          return client.playback("insert", {
            buffId: session.activeBuffer.id,
            offset: 0,
            text: beautified
          });
        }
      }
    };
  }
]);