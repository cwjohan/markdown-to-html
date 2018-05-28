'use strict';

let marked = require('marked');

let fs = require('fs');
let path = require('path');
let util = require('util');
let cat = require('./lib/cat');
let render = require('./lib/render');
let read = require('./lib/_read');

let Readable = require('stream').Readable;
util.inherits(Markdown, Readable);

function Markdown() {
  this.super_ = this.constructor.super_;
  this.super_.call(this);
  this.debug = false;
  this.bufmax = 1024;
  this.html = '';
  this.setEncoding('utf8');
}

Markdown.prototype.render = render;

Markdown.prototype.cat = cat;

Markdown.prototype._read = read;

module.exports = Markdown;

