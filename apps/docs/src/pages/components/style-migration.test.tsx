import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

function readPageSource(fileName: string) {
  return readFileSync(fileURLToPath(new URL(fileName, import.meta.url)), 'utf8')
}

const autoCompleteSource = readPageSource('./auto-complete.mdx')
const cardSource = readPageSource('./card.mdx')
const gridSource = readPageSource('./grid.mdx')
const menuSource = readPageSource('./menu.mdx')
const tabsSource = readPageSource('./tabs.mdx')

function expectSourceWithoutInlineStyle(source: string, label: string) {
  expect(source, `${label} should not use inline style attributes`).not.toMatch(/style=\{\{/)
}

function getSectionSource(source: string, heading: string) {
  const start = source.indexOf(`### ${heading}`)
  expect(start).toBeGreaterThanOrEqual(0)
  const next = source.indexOf('\n### ', start + 1)
  return source.slice(start, next === -1 ? undefined : next)
}

describe('component docs Tailwind migration', () => {
  it('keeps docs pages from using the removed doc-page wrapper class', () => {
    expect(autoCompleteSource).not.toContain('class="doc-page"')
  })

  it('uses Tailwind classes for static grid demo cells', () => {
    expectSourceWithoutInlineStyle(gridSource, 'grid docs')
    expect(gridSource).toContain("'docs-primary-soft docs-text-strong p-4'")
    expect(gridSource).toContain("'docs-surface-subtle docs-text-secondary p-4'")
  })

  it('uses Tailwind classes for static card and menu demo widths', () => {
    expectSourceWithoutInlineStyle(cardSource, 'card docs')
    expectSourceWithoutInlineStyle(menuSource, 'menu docs')
    expect(cardSource).toContain('class="w-80"')
    expect(menuSource).toContain('class="w-60"')
  })

  it('keeps the editable tabs demo stateful and uses the default add icon', () => {
    const editableCardSource = getSectionSource(tabsSource, 'Editable Card')

    expect(editableCardSource).not.toContain('addIcon=')
    expect(editableCardSource).not.toContain('PlusOutlined')
    expect(editableCardSource).not.toContain('console.log(targetKey, action)')
    expect(editableCardSource).toContain('const [editableItems, setEditableItems] = createSignal')
    expect(editableCardSource).toContain("if (action === 'add')")
    expect(editableCardSource).toContain(
      "if (action === 'remove' && typeof targetKey === 'string')",
    )
  })

  it('keeps the overflow tabs demo large enough to show the more trigger', () => {
    const overflowSource = getSectionSource(tabsSource, 'Overflow')

    expect(overflowSource).toContain('Array.from({ length: 24 }')
    expect(overflowSource).toContain("more={{ icon: <span>More</span>, trigger: 'click' }}")
  })
})
