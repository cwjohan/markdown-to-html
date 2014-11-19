'use strict';
/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes'); // loads ./routes/index.js
var http = require('http');
var path = require('path');

var serveFavicon = require('serve-favicon');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var port = process.env.PORT || 3000;

// Options:
routes.setOptions({
  title: 'Markdown-to-HTML Demo App',
});

// Middleware:
var web = express();
web.set('views', path.join(__dirname, 'views'));
web.set('view engine', 'jade');
web.use(serveFavicon(path.join(__dirname, 'public/images/Favicon.png')));
web.use(logger(isDevelopment() ? 'dev' : 'combined'));
web.use(require('stylus').middleware(path.join(__dirname, 'public')));
web.use(express.static(path.join(__dirname, 'public')));

// Development only:
if (isDevelopment()) {
  // Handle errors and respond with content negotiation.
  // Sends full error stack back to client.
  web.use(errorHandler());
}

web.get('/', routes.home.routeMe);
web.get('/markdown/:filename', routes.markdown.routeMe);
web.get('/github-markdown/:filename', routes.github_markdown.routeMe);

process.on('SIGTERM', shutDown); // Doesn't work in win32 os.
process.on('SIGINT', shutDown);

http.createServer(web).listen(port, function(){
  console.log('Express server listening on port ' + port);
  console.log('options=', routes.options);
});

function isDevelopment() {
  return 'development' === web.get('env'); // NODE_ENV setting, defaults to 'development'.
}

function shutDown() {
  console.log('Shutting server down. No longer listening on port ' + port + '.');
  process.exit();
}

