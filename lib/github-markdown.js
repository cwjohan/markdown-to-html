'use strict';
// Converts a markdown file into an HTML file, writing it to stdout.
// Uses the github API, so it outputs exactly what you will see on github.
//
// Usage:
//   node format_markdown <filename> <context> <github user id>
//
var request = require('request');
var fs = require('fs');
var path = require('path');
var util = require('util');
var Readable = require('stream').Readable;
util.inherits(GithubMarkdown, Readable);

function GithubMarkdown() {
  this.super_ = this.constructor.super_;
  this.super_.call(this);
  this.debug = false;
  this.bufmax = 1024;
  this.html = '';
  this.setEncoding('utf8');
}

GithubMarkdown.prototype.render = function(fileName, opts, onDone) {
  if (this.debug) console.error('>>>rendering...');
  var context    = opts.context,
      stylesheet = opts.stylesheet,
      userName   = opts.username || 'request',
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

  if (! fileName) {
    console.log('Missing file name arg');
    process.exit();
  }

  var fileContent;
  try {
    fileContent = fs.readFileSync(fileName).toString();
  } catch(err) {
    if (onDone) onDone(err)
    else console.error('>>>' + err);
  }

  var msg = {
    text: fileContent,
    mode: 'gfm',
    context: context
  };

  var jsonMsg = JSON.stringify(msg);

  var options = {
    method: 'POST',
    preambleCRLF: true,
    postambleCRLF: true,
    uri: 'https://api.github.com/markdown',
    'content-type': 'application/json',
    headers: {
      'User-Agent' : userName
    },
    body: jsonMsg
  };

  function handleResponse(err, response, body) {
    if (this.debug) console.error('>>>handling response...');
    if (err) {
      if (onDone) onDone(err)
      else console.error('>>>upload to github failed: ', err);
      return;
    }

    if (stylesheet || title) {
      if (titleText == null) titleText = fileName;
      this.cat('<!DOCTYPE html>\n' +
               '<html>\n' +
               '<head>\n' +
               '  <title>' + titleText + '</title>\n' +
               '  <link rel="stylesheet" href="' + stylesheet + '">\n' +
               '</head>\n' +
               '<body>\n' );
    }

    this.cat(body);
    this.cat('\n');

    if (stylesheet || title) {
      this.cat( '</body>\n<\html>\n' );
    }

    if (this.debug) console.error('>>>finished getting code');
    this.done = true;
    if (onDone) onDone();
  }

  request(options, handleResponse.bind(this));
}

GithubMarkdown.prototype.cat = function(data) {
  this.html += data;
}

GithubMarkdown.prototype._read = function(size) {
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

module.exports = GithubMarkdown;

