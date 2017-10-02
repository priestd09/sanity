import {SLATE_DEFAULT_BLOCK} from '../constants'
import {tagName} from './html'

function getListItemStyle(el) {
  let style
  if ((style = el.getAttribute('style'))) {
    if (!style.match(/lfo\d+/)) {
      return undefined
    }
    return style.match('lfo1') ? 'bullet' : 'number'
  }
  return undefined
}

function getListItemLevel(el) {
  let style
  if ((style = el.getAttribute('style'))) {
    const levelMatch = style.match(/level\d+/)
    if (!levelMatch) {
      return undefined
    }
    const level = levelMatch[0].match(/\d/)[0]
    return parseInt(level, 10) || 1
  }
  return undefined
}

function isWordListElement(el) {
  if (el.className) {
    return el.className === 'MsoListParagraphCxSpFirst'
      || el.className === 'MsoListParagraphCxSpMiddle'
      || el.className === 'MsoListParagraphCxSpLast'
  }
  return undefined
}

export function isWordHtml(html) {
  return /(class="?Mso|style=(?:"|')[^"]*?\bmso-|w:WordDocument|<o:\w+>|<\/font>)/.test(html)
}

export function cleanWordDocument(doc) {

  // These xPaths are removed from the document
  const unwantedWordDocumentPaths = [
    '/html/text()',
    '/html/head/text()',
    '/html/body/text()',
    '//p[not(.//text())]',
    '//span[not(.//text())]',
    '//comment()',
    "//*[name()='o:p']",
    '//style',
    '//xml',
    '//script',
    '//meta',
    '//link'
  ]

  // xPaths for elements that needs to be remapped into other tags
  const mappedPaths = [
    "//p[@class='MsoTitle']",
    "//p[@class='MsoToaHeading']",
    "//p[@class='MsoSubtitle']",
    "//span[@class='MsoSubtleEmphasis']",
    "//span[@class='MsoIntenseEmphasis']",
  ]

  // Which HTML element(s) to map the elements matching mappedPaths into
  const elementMap = {
    MsoTitle: ['h1'],
    MsoToaHeading: ['h2'],
    MsoSubtitle: ['h5'],
    MsoSubtleEmphasis: ['span', 'em'],
    MsoIntenseEmphasis: ['span', 'em', 'strong']
  }

  // Remove cruft
  const unwantedNodes = document.evaluate(
    unwantedWordDocumentPaths.join('|'),
    doc,
    null,
    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    null
  )
  for (let i = unwantedNodes.snapshotLength - 1; i >= 0; i--) {
    const unwanted = unwantedNodes.snapshotItem(i)
    unwanted.parentNode.removeChild(unwanted)
  }

  // Transform mapped elements into what they should be mapped to
  const mappedElements = document.evaluate(
    mappedPaths.join('|'),
    doc,
    null,
    XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
    null
  )
  for (let i = mappedElements.snapshotLength - 1; i >= 0; i--) {
    const mappedElm = mappedElements.snapshotItem(i)
    const tags = elementMap[mappedElm.className]
    const text = new Text(mappedElm.textContent)
    const parentElement = document.createElement(tags[0])
    let parent = parentElement
    let child = parentElement
    tags.slice(1).forEach(tag => {
      child = document.createElement(tag)
      parent.appendChild(child)
      parent = child
    })
    child.appendChild(text)
    mappedElm.parentNode.replaceChild(parentElement, mappedElm)
  }

  return doc
}

export function createWordRules(options) {
  return [
    {
      deserialize(el, next) {
        if (tagName(el) === 'p' && isWordListElement(el)) {
          return {
            ...SLATE_DEFAULT_BLOCK,
            data: {
              listItem: getListItemStyle(el),
              level: getListItemLevel(el),
              style: 'normal'
            },
            nodes: next(el.childNodes)
          }
        }
        return undefined
      }
    }
  ]
}

export default {
  createWordRules: createWordRules,
  cleanWordDocument: cleanWordDocument,
  isWordHtml: isWordHtml
}
