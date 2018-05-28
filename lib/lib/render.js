const fs = require('fs'),
  path = require('path'),
  util = require('util'),
  marked = require('marked');

function render(fileName, opts, onDone) {
  let flavour = opts.flavor || 'gfm',
    highlight = opts.highlight,
    stylesheet = opts.stylesheet,
    utf = opts.utf,
    context = opts.context,
    title = opts.title,
    titleText = title;

  if (title) {
    const dirName = path.dirname(fileName),
      baseName = path.basename(fileName),
      pathName = path.resolve(fileName);

    titleText = titleText.replace('$FILENAME', fileName);
    titleText = titleText.replace('$DIRNAME', dirName);
    titleText = titleText.replace('$BASENAME', baseName);
    titleText = titleText.replace('$PATHNAME', pathName);
  }

  this.done = false;

  this.once('error', function (err) {
    if (onDone) onDone(err)
    else console.error('>>>' + err);
  });

  if (fileName === null) {
    if (onDone) onDone('Missing file name argument');
    else console.error('>>>Missing file name argument');
  }
  /* 
    Read the file content.
  */
  fs.readFile(fileName, onFileReady.bind(this));
  /* 
  Process the file content.
  */
  function onFileReady(err, data) {
    if (err) {
      if (onDone) onDone(err);
      else console.error('>>>' + err);
      return;
    }
    let fileContent = data.toString();

    let options = {
      gfm: (flavour === 'gfm') ? true : false,
      breaks: true,
      tables: true,
      sanitize: true
    };

    if (highlight) {
      options['highlight'] = function (code, lang, callback) {
        pygmentize({
          lang: lang,
          format: 'html'
        }, code, function (err, result) {
          if (err) {
            callback(err);
          }
          callback(err, result.toString());
        });
      }
    }
    /* 
    Call marked to parse the file content
    */
    if (this.debug) console.error('>>>starting to get code');
    try {
      marked.setOptions(options);
      marked(fileContent, getCode.bind(this));
    } catch (err) {
      if (onDone) onDone(err)
      else console.error('>>>' + err);
    }
    /* 
     Enhance the output of marked with optional header
     or trailer. Linkify if context specified.
    */
    function getCode(err, code) {
      if (err) {
        if (onDone) onDone(err)
        else console.error('>>>' + err);
        return;
      }
      if (stylesheet || title || utf) {
        if (titleText == null) titleText = fileName;
        this.cat('<!DOCTYPE html>\n' +
          '<html>\n' +
          '<head>\n' +
          '  <title>' + titleText + '</title>\n');
        if (stylesheet) {
          this.cat('  <link rel="stylesheet" href="' + stylesheet + '">\n');
        }
        if (utf) {
          this.cat('  <meta http-equiv="Content-Type" content="text/html; charset=' + utf + '"/> \n');
        }
        this.cat('</head>\n<body>\n');
      }

      if (context) {
        this.cat(linkify(code, context));
      } else {
        this.cat(code);
      }

      if (stylesheet || title || utf) {
        this.cat('</body>\n</html>\n');
      }
      if (this.debug) console.error('>>>finished getting code');
      this.done = true;
      if (onDone) onDone();
    } 
  } 
} 

module.exports = render;