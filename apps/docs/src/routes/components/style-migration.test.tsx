import { describe, expect, it } from 'vitest'
import autoCompleteSource from './auto-complete.tsx?raw'
import cardSource from './card.tsx?raw'
import gridSource from './grid.tsx?raw'
import menuSource from './menu.tsx?raw'

function expectSourceWithoutInlineStyle(source: string, label: string) {
  expect(source, `${label} should not use inline style attributes`).not.toMatch(/style=\{\{/)
}

describe('component docs Tailwind migration', () => {
  it('keeps docs pages from using the removed doc-page wrapper class', () => {
    expect(autoCompleteSource).not.toContain('class="doc-page"')
  })

  it('uses Tailwind classes for static grid demo cells', () => {
    expectSourceWithoutInlineStyle(gridSource, 'grid docs')
    expect(gridSource).toContain('class="bg-blue-50 p-4"')
    expect(gridSource).toContain('class="bg-blue-200 p-4"')
  })

  it('uses Tailwind classes for static card and menu demo widths', () => {
    expectSourceWithoutInlineStyle(cardSource, 'card docs')
    expectSourceWithoutInlineStyle(menuSource, 'menu docs')
    expect(cardSource).toContain('class="w-80"')
    expect(menuSource).toContain('class="w-60"')
  })
})
