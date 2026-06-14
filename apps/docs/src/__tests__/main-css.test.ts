import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const mainCss = readFileSync(join(process.cwd(), 'src/main.css'), 'utf8')
const entryClient = readFileSync(join(process.cwd(), 'src/entry-client.tsx'), 'utf8')

describe('docs global content styles', () => {
  it('loads Tailwind and global docs styles in the browser entry', () => {
    expect(entryClient).toContain("import './main.css'")
  })

  it('uses client rendering for the Vite docs shell', () => {
    expect(entryClient).toContain('root.replaceChildren()')
    expect(entryClient).toContain('render(() => <StartClient />, root)')
    expect(entryClient).not.toContain('hydrate')
  })

  it('defines a visible heading hierarchy for MDX content', () => {
    expect(mainCss).toContain('main h1')
    expect(mainCss).toContain('main h2')
    expect(mainCss).toContain('font-size: 2.5rem')
    expect(mainCss).toContain('border-bottom: 1px solid var(--docs-border)')
  })

  it('keeps markdown tables aligned with native table layout', () => {
    expect(mainCss).toContain('table-layout: fixed')
    expect(mainCss).toContain('vertical-align: top')
    expect(mainCss).toContain('text-align: left')
    expect(mainCss).not.toContain('min-width: max-content')
    expect(mainCss).not.toMatch(/main table (thead|tbody|tr)[\s\S]*display: table/)
  })

  it('allows long API signatures to wrap instead of forcing horizontal scroll', () => {
    expect(mainCss).toContain('overflow-wrap: anywhere')
    expect(mainCss).toContain('white-space: normal')
    expect(mainCss).not.toMatch(/main table code[\s\S]*white-space: nowrap/)
  })
})
