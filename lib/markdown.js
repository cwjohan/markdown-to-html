'use strict';
// Converts a markdown file into an HTML file, writing it to stdout.
//
// Usage:
//   node format_markdown <filename> <context> <github user id>
//
var marked = require('marked');
var pygmentize = require('pygmentize-bundled');
var linkify = require('../lib/gfm-linkify');
var fs = require('fs');

module.exports = function(fileName, flavour, highlight, stylesheet, context) {
  if (! fileName) {
    console.log('Missing file name arg');
    process.exit();
  }

  var fileContent = fs.readFileSync(fileName).toString();

  var options = {
    gfm: (flavour === 'gfm') ? true : false,
    breaks: true,
    tables: true,
    sanitize: true
  };

  if (highlight) {
    options['highlight'] = function(code, lang, callback) {
      pygmentize({lang: lang, format: 'html'}, code, function(err, result) {
        if (err) {
          callback(err);
        }
        callback(err, result.toString());
      });
    }
  }

  marked.setOptions(options);
  marked(fileContent, function (err, code) {

    if (stylesheet) {
      console.log('<!DOCTYPE html>\n' +
                  '<html>\n' +
                  '<head>\n' +
                  '  <title>' + fileName + '</title>\n' +
                  '  <link rel="stylesheet" href="' + stylesheet + '">\n' +
                  '</head>\n' +
                  '<body>');
    }

    if (context) {
      code = linkify(code, context);
    }

    console.log(code);

    if (stylesheet) {
      console.log('</body>');
    }
  });
}

