var module;

module = angular.module("plunker.panes");

module.requires.push("plunker.settings");

module.run([
  "panes", "settings", function(panes, settings) {
    return panes.add({
      id: "options",
      icon: "cog",
      size: 252,
      order: 1000,
      title: "Editor Options",
      description: "Customize the theme of the editor, key bindings, indentation options and much more.",
      template: "<div class=\"plunker-options\">\n  <form>\n    <fieldset>\n      <legend>Editor</legend>\n      <label>Theme:\n        <select class=\"input-medium\" id=\"opts-editor-theme\" ng-model=\"settings.editor.theme\" ng-options=\"theme for theme in themes\"></select>\n      </label>\n      <label>Key Binding:\n        <select class=\"input-medium\" id=\"opts-editor-keyboard-handler\" ng-model=\"settings.editor.keyboard_handler\" ng-options=\"kh for kh in keyboard_handlers\"></select>\n      </label>\n      <label>Tab size:\n        <input class=\"input-mini\" id=\"opts-editor-tabSize\" ng-model=\"settings.editor.tab_size\" type=\"number\">\n      </label>\n      <label>Font size:\n        <input class=\"input-mini\" id=\"opts-editor-fontSize\" ng-model=\"settings.editor.font_size\" type=\"number\" min=\"8\">\n      </label>\n      <label class=\"checkbox\">\n        <input class=\"input-mini\" id=\"opts-editor-lineWrap\" ng-model=\"settings.editor.wrap.enabled\" type=\"checkbox\">\n        Line wrapping\n      </label>\n    </fieldset>\n    <fieldset>\n      <legend>Previewer</legend>\n      <label>Refresh interval:\n        <input class=\"input-small\" id=\"opts-previewer-delay\" ng-model=\"settings.previewer.delay\" ng-disabled=\"!settings.previewer.auto_refresh\" type=\"number\" />\n      </label>\n      <label class=\"checkbox\">\n        <input type=\"checkbox\" ng-model=\"settings.previewer.auto_refresh\" />\n        Auto refresh\n      </label>\n    </fieldset>\n  </form>\n</div>",
      link: function($scope, $el, attrs) {
        $scope.settings = settings;
        $scope.keyboard_handlers = ["ace", "emacs", "vim"];
        return $scope.themes = ["ambiance", "chrome", "clouds", "clouds_midnight", "crimson_editor", "dawn", "dreamweaver", "eclipse", "github", "idle_fingers", "kr_theme", "merbivore", "merbivore_soft", "monokai", "pastel_on_dark", "solarized_dark", "solarized_light", "textmate", "tomorrow", "tomorrow_night", "tomorrow_night_blue", "tomorrow_night_bright", "twilight", "vibrant_ink", "xcode"];
      }
    });
  }
]);