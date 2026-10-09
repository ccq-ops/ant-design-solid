import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

import { JSDOM } from 'jsdom'

const require = createRequire(import.meta.url)
const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>')

globalThis.window = dom.window
globalThis.document = dom.window.document
globalThis.HTMLElement = dom.window.HTMLElement
globalThis.SVGElement = dom.window.SVGElement

const esmRoot = await import('../packages/components/dist/index.js')
const esmButton = await import('../packages/components/dist/button/index.js')
const esmCssInJs = await import('../packages/cssinjs/dist/index.js')
const esmIcons = await import('../packages/icons/dist/index.js')
const esmSearchIcon = await import('../packages/icons/dist/icons/search-outlined.js')
const esmTheme = await import('../packages/theme/dist/index.js')
const cjsRoot = require('../packages/components/dist/index.cjs')
const cjsButton = require('../packages/components/dist/button/index.cjs')
const cjsCssInJs = require('../packages/cssinjs/dist/index.cjs')
const cjsIcons = require('../packages/icons/dist/index.cjs')
const cjsSearchIcon = require('../packages/icons/dist/icons/search-outlined.cjs')
const cjsTheme = require('../packages/theme/dist/index.cjs')

assert.equal(typeof esmRoot.Button, 'function')
assert.equal(typeof esmButton.Button, 'function')
assert.equal(typeof esmCssInJs.createCache, 'function')
assert.equal(typeof esmIcons.SearchOutlined, 'function')
assert.equal(typeof esmSearchIcon.SearchOutlined, 'function')
assert.equal(typeof esmTheme.mergeTheme, 'function')
assert.equal(typeof cjsRoot.Button, 'function')
assert.equal(typeof cjsButton.Button, 'function')
assert.equal(typeof cjsCssInJs.createCache, 'function')
assert.equal(typeof cjsIcons.SearchOutlined, 'function')
assert.equal(typeof cjsSearchIcon.SearchOutlined, 'function')
assert.equal(typeof cjsTheme.mergeTheme, 'function')

console.log('All package root and public subpath ESM/CJS exports load successfully.')

dom.window.close()
