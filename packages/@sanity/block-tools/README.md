# Sanity Block Formatter

Can serialize and deserialize HTML, Slate JSON or a Sanity block array.

## Interface

```
const blogPostSchema = require('../schemas/blogPost.js')
const formatter = new BlockFormatter(
  '<html><body><h1>Hello world!</h1><body></html>'
  {schema: blogPostSchema}
)

// The input html will be deserialized into blocks
const blocks = formatter.toBlocks()

// The input html will not be deserialized into a Slate document,
// but was already set when producing the blocks above. It is simply returned.
const slateJson = formatter.toSlateJson()

```

## Options

### Setting the ``schema`` option
This is the Sanity block array schema, which will be respected
when deserializing anything into blocks.

### Using it server side with the ``parseHtml`` and ``evaluate`` option
The HTML-deserialization is done by default by the browser native DOMParser.
On the server side you can give the function ``parseHtml``
that parses the html into a DOMParser compatible model / API.

This module also use the native document.evaluate by default for xpaths.
On the server side you can give the function ``evaluate``
that returns an API compatible function with document.evaluate.

#### JSDOM and xpath example

```
const jsdom = require('jsdom')
const {JSDOM} = jsdom
const xpath = require('xpath')
const formatter = new BlockFormatter(
  '<html><body><h1>Hello world!</h1><body></html>'
  {
    parseHtml: html => new JSDOM(html),
    evaluate: xpath.evaluate
  }
)
```

### Adding extra HTML deserialization rules

You may add your own rules to deal with special HTML cases,
following the pattern of the ``slate-html-deserializer``.

HTML will always be deserialized into a Slate model first, then
converted to blocks. See the file ``./formats/html`` for the default rules.

```
options.htmlRules = [
  {
    // Special case for code blocks (wrapped in pre and code tag)
    deserialize(el, next) {
      if (el.tagName.toLowerCase() != 'pre') {
        return null
      }
      const code = el.children[0]
      const childNodes = code && code.tagName.toLowerCase() === 'code'
        ? code.childNodes
        : el.childNodes
      return {
        kind: 'block',
        type: 'code',
        nodes: next(childNodes)
      }
    }
  },
  ...
]
```
