/*
 * Adapted from Github's port of showdown.js -- A javascript port of Markdown.
 *
 * GitHub Flavored Markdown modifications by Tekkub
 * @see https://github.com/isaacs/github-flavored-markdown/blob/master/scripts/showdown.js
 * Fixes for "&#39;" issue misrecognition by C. W. Johannsen.
 */
var debug = false;

module.exports = function (text, context) {
  var username, repo;
  if (debug) console.log('>>>context="' + context + "'");
  if (context) {
    var parts = context.split('/');
    username = parts[0];
    repo = parts[1];
    if (!repo) context = null;
  }

  // Auto-link user/repo@sha1
  text = text.replace(/([a-z0-9_\-+=.]+\/[a-z0-9_\-+=.]+)@([a-f0-9]{40})/ig, function (wholeMatch, context, sha) {
    if (debug) console.log('wholeMatch 1="' + wholeMatch + '"');
    return '<a href="https://github.com/' + context + '/commit/' + sha + '">' + context + '@' + sha.substring(0, 7) + '</a>';
  });

  // Auto-link user@sha1 and user#issue if repo is defined
  if (repo) {
    text = text.replace(/([a-z0-9_\-+=.]+)@([a-f0-9]{40})/ig, function (wholeMatch, username, sha, matchIndex) {
      if (debug) console.log('wholeMatch 2="' + wholeMatch + '"');
      var left = text.slice(0, matchIndex), right = text.slice(matchIndex);
      if (left.match(/\/$/) || (left.match(/<[^>]+$/) && right.match(/^[^>]*>/))) return wholeMatch;
      return '<a href="https://github.com/' + username + '/' + repo + '/commit/' + sha + '">' + username + '@' + sha.substring(0, 7) + '</a>';
    });
    text = text.replace(/([a-z0-9_\-+=.]+)#([0-9]+)/ig, function (wholeMatch, username, issue, matchIndex) {
      if (debug) console.log('wholeMatch 3="' + wholeMatch + '", username="' + username + '", issue="' + issue + '"');
      var left = text.slice(0, matchIndex), right = text.slice(matchIndex);
      if (left.match(/\/$/) || (left.match(/<[^>]+$/) && right.match(/^[^>]*>/))) return wholeMatch;
      return '<a href="https://github.com/' + username + '/' + repo + '/issues/' + issue + '">' + wholeMatch + '</a>';
    });
  }

  // Auto-link sha1 and #issue if context is defined
  if (context) {
    text = text.replace(/[a-f0-9]{40}/ig, function (wholeMatch, matchIndex) {
     if (debug) console.log('wholeMatch 4="' + wholeMatch + '"');
     var left = text.slice(0, matchIndex), right = text.slice(matchIndex);
      if (left.match(/@$/) || (left.match(/<[^>]+$/) && right.match(/^[^>]*>/))) return wholeMatch;
      return '<a href="https://github.com/' + context + '/commit/' + wholeMatch + '">' + wholeMatch.substring(0, 7) + '</a>';
    });
    text = text.replace(/[^\&]#([0-9]+)/ig, function (wholeMatch, issue, matchIndex) {
      if (debug) console.log('wholeMatch 5="' + wholeMatch + '", issue="' + issue + '"');
      var left = text.slice(0, matchIndex+1), right = text.slice(matchIndex);
      if (debug) console.log('left="' + left + '", right="' + right + '"');
      if (left.match(/[a-z0-9_\-+=.]$/) || (left.match(/<[^>]+$/) && right.match(/^[^>]*>/))) return wholeMatch;
      return wholeMatch.slice(0,1) + '<a href="https://github.com/' + context + '/issues/' + issue + '">' + wholeMatch.slice(1) + '</a>';
    });
  }

  // Auto-link user/repo#issue
  text = text.replace(/([a-z0-9_\-+=.]+\/[a-z0-9_\-+=.]+[^&]?)#([0-9]+)/ig, function (wholeMatch, context, issue) {
    if (debug) console.log('wholeMatch 6="' + wholeMatch + '", context="' + context + '", issue=' + issue);
    return '<a href="https://github.com/' + context + '/issues/' + issue + '">' + wholeMatch + '</a>';
  });


  return text;
};
