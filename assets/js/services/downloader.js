var module;

module = angular.module("plunker.downloader", []);

module.factory("downloader", [
  function() {
    return {
      download: function(json, saveAs) {
        var event, file, filename, link, ref, url, zip;
        if (saveAs == null) {
          saveAs = "plunker.zip";
        }
        zip = new JSZip();
        ref = json.files;
        for (filename in ref) {
          file = ref[filename];
          zip.file(file.filename, file.content);
        }
        url = "data:application/zip;base64," + zip.generate();
        link = document.createElement("a");
        if (link.download != null) {
          link.setAttribute("href", url);
          link.setAttribute("download", saveAs);
          event = document.createEvent('MouseEvents');
          event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
          return link.dispatchEvent(event);
        } else {
          return window.open(url, "_blank", "");
        }
      }
    };
  }
]);