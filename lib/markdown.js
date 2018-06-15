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

const CONTENT_FILE = "content_file", CONTENT_TEXT = "content_text";

const TEMPLATE_FILE = "template_file", TEMPLATE_TEXT = "template_text";

Markdown.prototype.render = function (content, opts, onDone) {
    let flavour = opts.flavor || 'gfm',
        highlight = opts.highlight,
        stylesheet = opts.stylesheet,
        context = opts.context,
        title = opts.title,
        titleText = title,
        markdownType = opts.content_type,
        templateType = opts.template_type,
        htmlTemplate = opts.template;

    if (title && markdownType === CONTENT_FILE) {
        let dirName = path.dirname(content),
            baseName = path.basename(content),
            pathName = path.resolve(content);
        titleText = titleText.replace('$FILENAME', content);
        titleText = titleText.replace('$DIRNAME', dirName);
        titleText = titleText.replace('$BASENAME', baseName);
        titleText = titleText.replace('$PATHNAME', pathName);
    }

    this.done = false;

    this.once('error', function (err) {
        if (onDone) onDone(err);
        else console.error('>>> ' + err);
    });

    if (!content) {
        if (onDone) onDone('Missing markdown content');
        else console.error('>>> Missing markdown content');
    }

    //======================================================
    // Read the file content.
    //======================================================
    let markdownContent;

    switch (markdownType) {
        case CONTENT_FILE: {
            markdownContent = fs.readFileSync(content).toString();
            break;
        }
        case CONTENT_TEXT: {
            markdownContent = content;
            break;
        }
        default: throw new Error('Unknown type of markdown content: ' + markdownType);
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

        if (templateType && htmlTemplate) {
            let templateContent;

            switch (templateType) {
                case TEMPLATE_FILE: {
                    templateContent = fs.readFileSync(htmlTemplate);
                    break;
                }
                case TEMPLATE_TEXT: {
                    templateContent = htmlTemplate;
                    break;
                }
                default: {
                    throw new Error('Unknown html template type: ' + templateType);
                }
            }

            this.cat(templateContent);

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