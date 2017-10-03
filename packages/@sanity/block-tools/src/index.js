// @flow

import HtmlDeserializer from './HtmlDeserializer'
import blocksToSlateJson from './converters/blocksToSlateState'
import slateStateToBlocks from './converters/slateStateToBlocks'
import blockContentTypeToOptions from './util/blockContentTypeToOptions'

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
   * @param {Object} options
   *   @property {Object} blockContentType
   *      A compiled version of the schema type for the block content
   *   @property {Array} rules
   *      Optional rules working on the HTML (will be ruled first)
   *   @property {Function} parseHtml
   *      API compatible model as returned from DOMParser for using server side.
   * @returns {Array} Blocks
   */
  htmlToBlocks(html, options = {}) {
    const deserializer = new HtmlDeserializer(options)
    return deserializer.deserialize(html)
  },

  /**
   * Convert Slate JSON (previously called Raw) to blocks
   *
   * @param {Object} An object representing the structure of the Slate JSON.
   * @param {Object} blockContentType
   * @returns {Array} Blocks
   */
  slateStateToBlocks(slateJson, blockContentType) {
    return slateStateToBlocks(slateJson, blockContentType)
  },

  /**
   * Convert blocks to Slate JSON (previously called Raw)
   *
   * @param {Array} blocks
   * @param {Object} blockContentType
   * @returns {Object} An object representing the structure of the Slate JSON.
   */

  blocksToSlateState(blocks, blockContentType) {
    return blocksToSlateState(blocks, blockContentType)
  },

  /**
   * Convert blocks to Slate JSON (previously called Raw)
   *
   */
  blockTypeFeatures(blockType) {
    return blockContentTypeToOptions(blockType)
  }

}
