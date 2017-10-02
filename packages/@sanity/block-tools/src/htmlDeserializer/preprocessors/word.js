import {XPathResult} from './index'

function isWordHtml(html) {
  return /(class="?Mso|style=(?:"|')[^"]*?\bmso-|w:WordDocument|<o:\w+>|<\/font>)/.test(html)
}

export default (html, doc) => {
  if (!isWordHtml(html)) {
    return doc
  }

  // These xPaths are removed from the document
  const unwantedPaths = ["//*[name()='o:p']"]

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
  const unwantedNodes = doc.evaluate(
    unwantedPaths.join('|'),
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
  const mappedElements = doc.evaluate(
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
