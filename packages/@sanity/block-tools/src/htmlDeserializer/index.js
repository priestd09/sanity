import resolveJsType from '../util/resolveJsType'
import {DEFAULT_BLOCK} from '../constants'
import createRules from './rules'
import {createRuleOptions, preprocess, defaultParseHtml, tagName} from './helpers'

/**
 * HTML Deserializer
 *
 */

export default class HtmlDeserializer {

  /**
   * Create a new serializer respecting a Sanity block content type's schema
   *
   * @param {Object} options
   *   @property {Object} blockContentType
   *      A compiled version of the block content schema type
   *   @property {Array} rules
   *      Optional rules working on the HTML (will be ruled first)
   *   @property {Function} parseHtml
   *      API compatible model as returned from DOMParser for using server side.
   */

  constructor(options = {}) {
    const {rules = []} = options
    const blockContentType = options.blockContentType
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
    this.activeMarkDefs = []
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

    // Ensure that all top-level inline nodes are wrapped into a block,
    // and that there are no blocks as children of a block
    nodes = nodes.reduce((memo, node, i, original) => {

      // Move any blocks as children of a block to the root level
      if (i > 0 && node._type === 'block' && original[i - 1]._type === 'block') {
        const block = memo[memo.length - 1]
        const childBlocks = block.children.filter(child => child._type === 'block')
        block.children = block.children.filter(child => !childBlocks.includes(child))
        childBlocks.forEach(cBlock => {
          memo.push(cBlock)
        })
      }

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
        children: [node]
      }

      memo.push(block)
      return memo
    }, [])

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
    elements.forEach((element, index) => {
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

  deserializeElement = element => { // eslint-disable-line complexity

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
      } else if (ret && ret._type === 'block' && ret.listItem) {
        let parent = element.parentNode.parentNode
        while (tagName(parent) === 'li') { // eslint-disable-line max-depth
          parent = parent.parentNode
          ret.level++
        }
        node = ret
      } else if (ret._type === '__decorator') {
        node = this.deserializeDecorator(ret)
      } else if (ret._type === '__annotation') {
        node = this.deserializeAnnotation(ret)
      } else if (ret._type === 'block' && this.activeMarkDefs.length) {
        ret.markDefs = this.activeMarkDefs
        this.activeMarkDefs = []
        node = ret
      } else {
        node = ret
      }

      break
    }
    return node || next(element.childNodes)
  }

  /**
   * Deserialize a `__decorator` object.
   *
   * @param {Object} decorator
   * @return {Array}
   */

  deserializeDecorator = decorator => {
    const {name} = decorator
    const applyDecorator = node => {
      if (node._type === '__decorator') {
        return this.deserializeDecorator(node)
      } else if (node._type === 'span') {
        node.marks = node.marks || []
        node.marks.unshift(name)
      } else {
        node.children = node.children.map(applyDecorator)
      }
      return node
    }
    return decorator.children.reduce((children, node) => {
      const ret = applyDecorator(node)
      if (Array.isArray(ret)) {
        return children.concat(ret)
      }
      children.push(ret)
      return children
    }, [])
  }

  /**
   * Deserialize a `__annotation` object.
   *
   * @param {Object} annotation
   * @return {Array}
   */

  deserializeAnnotation = annotation => {
    const {markDef} = annotation
    this.activeMarkDefs.push(markDef)
    const applyAnnotation = node => {
      if (node._type === '__annotation') {
        return this.deserializeAnnotation(node)
      } else if (node._type === 'span') {
        node.marks = node.marks || []
        node.marks.unshift(markDef._key)
      } else {
        node.children = node.children.map(applyAnnotation)
      }
      return node
    }
    return annotation.children.reduce((children, node) => {
      const ret = applyAnnotation(node)
      if (Array.isArray(ret)) {
        return children.concat(ret)
      }
      children.push(ret)
      return children
    }, [])
  }

}
