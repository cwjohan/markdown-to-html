'use strict';
/*
 * GET /markdown/:filename.
 */
var jade = require('jade');
var path = require('path');
var Markdown = require('markdown-to-html').Markdown;

var mdOpts = {
  highlight:  true,
  context:    'cwjohan/markdown-to-html'
};
var viewsDir = path.join(path.dirname(__dirname), 'views');

// Class RenderMarkdown.
function RenderMarkdown() {
  this.options = {}; // Default value only.

  this.routeMe = function(req, res) {
    var md = new Markdown();
    var debug = req.param('debug', false);
    md.debug = debug;
    md.bufmax = 2048;
    var fileName = path.join(viewsDir, req.params.filename);
    if (debug) console.error('>>>renderMarkdown: fileName="' + fileName + '"');
    res.write(jade.renderFile(
      path.join(viewsDir, 'mdheader.jade'),
      {title: this.options.title, subtitle: 'Markdown', pretty: true}));
    md.once('end', function() {
      res.write(jade.renderFile(path.join(viewsDir, 'mdtrailer.jade'), {pretty: true}));
      res.end();
    });
    md.render(fileName, mdOpts, function(err) {
      if (debug) console.error('>>>renderMarkdown: err=' + err);
      if (err) { res.write('>>>' + err); res.end(); return; }
      else md.pipe(res);
    });
  };
}

var singleton = new RenderMarkdown();
singleton.routeMe = singleton.routeMe.bind(singleton);
module.exports = singleton;
