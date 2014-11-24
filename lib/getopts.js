// This module parses command line args and puts them in a hash which is returned as opts.
var path = require('path');
var name = path.basename(process.argv[1]);

module.exports = function() {
  var opts = require('yargs')
    .usage('Convert a ' + name +' or gfm file into HTML. "gfm" refers to Github flavored markdown.\n' +
           'Usage: ' + name + ' file-to-convert [options]')
    .example(name + ' README.md -h',
             'Convert gfm README.md to HTML with code highlighting')
    .example(name + ' test/test.md -h -s test/style.css',
             'Convert gfm README.md to HTML with code highlighting. Use stylesheet "style.css"')
    .example(name + ' REAMDE.md -f markdown',
             'Convert standard markdown README.md to HTML. Assumes file is not "gfm".')
    .example(name + ' REAMD.md -c cwjohan/node-redis',
             'Convert gfm README.md to HTML. Uses the given CSS file to format the output.')
    .example(name + ' --help', 'Display this usage info.')
    .demand(1)
    .options('f', { alias: 'flavor'})
    .options('h', { alias: 'highlight', default: false})
    .options('s', { alias: 'stylesheet'})
    .options('c', { alias: 'context'})
    .options('t', { alias: 'title'})
    .options('v', { alias: 'verbose', default: false})
    .options('d', { alias: 'debug', default: false})
    .boolean(['h', 'v', 'd'])
    .requiresArg(['f', 's', 'c', 't'])
    .describe({f: 'Type of file: "gfm" or "markdown"',
               h: 'Highlight any source code in the output',
               s: 'Path to the stylesheet to use',
               c: 'Github user/project to use with #<n> issue number references',
               t: 'Add a page title to the header (e.g., $FILENAME, $DIRNAME, $BASENAME, or $PATHNAME).',
               v: 'Verbose output',
               d: 'Debug output'})
    .strict()
    .argv;

  return opts;
}
