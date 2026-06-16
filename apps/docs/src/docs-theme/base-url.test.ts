import { describe, expect, it } from 'vitest'
import { normalizeAnchorElement, withBaseUrl, withDocsBase } from './base-url'

describe('docs base URL helpers', () => {
  it('keeps local root-relative links unchanged by default', () => {
    expect(withDocsBase('/components')).toBe('/components')
    expect(withDocsBase('/')).toBe('/')
  })

  it('prefixes root-relative links when deployed under GitHub Pages', () => {
    expect(withBaseUrl('/components', '/ant-design-solid/')).toBe('/ant-design-solid/components')
    expect(withBaseUrl('/', '/ant-design-solid/')).toBe('/ant-design-solid/')
    expect(withBaseUrl('/ant-design-solid/components', '/ant-design-solid/')).toBe(
      '/ant-design-solid/components',
    )
    expect(withBaseUrl('/ant-design-solid/ant-design-solid/components', '/ant-design-solid/')).toBe(
      '/ant-design-solid/components',
    )
  })

  it('leaves hash, external, protocol-relative, and data URLs unchanged', () => {
    expect(withBaseUrl('#main-content', '/ant-design-solid/')).toBe('#main-content')
    expect(withBaseUrl('https://example.com', '/ant-design-solid/')).toBe('https://example.com')
    expect(withBaseUrl('//cdn.example.com/app.js', '/ant-design-solid/')).toBe(
      '//cdn.example.com/app.js',
    )
    expect(withBaseUrl('data:image/svg+xml,abc', '/ant-design-solid/')).toBe(
      'data:image/svg+xml,abc',
    )
  })

  it('marks external anchors to open in a new tab', () => {
    const anchor = document.createElement('a')
    anchor.setAttribute('href', '//github.com/ccq-ops/ant-design-solid')

    normalizeAnchorElement(anchor, '/ant-design-solid/')

    expect(anchor.getAttribute('href')).toBe('//github.com/ccq-ops/ant-design-solid')
    expect(anchor.getAttribute('target')).toBe('_blank')
    expect(anchor.getAttribute('rel')).toBe('noopener noreferrer')
  })

  it('keeps internal anchors in the current tab while prefixing the deployment base', () => {
    const anchor = document.createElement('a')
    anchor.setAttribute('href', '/components')

    normalizeAnchorElement(anchor, '/ant-design-solid/')

    expect(anchor.getAttribute('href')).toBe('/ant-design-solid/components')
    expect(anchor.hasAttribute('target')).toBe(false)
    expect(anchor.hasAttribute('rel')).toBe(false)
  })
})
