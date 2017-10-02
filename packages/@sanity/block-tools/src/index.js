import Html from 'slate-html-serializer'
import {createHtmlRules, preprocessHtml, defaultParseHtml} from './formats/html'
import blocksToSlateJson from './formats/blocks'
import slateJsonToBlocks from './formats/slate'

import {SLATE_DEFAULT_BLOCK} from './constants'

/***
 *  Serializes and deserializes block array related formats as HTML and Slate raw structures.
 *
 *  @param data {string|object}
 *    Either HTML, Slate Raw or a Sanity block array.
 *
 *  @param options {object}
 *
 *    enabledBlockStyles {array}
 *      - Array of style names {string}
 *    enabledBlockDecorators {array}
 *      - Array of decorator names {string}
 *    enabledBlockAnnotations {array}
 *      - Array of annotation type names {string}
 *    htmlRules {array}
 *      - Array of optional rules for html deserialization (see ./formats/html.js)
 *    parseHtml {function}
 *      - a function that can deserialize html into a DOMParser compatible API,
 *        when used server side (i.e. JSDom)
 */

export default class BlockFormatter {

  constructor(data, options) {
    this.data = {html: null, slateJson: null, blocks: null}
    // Test for which format the input data is
    if (data.test(/<html/i)) {
      this.data.html = data
    } else if (data.test(/<html/i)) {
      this.data.slateJson = data
    } else if (Array.isArray(data)) {
      this.data.blocks = data
    }
    if (!Object.keys(this.data).some(key => this.data[key])) {
      throw new Error('Could not figure out which format the input data is.')
    }
    this.htmlRules = createHtmlRules(options)
    this.parseHtml = options.parseHtml || defaultParseHtml
    return this
  }

  toSlateJson() {
    if (this.data.slateJson) {
      return this.data.slateJson
    }
    if (this.data.blocks) {
      this.data.slateJson = blocksToSlateJson(this.data.blocks)
      return this.data.slateJson
    }
    const deserializer = new Html({
      rules: this.htmlRules,
      defaultBlock: SLATE_DEFAULT_BLOCK
    })
    this.data.slateJson = deserializer.deserialize(this.data.html)
    return this.data.slateJson
  }

  toBlocks() {
    if (this.data.blocks) {
      return this.data.blocks
    }
    if (!this.data.slateJson) {
      this.toSlateJson()
    }
    this.data.blocks = slateJsonToBlocks(this.data.slateJson)
    return this.data.blocks
  }

  toHtml() {
    if (!this.data.blocks && this.data.slateJson) {
      this.toBlocks()
    }
    // TODO: hook up block-content-to-html here
    this.data.html = '<html />'
    return this.data.html
  }

}

