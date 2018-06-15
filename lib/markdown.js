'use strict';

const marked = require('marked');
const pygmentize = require('pygmentize-bundled');
const linkify = require('../lib/gfm-linkify');
const fs = require('fs');
const path = require('path');
const util = require('util');

const Readable = require('stream').Readable;
util.inherits(Markdown, Readable);

function Markdown() {
    this.super_ = this.constructor.super_;
    this.super_.call(this);
    this.debug = false;
    this.bufmax = 1024;
    this.html = '';
    this.setEncoding('utf8');
}

Markdown.prototype.renderFromString = function (markdownContent, opts, onDone) {
    let flavour = opts.flavor || 'gfm',
        highlight = opts.highlight,
        stylesheet = opts.stylesheet,
        context = opts.context,
        title = opts.title,
        titleText = title,
        htmlTemplate = opts.template;

    this.done = false;

    this.once('error', function (err) {
        if (onDone) onDone(err);
        else console.error('>>> ' + err);
    });

    if (!markdownContent) {
        if (onDone) onDone('Missing markdown content');
        else console.error('>>> Missing markdown content');
    }

    //======================================================
    // Process the file content.
    //======================================================

    let options = {
        gfm: (flavour === 'gfm'),
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

    //======================================================
    // Call marked to parse the file content
    //======================================================
    if (this.debug) console.error('>>>starting to get code');
    try {
        marked.setOptions(options);
        marked(markdownContent, getCode.bind(this));
    } catch (err) {
        if (onDone) onDone(err);
        else console.error('>>> ' + err);
    }

    //======================================================
    // Enhance the output of marked with optional header
    // or trailer. Linkify if context specified.
    //======================================================
    function getCode(err, code) {
        if (err) {
            if (onDone) onDone(err);
            else console.error('>>> ' + err);
            return;
        }

        if (htmlTemplate) {
            this.cat(fs.readFileSync(htmlTemplate));

            let mdCode = '';
            if (context) {
                mdCode = linkify(code, context);
            } else {
                mdCode = code;
            }
            this.replace(mdCode);
            if (title) {
                this.html = this.html.replace('{title}', titleText);
            }
        } else {
            if (stylesheet || title) {
                if (titleText == null) titleText = 'No Title';
                this.cat('<!DOCTYPE html>\n<html>\n<head>\n    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>\n    <title>' + titleText + '</title>\n');
                if (stylesheet) {
                    this.cat('  <link rel="stylesheet" href="' + stylesheet + '">\n');
                }
                this.cat('</head>\n<body>\n');
            }

            if (context) {
                this.cat(linkify(code, context));
            } else {
                this.cat(code);
            }

            if (stylesheet || title) {
                this.cat('</body>\n</html>\n');
            }
        }

        if (this.debug) console.error('>>>finished getting code');
        this.done = true;

        if (onDone) streamToString(this, data => onDone(null, data));
    }
};

Markdown.prototype.render = function (fileName, opts, onDone) {
    let flavour = opts.flavor || 'gfm',
        highlight = opts.highlight,
        stylesheet = opts.stylesheet,
        context = opts.context,
        title = opts.title,
        titleText = title,
        htmlTemplate = opts.template;

    if (title) {
        let dirName = path.dirname(fileName),
            baseName = path.basename(fileName),
            pathName = path.resolve(fileName);
        titleText = titleText.replace('$FILENAME', fileName);
        titleText = titleText.replace('$DIRNAME', dirName);
        titleText = titleText.replace('$BASENAME', baseName);
        titleText = titleText.replace('$PATHNAME', pathName);
    }

    this.done = false;

    this.once('error', function (err) {
        if (onDone) onDone(err);
        else console.error('>>> ' + err);
    });

    if (fileName === null) {
        if (onDone) onDone('Missing file name arg');
        else console.error('>>> Missing file name arg');
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

        let fileContent = data.toString();

        let options = {
            gfm: (flavour === 'gfm'),
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

        //======================================================
        // Call marked to parse the file content
        //======================================================
        if (this.debug) console.error('>>>starting to get code');
        try {
            marked.setOptions(options);
            marked(fileContent, getCode.bind(this));
        } catch (err) {
            if (onDone) onDone(err);
            else console.error('>>> ' + err);
        }

        //======================================================
        // Enhance the output of marked with optional header
        // or trailer. Linkify if context specified.
        //======================================================
        function getCode(err, code) {
            if (err) {
                if (onDone) onDone(err);
                else console.error('>>> ' + err);
                return;
            }

            if (htmlTemplate) {
                this.cat(fs.readFileSync(htmlTemplate));

                let mdCode = '';
                if (context) {
                    mdCode = linkify(code, context);
                } else {
                    mdCode = code;
                }
                this.replace(mdCode);
                if (title) {
                    this.html = this.html.replace('{title}', titleText);
                }
            } else {
                if (stylesheet || title) {
                    if (titleText == null) titleText = fileName;
                    this.cat("<!DOCTYPE html>\n<html>\n<head>\n    <meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\"/>    <title>" + titleText + '</title>\n');
                    if (stylesheet) {
                        this.cat('  <link rel="stylesheet" href="' + stylesheet + '">\n');
                    }
                    this.cat('</head>\n<body>\n');
                }

                if (context) {
                    this.cat(linkify(code, context));
                } else {
                    this.cat(code);
                }

                if (stylesheet || title) {
                    this.cat('</body>\n</html>\n');
                }
            }

            if (this.debug) console.error('>>>finished getting code');
            this.done = true;
            if (onDone) streamToString(this, data => onDone(null, data));
        }
    }
};

Markdown.prototype.cat = function (data) {
    this.html += data;
};

Markdown.prototype.replace = function (data) {
    this.html = this.html.replace('{markdown}', data);
};

Markdown.prototype._read = function (size) {
    const pushSize = Math.min(size, this.bufmax);
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
};

function streamToString(stream, callback) {
    const chunks = [];
    stream.on('data', (chunk) => {
        chunks.push(chunk.toString());
    });
    stream.on('end', () => {
        callback(chunks.join(''));
    });
}

module.exports = Markdown;