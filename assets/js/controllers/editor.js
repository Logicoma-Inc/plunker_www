var module;

module = angular.module("plunker.editorPage", ["plunker.menu"]);

module.run([
  "menu", function(menu) {
    return menu.addItem("editor", {
      title: "Launch the Editor",
      href: "/edit/",
      'class': "icon-edit",
      text: "Editor"
    });
  }
]);