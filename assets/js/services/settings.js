var module;

module = angular.module("plunker.settings", []);

module.service("settings", [
  function() {
    var e, saved, setSaved, settings;
    settings = {
      previewer: {
        delay: 1000,
        auto_refresh: true
      },
      editor: {
        tab_size: 2,
        font_size: 12,
        soft_tabs: true,
        theme: "textmate",
        keyboard_handler: "ace",
        wrap: {
          range: {
            min: 0,
            max: 80
          },
          enabled: false
        }
      }
    };
    if (typeof localStorage !== "undefined" && localStorage !== null) {
      if (saved = localStorage.getItem("plnkr_settings")) {
        try {
          saved = JSON.parse(saved);
        } catch (_error) {
          e = _error;
          saved = {};
        }
      }
      setInterval(function() {
        return localStorage.setItem("plnkr_settings", JSON.stringify(settings));
      }, 2000);
    }
    setSaved = function(parent, saved) {
      var key, val;
      for (key in saved) {
        val = saved[key];
        if (angular.isObject(val)) {
          if (angular.isObject(parent[key])) {
            setSaved(parent[key], val);
          } else {
            parent[key] = saved;
          }
        } else {
          parent[key] = val;
        }
      }
      return parent;
    };
    return setSaved(settings, saved);
  }
]);