'use strict';
/*
 * GET /github-markdown/:filename.
 */
var jade = require('jade');
var path = require('path');
var GithubMarkdown = require('markdown-to-html').GithubMarkdown;

var mdOpts = {
  flavor:     'markdown',
  context:    'cwjohan/node-redis-queue',
  username:   'guest'
};
var viewsDir = path.join(path.dirname(__dirname), 'views');

// Class RenderGithubMarkdown.
function RenderGithubMarkdown() {
  this.options = {}; // Default value only.

  this.routeMe = function(req, res) {
    var md = new GithubMarkdown();
    var debug = req.param('debug', false);
    md.debug = debug;
    md.bufmax = 2048;
    var fileName = path.join(viewsDir, req.params.filename);
    if (debug) console.error('>>>renderMarkdown: fileName="' + fileName + '"');
    res.write(jade.renderFile(
      path.join(viewsDir, 'mdheader.jade'),
       {title: this.options.title, subtitle: 'Github-Markdown', pretty: true}));
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

var singleton = new RenderGithubMarkdown();
singleton.routeMe = singleton.routeMe.bind(singleton);
module.exports = singleton;
