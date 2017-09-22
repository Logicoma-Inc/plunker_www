var module;

module = angular.module("plunker.notifier", []);

module.factory("notifier", [
  "$rootScope", function($rootScope) {
    var fn, i, len, method, methods, notifier;
    notifier = {};
    methods = ["alert", "success", "error", "warning", "information", "confirm"];
    notifier.prompt = function(message, dflt, options) {
      var value;
      if (dflt == null) {
        dflt = "";
      }
      if (options == null) {
        options = {};
      }
      if (angular.isObject(dflt)) {
        options = dflt;
        dflt = "";
      }
      options.confirm || (options.confirm = angular.noop);
      options.deny || (options.deny = angular.noop);
      if ((value = window.prompt(message, dflt)) !== null) {
        return options.confirm(value);
      } else {
        return options.deny();
      }
    };
    fn = function(method) {
      return notifier[method] = function(title, text, options) {
        var dfd;
        if (options == null) {
          options = {};
        }
        dfd = null;
        switch (arguments.length) {
          case 3:
            options.title = title;
            options.text = text;
            break;
          case 2:
            options.title = title;
            if (angular.isObject(text)) {
              options = angular.extend(text, options);
            } else {
              options.text = text;
            }
            break;
          case 1:
            if (angular.isObject(title)) {
              options = angular.extend(title, options);
            } else {
              options.text = title;
            }
        }
        options.layout || (options.layout = "bottomRight");
        options.type || (options.type = method);
        options.timeout || (options.timeout = "3000");
        options.text = (options.title ? options.title + " - " : "") + options.text;
        if (options.type === "confirm") {
          options.confirm || (options.confirm = angular.noop);
          options.deny || (options.deny = angular.noop);
          angular.extend(options, {
            layout: "center",
            force: true,
            modal: true,
            animation: {
              open: {
                height: "toggle"
              },
              close: {
                height: "toggle"
              },
              easing: 'swing',
              speed: 1
            },
            buttons: [
              {
                addClass: "btn btn-primary",
                text: "Yes",
                onClick: function($noty) {
                  $noty.close();
                  return $rootScope.$apply(options.confirm);
                }
              }, {
                addClass: "btn btn-danger",
                text: "No",
                onClick: function($noty) {
                  $noty.close();
                  return $rootScope.$apply(options.deny);
                }
              }
            ]
          });
        }
        if (options.title) {
          options.title = he.encode(options.title);
        }
        if (options.text) {
          options.text = he.encode(options.text);
        }
        return noty(options);
      };
    };
    for (i = 0, len = methods.length; i < len; i++) {
      method = methods[i];
      fn(method);
    }
    return notifier;
  }
]);