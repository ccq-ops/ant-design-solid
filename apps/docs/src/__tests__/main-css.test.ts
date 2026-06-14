import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const mainCss = readFileSync(join(process.cwd(), 'src/main.css'), 'utf8')
const entryClient = readFileSync(join(process.cwd(), 'src/entry-client.tsx'), 'utf8')

describe('docs global content styles', () => {
  it('loads Tailwind and global docs styles in the browser entry', () => {
    expect(entryClient).toContain("import './main.css'")
    expect(mainCss).toContain("@import 'tailwindcss'")
  })

  it('uses client rendering for the Vite docs shell', () => {
    expect(entryClient).toContain('root.replaceChildren()')
    expect(entryClient).toContain('render(() => <StartClient />, root)')
    expect(entryClient).not.toContain('hydrate')
  })

  it('keeps only root theme variables in global CSS', () => {
    expect(mainCss).toContain(':root {')
    expect(mainCss).toContain(":root[data-theme='dark']")
    expect(mainCss).toContain(":root[data-theme='sdark']")
    expect(mainCss).toContain('--docs-bg: #ffffff')
    expect(mainCss).toContain('--docs-bg: #0f1115')
  })

  it('does not keep stale custom global selectors after switching to the default theme', () => {
    expect(mainCss).not.toContain('body {')
    expect(mainCss).not.toContain('a {')
    expect(mainCss).not.toContain('main h1')
    expect(mainCss).not.toContain('[data-preview-stage]')
    expect(mainCss).not.toContain('docs-table-scroll')
    expect(mainCss).not.toContain('docs-markdown-table')
    expect(mainCss).not.toContain('docs-demo-preview')
    expect(mainCss).not.toContain('.docs-surface')
  })
})
