// This module parses command line args and puts them in a hash which is returned as opts.

module.exports = function() {
  var opts = require('yargs')
    .usage('Convert a markdown or gfm file into HTML. "gfm" refers to Github flavored markdown.\n' +
           'Usage: markdown file-to-convert [options]')
    .example('markdown README.md -h',
             'Convert gfm README.md to HTML with code highlighting')
    .example('markdown test/test.md -h -s test/style.css',
             'Convert gfm README.md to HTML with code highlighting. Use stylesheet "style.css"')
    .example('markdown REAMDE.md -f markdown',
             'Convert standard markdown README.md to HTML. Assumes file is not "gfm".')
    .example('markdown REAMD.md -c cwjohan/node-redis',
             'Convert gfm README.md to HTML. Uses the given CSS file to format the output.')
    .example('markdown --help', 'Display this usage info.')
    .demand(1)
    .options('f', { alias: 'flavor', default: 'gfm'})
    .options('h', { alias: 'highlight', default: false})
    .options('s', { alias: 'stylesheet'})
    .options('c', { alias: 'context'})
    .boolean(['h'])
    .requiresArg(['f', 's', 'c'])
    .describe({f: 'Type of file: "gfm" or "markdown"',
               h: 'Highlight any source code in the output',
               s: 'Path to the stylesheet to use',
               c: 'Github user/project to use with #<n> issue number references'})
    .strict()
    .argv;

  return opts;
}
