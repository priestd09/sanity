# Sanity Block Tools

Various tools for Sanity block content.

## Interface

```
import blockTools from '@sanity/block-tools'

// Convert HTML to blocks
const blocks = blockTools.htmlToBlocks(html, options)

// Convert Slate JSON to blocks
const blocks = blockTools.slateJsonToBlocks(slateJson)

// Convert blocks to Slate JSON
const slateJson = blockTools.blocksToSlateJson(blocks)


```

## Methods

### htmlToBlocks

This will deserialize HTML into blocks.

#### Using it server side with the ``parseHtml`` option
The HTML-deserialization is done by default by the browser's native DOMParser.
On the server side you can give the function ``parseHtml``
that parses the html into a DOMParser compatible model / API.


##### JSDOM example

```
const jsdom = require('jsdom')
const {JSDOM} = jsdom
import blockTools from '@sanity/block-tools'

blockTools.htmlToBlocks(
  '<html><body><h1>Hello world!</h1><body></html>',
  {
    blockContentType: compiledBlockContentType,
    parseHtml: html => new JSDOM(html)
  }
)
```

#### Adding extra HTML deserialization rules

You may add your own rules to deal with special HTML cases.

```
blockTools.htmlToBlocks(
  '<html><body><h1>Hello world!</h1><body></html>',
  {
    blockContentType: compiledBlockContentType,
    parseHtml: html => new JSDOM(html),
    rules: [
      // Special rule for code blocks (wrapped in pre and code tag)

      {
        deserialize(el, next) {
          if (el.tagName.toLowerCase() != 'pre') {
            return undefined
          }
          const code = el.children[0]
          const childNodes = code && code.tagName.toLowerCase() === 'code'
            ? code.childNodes
            : el.childNodes
          let text = ''
          childNodes.forEach(node => {
            text += node.textContent
          })
          return {
            _type: 'span',
            marks: ['code'],
            text: text
          }
        }
      }
    ]
  }
)

```
