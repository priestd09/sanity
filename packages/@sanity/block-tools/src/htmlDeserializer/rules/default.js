import {uniq} from 'lodash'

import randomKey from '../../util/randomKey'
import {DEFAULT_BLOCK} from '../../constants'
import {tagName} from '../helpers'

export const HTML_BLOCK_TAGS = {
  p: DEFAULT_BLOCK,
  blockquote: {...DEFAULT_BLOCK, style: 'blockquote'}
}

export const HTML_SPAN_TAGS = {
  span: {kind: 'text'}
}

export const HTML_LIST_CONTAINER_TAGS = {
  ol: {kind: null},
  ul: {kind: null}
}

export const HTML_HEADER_TAGS = {
  h1: {...DEFAULT_BLOCK, style: 'h1'},
  h2: {...DEFAULT_BLOCK, style: 'h2'},
  h3: {...DEFAULT_BLOCK, style: 'h3'},
  h4: {...DEFAULT_BLOCK, style: 'h4'},
  h5: {...DEFAULT_BLOCK, style: 'h5'},
  h6: {...DEFAULT_BLOCK, style: 'h6'}
}

export const HTML_MISC_TAGS = {
  br: {...DEFAULT_BLOCK, style: 'normal'},
}
export const HTML_DECORATOR_TAGS = {

  b: 'strong',
  strong: 'strong',

  i: 'em',
  em: 'em',

  u: 'underline',
  s: 'strike-through',
  strike: 'strike-through',
  del: 'strike-through',

  code: 'code'
}

export const HTML_LIST_ITEM_TAGS = {
  li: {
    ...DEFAULT_BLOCK,
    style: 'normal',
    level: 1,
    listItem: 'bullet'
  }
}

export function resolveListItem(listNodeTagName) {
  let listStyle
  switch (listNodeTagName) {
    case 'ul':
      listStyle = 'bullet'
      break
    case 'ol':
      listStyle = 'number'
      break
    default:
      listStyle = 'bullet'
  }
  return listStyle
}

export const elementMap = {
  ...HTML_BLOCK_TAGS,
  ...HTML_SPAN_TAGS,
  ...HTML_LIST_CONTAINER_TAGS,
  ...HTML_LIST_ITEM_TAGS,
  ...HTML_HEADER_TAGS,
  ...HTML_MISC_TAGS,
}

export const defaultSupportedStyles = uniq(
  Object.keys(elementMap)
    .filter(tag => elementMap[tag].data && elementMap[tag].data.style)
    .map(tag => elementMap[tag].data.style)
)

export const defaultSupportedDecorators = uniq(
  Object.keys(HTML_DECORATOR_TAGS)
    .map(tag => HTML_DECORATOR_TAGS[tag])
)

export const defaultSupportedAnnotations = ['link']

export default function createDefaultRules(blockContentType, options = {}) {
  return [

    // Text nodes
    {
      deserialize(el) {
        const isValidText = (el.textContent !== ' ' && tagName(el.parentNode) !== 'body')
        if (el.nodeName === '#text' && isValidText) {
          return {
            _type: 'span',
            marks: [],
            text: el.value || el.nodeValue
          }
        }
        return undefined
      }
    },

    // Block elements
    {
      deserialize(el, next) {
        const blocks = {...HTML_BLOCK_TAGS, ...HTML_HEADER_TAGS}
        let block = blocks[tagName(el)]
        if (!block) {
          return undefined
        }
        // Don't add blocks into list items
        if (el.parentNode && tagName(el) === 'li') {
          return next(el.childNodes)
        }
        // If style is not supported, return a defaultBlockType
        if (!options.enabledBlockStyles.includes(block.style)) {
          block = DEFAULT_BLOCK
        }
        return {
          ...block,
          children: next(el.childNodes)
        }
      }
    },

    // Ignore span tags
    {
      deserialize(el, next) {
        const span = HTML_SPAN_TAGS[tagName(el)]
        if (!span) {
          return undefined
        }
        return next(el.childNodes)
      }
    },

    // Ignore list containers
    {
      deserialize(el, next) {
        const listContainer = HTML_LIST_CONTAINER_TAGS[tagName(el)]
        if (!listContainer) {
          return undefined
        }
        return next(el.childNodes)
      }
    },

    // Deal with br's
    {
      deserialize(el, next) {
        if (tagName(el) === 'br') {
          return {
            kind: 'text',
            text: '\n'
          }
        }
        return undefined
      }
    },

    // Deal with list items
    {
      deserialize(el, next) {
        const listItem = HTML_LIST_ITEM_TAGS[tagName(el)]
        if (!listItem
            || !el.parentNode
            || !HTML_LIST_CONTAINER_TAGS[tagName(el.parentNode)]) {
          return undefined
        }
        listItem.data.listItem = resolveListItem(tagName(el.parentNode))
        return {
          ...listItem,
          nodes: next(el.childNodes)
        }
      }
    },

    // Deal with decorators
    {
      deserialize(el, next) {
        const decorator = HTML_DECORATOR_TAGS[tagName(el)]
        if (!decorator || !options.enabledBlockDecorators.includes(decorator)) {
          return undefined
        }
        return {
          kind: 'mark',
          type: decorator,
          nodes: next(el.childNodes)
        }
      }
    },

    // Special case for hyperlinks, add annotation (if allowed by schema),
    // If not supported just write out the link text and href in plain text.
    {
      deserialize(el, next) {
        if (tagName(el) != 'a') {
          return undefined
        }
        const linkEnabled = options.enabledBlockAnnotations.includes('link')
        const href = el.getAttribute('href')
        if (!href) {
          return next(el.childNodes)
        }
        let data
        if (linkEnabled) {
          data = {
            annotations: {
              link: {
                _key: randomKey(12),
                _type: 'link',
                href: href
              }
            }
          }
        }
        return {
          kind: 'inline',
          type: 'span',
          nodes: linkEnabled
            ? next(el.childNodes)
            : (
              el.appendChild(
                new Text(` (${href})`)
              ) && next(el.childNodes)
            ),
          data: data
        }
      }
    }
  ]
}

