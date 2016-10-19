'use strict';
// Converts a markdown file into an HTML file, writing it to stdout.
// Implemented as a readable stream.
//
// Usage:
//   node format_markdown <filename> <context> <github user id>
//
var marked = require('marked');
var pygmentize = require('pygmentize-bundled');
var linkify = require('../lib/gfm-linkify');
var fs = require('fs');
var path = require('path');
var util = require('util');

var Readable = require('stream').Readable;
util.inherits(Markdown, Readable);

function Markdown() {
  this.super_ = this.constructor.super_;
  this.super_.call(this);
  this.debug = false;
  this.bufmax = 1024;
  this.html = '';
  this.setEncoding('utf8');
}

Markdown.prototype.render = function(fileName, opts, onDone) {
  var flavour    = opts.flavor || 'gfm',
      highlight  = opts.highlight,
      stylesheet = opts.stylesheet,
      context    = opts.context,
      title      = opts.title,
      titleText  = title;

  if (title) {
    var dirName  = path.dirname(fileName),
        baseName = path.basename(fileName),
        pathName = path.resolve(fileName);
    titleText = titleText.replace('$FILENAME', fileName);
    titleText = titleText.replace('$DIRNAME',  dirName);
    titleText = titleText.replace('$BASENAME', baseName);
    titleText = titleText.replace('$PATHNAME', pathName);
  }

  this.done = false;
  
  this.once('error', function(err) {
    if (onDone) onDone(err)
    else console.error('>>>' + err);
  });

  if (fileName === null) {
    if (onDone) onDone('Missing file name arg');
    else console.error('>>>Missing file name arg');
  }

  //======================================================
  // Read the file content.
  //======================================================
  fs.readFile(fileName, onFileReady.bind(this));

  //======================================================
  // Process the file content.
  //======================================================
  function onFileReady(err, data) {
    if (err) {
      if (onDone) onDone(err);
      else console.error('>>>' + err);
      return;
    }

    var fileContent = data.toString();

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

    //======================================================
    // Call marked to parse the file content
    //======================================================
    if (this.debug) console.error('>>>starting to get code');
    try {
      marked.setOptions(options);
      marked(fileContent, getCode.bind(this));
    } catch(err) {
      if (onDone) onDone(err)
      else console.error('>>>' + err);
    }

    //======================================================
    // Enhance the output of marked with optional header
    // or trailer. Linkify if context specified.
    //======================================================
    function getCode(err, code) {
      if (err) {
        if (onDone) onDone(err)
        else console.error('>>>' + err);
        return;
      }
      if (stylesheet || title) {
        if (titleText == null) titleText = fileName;
        this.cat('<!DOCTYPE html>\n' +
                 '<html>\n' +
                 '<head>\n' +
                 '  <title>' + titleText + '</title>\n');
        if (stylesheet) {
          this.cat('  <link rel="stylesheet" href="' + stylesheet + '">\n');
        }
        this.cat('</head>\n<body>\n' );
      }

      if (context) {
        this.cat( linkify(code, context) );
      } else {
        this.cat( code );
      }

      if (stylesheet || title) {
        this.cat( '</body>\n</html>\n' );
      }
      if (this.debug) console.error('>>>finished getting code');
      this.done = true;
      if (onDone) onDone();
    } // end getCode
  } // end onFileReady
} // end render

Markdown.prototype.cat = function(data) {
  this.html += data;
}

Markdown.prototype._read = function(size) {
  var pushSize = Math.min(size, this.bufmax);
  if (this.html.length > 0) {
    if (this.debug) console.error('>>>_read size=' + pushSize + ', html="' + this.html.substr(0, pushSize) + '"');
    this.push(this.html.substr(0, pushSize));
    this.html = this.html.slice(pushSize);
    if (this.done && this.html.length === 0) {
      this.push(null); // eof
    }
  } else {
    if (this.debug) console.error('>>>_read - nothing to push');
  }
  return;
}

module.exports = Markdown;

