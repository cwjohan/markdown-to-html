'use strict';
var home = require('./home');
var renderMarkdown = require('./renderMarkdown');
var renderGithubMarkdown = require('./renderGithubMarkdown');

// options shared to all routing modules
function setOptions(options) {
  exports.options = options;
  home.options = options;
  renderMarkdown.options = options;
  renderGithubMarkdown.options = options;
}

// exports:
exports.setOptions = setOptions;
exports.home = home;
exports.markdown = renderMarkdown;
exports.github_markdown = renderGithubMarkdown;


