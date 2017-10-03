import HtmlDeserializer from './HtmlDeserializer'
import blocksToSlateJson from './converters/blocksToSlateJson'
import slateJsonToBlocks from './converters/slateJsonToBlocks'

/**
 * BlockTools - various tools for Sanity block content
 *
 * @param {Object} blockContentType
 *    The compiled schema for the block content type to work with
 *
 */

export default {

  /**
   * Convert HTML to blocks respecting the block content type's schema
   *
   * @param {String} html
   *
   * @param {Object} blockContentType
   *    The compiled block content type which the deserializer will respect.
   *
   * @param {Object} options
   *   @property {Array} rules
   *      Optional rules working on the HTML (will be ruled first)
   *   @property {Function} parseHtml
   *      API compatible model as returned from DOMParser for using server side.
   */

  htmlToBlocks(html, options = {}) {
    const deserializer = new HtmlDeserializer(options)
    return deserializer.deserialize(html)
  },

  slateJsonToBlocks(slateJson) {
    return slateJsonToBlocks(slateJson)
  },

  blocksToSlateJson(blocks) {
    return blocksToSlateJson(blocks)
  }

}
