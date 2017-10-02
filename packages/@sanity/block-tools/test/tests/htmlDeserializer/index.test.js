/* global describe, it */

import assert from 'assert'
import fs from 'fs'
import path from 'path'
import HtmlDeserializer from '../../../src/htmlDeserializer'
import {DEFAULT_BLOCK} from '../../../src/constants'
import {JSDOM} from 'jsdom'
import xpath from 'xpath'

describe('htmlDeserializer', () => {
  const tests = fs.readdirSync(__dirname)

  tests.forEach(test => {
    if (test[0] === '.' || path.extname(test).length > 0) {
      return
    }

    it(test, () => {
      const dir = path.resolve(__dirname, test)
      const input = fs.readFileSync(path.resolve(dir, 'input.html')).toString()
      const expected = JSON.parse(fs.readFileSync(path.resolve(dir, 'output.json')))
      const fn = require(path.resolve(dir)).default // eslint-disable-line import/no-dynamic-require
      const commonOptions = {
        defaultBlock: DEFAULT_BLOCK,
        parseHtml: html => new JSDOM(html).window.document,
        evaluate: xpath.evaluate
      }
      const output = fn(input, HtmlDeserializer, commonOptions)
      assert.deepEqual(output, expected)
    })
  })
})
