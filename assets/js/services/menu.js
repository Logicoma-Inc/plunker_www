var module;

module = angular.module("plunker.menu", []);

module.service("menu", [
  function() {
    var menu;
    menu = {
      items: [],
      active: null
    };
    menu.addItem = function(name, item) {
      item.id = name;
      return menu.items.push(item);
    };
    menu.activate = function(name) {
      var i, item, len, ref, results;
      ref = this.items;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        item = ref[i];
        if (item.id === name) {
          results.push(menu.active = item);
        }
      }
      return results;
    };
    menu.deactivate = function() {
      return menu.active = null;
    };
    return menu;
  }
]);