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

Markdown.prototype.translate = function(fileName, flavour, highlight, stylesheet, context, onDone) {
  this.done = false;
  
  this.once('error', function(err) {
    if (onDone) onDone(err)
    else console.error('>>>' + err);
  });

  if (fileName === null) {
    if (onDone) onDone('Missing file name arg');
    else console.error('>>>Missing file name arg');
  }


  var fileContent;
  try {
     fileContent = fs.readFileSync(fileName).toString();
  } catch(err) {
    if (onDone) onDone(err);
    else console.error(err);
  }

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

  var getCode = function (err, code) {
    if (stylesheet) {
      this.cat('<!DOCTYPE html>\n' +
               '<html>\n' +
               '<head>\n' +
               '  <title>' + fileName + '</title>\n' +
               '  <link rel="stylesheet" href="' + stylesheet + '">\n' +
               '</head>\n' +
               '<body>' );
    }

    if (context) {
      this.cat( linkify(code, context) );
    } else {
      this.cat( code );
    }

    if (stylesheet) {
      this.cat( '</body>' );
    }
    if (this.debug) console.error('>>>finished getting code');
    this.done = true;
    if (onDone) onDone();
  }

  if (this.debug) console.error('>>>starting to get code');
  try {
    marked.setOptions(options);
    marked(fileContent, getCode.bind(this));
  } catch(err) {
    if (onDone) onDone(err)
    else console.error('>>>' + err);
  }
}

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

