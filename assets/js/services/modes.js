var module,
  hasProp = {}.hasOwnProperty;

module = angular.module("plunker.modes", []);

module.service("modes", function() {
  var Modes;
  return new (Modes = (function() {
    function Modes() {
      var mode, name, ref;
      this.modes = {
        c_cpp: {
          title: "C/C++",
          extensions: ["c", "cpp", "cxx", "h", "hpp"]
        },
        clojure: {
          title: "Clojure",
          extensions: ["clj"]
        },
        coffee: {
          title: "CoffeeScript",
          extensions: ["coffee"],
          snips: true
        },
        coldfusion: {
          title: "ColdFusion",
          extensions: ["cfm"]
        },
        csharp: {
          title: "C#",
          extensions: ["cs"]
        },
        css: {
          title: "CSS",
          extensions: ["css"],
          snips: true
        },
        groovy: {
          title: "Groovy",
          extensions: ["groovy"]
        },
        haxe: {
          title: "haXe",
          extensions: ["hx"]
        },
        html: {
          title: "HTML",
          extensions: ["html", "htm"],
          snips: true
        },
        jade: {
          title: "Jade",
          extensions: ["jade"]
        },
        java: {
          title: "Java",
          extensions: ["java"]
        },
        javascript: {
          title: "JavaScript",
          extensions: ["js"],
          snips: true
        },
        json: {
          title: "JSON",
          extensions: ["json"]
        },
        jsx: {
          title: "jsx",
          extensions: ["jsx"]
        },
        latex: {
          title: "LaTeX",
          extensions: ["tex"]
        },
        less: {
          title: "Less",
          extensions: ["less"]
        },
        livescript: {
          title: "LiveScript",
          extensions: ["ls"],
          snips: true
        },
        lua: {
          title: "Lua",
          extensions: ["lua"]
        },
        markdown: {
          title: "Markdown",
          extensions: ["md", "markdown"],
          snips: true
        },
        ocaml: {
          title: "OCaml",
          extensions: ["ml", "mli"]
        },
        perl: {
          title: "Perl",
          extensions: ["pl", "pm"]
        },
        pgsql: {
          title: "pgSQL",
          extensions: ["pgsql", "sql"]
        },
        php: {
          title: "PHP",
          extensions: ["php"]
        },
        powershell: {
          title: "Powershell",
          extensions: ["ps1"]
        },
        python: {
          title: "Python",
          extensions: ["py"]
        },
        scala: {
          title: "Scala",
          extensions: ["scala"]
        },
        scss: {
          title: "SCSS",
          extensions: ["scss"]
        },
        stylus: {
          title: "Stylus",
          extensions: ["styl"]
        },
        ruby: {
          title: "Ruby",
          extensions: ["rb", "rbx"]
        },
        sql: {
          title: "SQL",
          extensions: ["sql"]
        },
        svg: {
          title: "SVG",
          extensions: ["svg"]
        },
        text: {
          title: "Text",
          extensions: ["txt"]
        },
        textile: {
          title: "Textile",
          extensions: ["textile"]
        },
        typescript: {
          title: "Typescript",
          extensions: ["ts"]
        },
        xml: {
          title: "XML",
          extensions: ["xml"]
        }
      };
      ref = this.modes;
      for (name in ref) {
        if (!hasProp.call(ref, name)) continue;
        mode = ref[name];
        mode.name = name;
        mode.regex = new RegExp("\\.(" + mode.extensions.join("|") + ")$", "i");
        mode.source = "ace/mode/" + name;
      }
    }

    Modes.prototype.findByFilename = function(filename) {
      var mode, name, ref;
      ref = this.modes;
      for (name in ref) {
        mode = ref[name];
        if (filename.match(mode.regex)) {
          return mode;
        }
      }
      return this.modes.text;
    };

    return Modes;

  })());
});