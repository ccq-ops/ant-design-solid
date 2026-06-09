import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const mainCss = readFileSync(join(process.cwd(), 'src/main.css'), 'utf8')

describe('docs global content styles', () => {
  it('defines a visible heading hierarchy for MDX content', () => {
    expect(mainCss).toContain('main h1')
    expect(mainCss).toContain('main h2')
    expect(mainCss).toContain('font-size: 2.5rem')
    expect(mainCss).toContain('border-bottom: 1px solid var(--docs-border)')
  })

  it('keeps markdown table columns aligned with native table layout', () => {
    expect(mainCss).toContain('.docs-table-scroll')
    expect(mainCss).toContain('.docs-markdown-table')
    expect(mainCss).toContain('table-layout: fixed')
    expect(mainCss).toContain('vertical-align: top')
    expect(mainCss).toContain('text-align: left')
    expect(mainCss).not.toMatch(/\.docs-markdown-table[\s\S]*display: block/)
    expect(mainCss).not.toContain('min-width: max-content')
    expect(mainCss).not.toMatch(/main table (thead|tbody|tr)[\s\S]*display: table/)
  })

  it('allows long API signatures to wrap instead of forcing horizontal scroll', () => {
    expect(mainCss).toContain('overflow-wrap: anywhere')
    expect(mainCss).toContain('white-space: normal')
    expect(mainCss).not.toMatch(/\.docs-markdown-table code[\s\S]*white-space: nowrap/)
  })
})
