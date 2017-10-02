import resolveJsType from '../util/resolveJsType'
import {DEFAULT_BLOCK} from '../constants'
import createRules from './rules'
import {createRuleOptions, preprocess, defaultParseHtml} from './helpers'

/**
 * HTML Deserializer
 *
 */

class HtmlDeserializer {

  /**
   * Create a new serializer respecting a Sanity block content type's schema
   *
   * @param {Object} options
   *   @property {Array} rules
   *      Optional rules working on the HTML (will be ruled first)
   *   @property {Function} parseHtml
   *      API compatible model as returned from DOMParser for using server side.
   */

  constructor(blockContentType, options = {}) {
    const {rules = []} = options
    const standardRules = createRules(
      blockContentType,
      createRuleOptions(blockContentType)
    )
    this.rules = [...rules, ...standardRules]
    this.defaultBlock = DEFAULT_BLOCK
    const parseHtml = options.parseHtml || defaultParseHtml()
    this.parseHtml = html => {
      const doc = preprocess(html, parseHtml)
      return doc.body
    }
  }

  /**
   * Deserialize HTML.
   *
   * @param {String} html
   * @return {Array}
   */

  deserialize = html => {

    const {defaultBlock, parseHtml} = this
    const fragment = parseHtml(html)
    const children = Array.from(fragment.childNodes)
    let nodes = this.deserializeElements(children)

    // Ensure that all top-level inline nodes are wrapped into a block.
    nodes = nodes.reduce((memo, node, i, original) => {
      if (node._type === 'block') {
        memo.push(node)
        return memo
      }

      if (i > 0 && original[i - 1]._type !== 'block') {
        const block = memo[memo.length - 1]
        block.children.push(node)
        return memo
      }

      const block = {
        ...defaultBlock,
        children: [node],
      }

      memo.push(block)
      return memo
    }, [])

    // // TODO: pretty sure this is no longer needed.
    // if (nodes.length == 0) {
    //   nodes = [{
    //     kind: 'block',
    //     data: {},
    //     isVoid: false,
    //     ...defaultBlock,
    //     nodes: [
    //       {
    //         kind: 'text',
    //         ranges: [
    //           {
    //             kind: 'range',
    //             text: '',
    //             marks: [],
    //           }
    //         ]
    //       }
    //     ],
    //   }]
    // }
    return nodes
  }

  /**
   * Deserialize an array of DOM elements.
   *
   * @param {Array} elements
   * @return {Array}
   */

  deserializeElements = (elements = []) => {
    let nodes = []
    elements.forEach(element => {
      const node = this.deserializeElement(element)
      switch (resolveJsType(node)) {
        case 'array':
          nodes = nodes.concat(node)
          break
        case 'object':
          nodes.push(node)
          break
        default:
          throw new Error(`Don't know what to do with: ${JSON.stringify(node)}`)
      }
    })
    return nodes
  }

  /**
   * Deserialize a DOM element.
   *
   * @param {Object} element
   * @return {Any}
   */

  deserializeElement = element => {

    let node
    if (!element.tagName) {
      element.tagName = ''
    }

    const next = elements => {
      let _elements = elements
      if (Object.prototype.toString.call(_elements) == '[object NodeList]') {
        _elements = Array.from(_elements)
      }

      switch (resolveJsType(_elements)) {
        case 'array':
          return this.deserializeElements(_elements)
        case 'object':
          return this.deserializeElement(_elements)
        case 'null':
        case 'undefined':
          return undefined
        default:
          throw new Error(`The \`next\` argument was called with invalid children: "${_elements}".`)
      }
    }
    for (let i = 0; i < this.rules.length; i++) {
      const rule = this.rules[i]
      if (!rule.deserialize) {
        continue
      }
      const ret = rule.deserialize(element, next)
      const type = resolveJsType(ret)

      if (type != 'array' && type != 'object' && type != 'null' && type != 'undefined') {
        throw new Error(`A rule returned an invalid deserialized representation: "${node}".`)
      }

      if (ret === undefined) {
        continue
      } else if (ret === null) {
        return null
      } else if (ret.kind === 'mark') {
        node = this.deserializeMark(ret)
      } else {
        node = ret
      }

      break
    }
    return node || next(element.childNodes)
  }

  /**
   * Deserialize a `mark` object.
   *
   * @param {Object} mark
   * @return {Array}
   */

  deserializeMark = mark => {
    const {type, data} = mark
    const applyMark = node => {
      if (node.kind == 'mark') {
        return this.deserializeMark(node)
      } else if (node.kind == 'text') {
        node.ranges = node.ranges.map(range => {
          range.marks = range.marks || []
          range.marks.push({type, data})
          return range
        })
      } else {
        node.nodes = node.nodes.map(applyMark)
      }
      return node
    }

    return mark.nodes.reduce((nodes, node) => {
      const ret = applyMark(node)
      if (Array.isArray(ret)) {
        return nodes.concat(ret)
      }
      nodes.push(ret)
      return nodes
    }, [])
  }

}


/**
 * Export.
 *
 * @type {HtmlDeserializer}
 */

export default HtmlDeserializer
