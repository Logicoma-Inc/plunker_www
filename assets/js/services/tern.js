module = angular.module("plunker.tern", []);

module.factory("tern", [
  function() {
    var defs, getFile, server, session;
    defs = [];
    session = null;
    getFile = function(filename) {
      var buffer;
      if (buffer = session.getBufferByFilename(filename)) {
        return buffer.content;
      }
      return "";
    };
    server = new tern.Server({
      getFile: getFile,
      async: true,
      defs: defs,
      debug: true,
      plugins: {}
    });
    return {
      setSession: function(set) {
        return session = set;
      },
      requestCompletions: function(filename, pos, cb) {
        var buffId, buffer, payload, ref;
        if (!session.getActiveBuffer().filename.match(/\.js$/)) {
          cb(null, []);
        }
        payload = {
          query: {
            type: "completions",
            lineCharPositions: true,
            types: true,
            docs: true,
            file: filename,
            end: {
              line: pos.row,
              ch: pos.column
            }
          },
          files: []
        };
        ref = session.buffers;
        for (buffId in ref) {
          buffer = ref[buffId];
          if (buffer.filename.match(/\.js$/)) {
            payload.files.push({
              type: "full",
              name: buffer.filename,
              text: buffer.content
            });
          }
        }
        return server.request(payload, function(err, response) {
          var completion, i, len, range, ref1, suggestions;
          range = {
            start: {
              row: response.start.line,
              column: response.start.ch
            },
            end: {
              row: response.end.line,
              column: response.end.ch
            }
          };
          suggestions = [];
          ref1 = response.completions;
          for (i = 0, len = ref1.length; i < len; i++) {
            completion = ref1[i];
            suggestions.push({
              text: completion.name,
              value: completion.name,
              range: range
            });
          }
          return cb(err, suggestions);
        });
      }
    };
  }
]);