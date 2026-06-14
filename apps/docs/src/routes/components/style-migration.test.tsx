import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

function readPageSource(fileName: string) {
  return readFileSync(fileURLToPath(new URL(fileName, import.meta.url)), 'utf8')
}

const autoCompleteSource = readPageSource('./auto-complete.mdx')
const anchorSource = readPageSource('./anchor.mdx')
const badgeSource = readPageSource('./badge.mdx')
const buttonSource = readPageSource('./button.mdx')
const cardSource = readPageSource('./card.mdx')
const flexSource = readPageSource('./flex.mdx')
const floatButtonSource = readPageSource('./float-button.mdx')
const gridSource = readPageSource('./grid.mdx')
const layoutSource = readPageSource('./layout.mdx')
const menuSource = readPageSource('./menu.mdx')
const selectSource = readPageSource('./select.mdx')
const spinSource = readPageSource('./spin.mdx')
const tabsSource = readPageSource('./tabs.mdx')
const watermarkSource = readPageSource('./watermark.mdx')
const slate950TextClass = `text-slate-${950}`

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
    expect(gridSource).toContain(
      `'bg-blue-50 ${slate950TextClass} dark:bg-blue-950/40 dark:text-slate-50 p-4'`,
    )
    expect(gridSource).toContain(
      "'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 p-4'",
    )
    expect(gridSource).not.toContain('docs-primary-soft')
    expect(gridSource).not.toContain('docs-surface-subtle')
  })

  it('uses Tailwind classes for static card and menu demo widths', () => {
    expectSourceWithoutInlineStyle(cardSource, 'card docs')
    expectSourceWithoutInlineStyle(menuSource, 'menu docs')
    expect(cardSource).toContain('class="w-80"')
    expect(menuSource).toContain('class="w-60"')
  })

  it('uses Tailwind for static layout demo wrappers', () => {
    expect(layoutSource).toContain('class="flex flex-wrap gap-4"')
    expect(layoutSource).toContain('class={layoutDemoClass}')
    expect(layoutSource).toContain('class={layoutHeaderClass}')
    expect(layoutSource).not.toContain(
      "style={{ display: 'flex', gap: '16px', 'flex-wrap': 'wrap' }}",
    )
    expect(layoutSource).not.toContain("background: 'var(--docs-surface-solid)'")
  })

  it('uses Tailwind for float button demo boxes and static positioning', () => {
    expect(floatButtonSource).toContain('const floatButtonBoxClass')
    expect(floatButtonSource).toContain('absolute right-6 bottom-6')
    expect(floatButtonSource).toContain('h-[220px] overflow-auto p-4')
    expect(floatButtonSource).not.toContain('floatButtonBoxStyle')
    expect(floatButtonSource).not.toContain(
      "style={{ position: 'absolute', right: '24px', bottom: '24px' }}",
    )
  })

  it('uses Tailwind for static flex demo presentation', () => {
    expect(flexSource).toContain(
      "class={index % 2 ? 'h-[54px] w-1/4 bg-blue-600' : 'h-[54px] w-1/4 bg-blue-500/75'}",
    )
    expect(flexSource).toContain('class="h-[120px] w-full rounded-md border border-blue-400"')
    expect(flexSource).toContain('class="block w-[273px]"')
    expect(flexSource).not.toContain("border: '1px solid #40a9ff'")
  })

  it('uses Tailwind for static docs helper surfaces', () => {
    expect(watermarkSource).not.toContain('class="h-[180px] docs-surface-solid p-6"')
    expect(watermarkSource).toContain(
      'class="h-[180px] bg-[var(--docs-surface-solid)] p-6 text-[var(--docs-text)]"',
    )
    expect(buttonSource).toContain('class="bg-[var(--docs-surface-subtle)] p-4"')
    expect(spinSource).toContain(
      'class="rounded-lg border border-[var(--docs-border)] bg-[var(--docs-surface-solid)] p-6"',
    )
  })

  it('uses Tailwind for simple static example wrappers', () => {
    expect(autoCompleteSource).toContain('class="flex flex-wrap gap-2"')
    expect(autoCompleteSource).toContain('class="px-2 py-2 text-[var(--docs-text-secondary)]"')
    expect(anchorSource).toContain('class="flex-1"')
    expect(anchorSource).toContain('class="h-6"')
    expect(anchorSource).toContain('class="flex h-60 gap-6 overflow-auto"')
    expect(badgeSource).toContain('class="grid w-full max-w-[520px] gap-4"')
  })

  it('keeps select custom tags readable in dark mode', () => {
    const customTagsSource = getSectionSource(selectSource, 'Custom tags')

    expect(customTagsSource).toContain(
      'class="rounded bg-blue-50 px-2 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200"',
    )
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
