import preprocessors from './preprocessors'
import resolveJsType from '../util/resolveJsType'
import blockContentTypeToOptions from '../util/blockContentTypeToOptions'
import {
  defaultSupportedStyles,
  defaultSupportedDecorators,
  defaultSupportedAnnotations,
} from './rules/default'


/**
 * A utility function to create the options needed for the various rule sets,
 * based on the structure of the blockContentType
 *
 * @param {Object} The compiled schema type for the block content
 * @return {Object}
 */

export function createRuleOptions(blockContentType) {
  const options = blockContentTypeToOptions(blockContentType)
  const enabledBlockStyles = options.enabledBlockStyles || defaultSupportedStyles
  const enabledBlockDecorators = options.enabledBlockDecorators || defaultSupportedDecorators
  const enabledBlockAnnotations = options.enabledBlockAnnotations || defaultSupportedAnnotations
  return {
    enabledBlockStyles,
    enabledBlockDecorators,
    enabledBlockAnnotations
  }
}

/**
 * A utility function that always return a lowerCase version of the element.tagName
 *
 * @param {Object} DOMParser element
 * @return {String} Lowercase tagName for that element
 */

export function tagName(el) {
  if (!el || el.nodeType !== 1) {
    return undefined
  }
  return el.tagName.toLowerCase()
}


// TODO: make this plugin-style
export function preprocess(html, parseHtml, evaluate) {
  const compactHtml = html
    .trim() // Trim whitespace
    .replace(/[\r\n]+/g, ' ') // Remove newlines / carriage returns
    .replace(/ {2,}/g, ' ') // Remove trailing spaces
  const doc = parseHtml(compactHtml)
  preprocessors.forEach(processor => {
    processor(html, doc, evaluate)
  })
  return doc
}

/**
 * A default `parseHtml` function that returns the html using `DOMParser`.
 *
 * @param {String} html
 * @return {Object}
 */

export function defaultParseHtml() {
  if (resolveJsType(DOMParser) === 'undefined') {
    throw new Error(
      'The native `DOMParser` global which the `Html` deserializer uses by '
      + 'default is not present in this environment. '
      + 'You must supply the `options.parseHtml` function instead.'
    )
  }
  return html => {
    return new DOMParser().parseFromString(html, 'text/html')
  }
}
