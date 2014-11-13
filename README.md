markdown-to-html
================

Command-line utility to convert Github Flavored Markdown to HTML. (under construction)

##Example Usage

####Output HTML to stdout

```
markdown <options> myfile.md
```
####Output HTML to default browser

```
markdownb <options> myfile.md
```

####Output the Github API results to stdout

```
github-markdown myfile.md
```

####Output the Github API results to default browser

```
github-markdownb myfile.md
```

##Options for markdown and markdownb

`--format <type>` -- Format as type 'gfm' (default) or just plain 'markdown'.

`--highlight` -- Highlight code blocks with style info.

`--style <stylesheet>` -- Output HTML header with link element referring to the given stylesheet.

`--title <title>` -- Output HTML header with given title. Title string may include `$FILENAME` or `$FILEPATH`
variables which are replaced by the corresponding .md filename or path.
