import { render } from '@solidjs/testing-library'
import { beforeEach, describe, expect, it } from 'vitest'
import { useToken } from '@ant-design-solid/core'
import { DocsThemeProvider, useDocsTheme } from './theme-context'

function ThemeProbe() {
  const docsTheme = useDocsTheme()
  const token = useToken()

  return (
    <button
      type="button"
      data-mode={docsTheme.mode()}
      data-background={token().colorBgBase}
      data-text={token().colorTextBase}
      onClick={docsTheme.toggleTheme}
    >
      Toggle
    </button>
  )
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

describe('DocsThemeProvider', () => {
  it('starts in light mode and exposes light tokens', () => {
    const result = render(() => (
      <DocsThemeProvider>
        <ThemeProbe />
      </DocsThemeProvider>
    ))
    const toggle = result.getByRole('button', { name: 'Toggle' })

    expect(toggle).toHaveAttribute('data-mode', 'light')
    expect(toggle).toHaveAttribute('data-background', '#ffffff')
    expect(toggle).toHaveAttribute('data-text', '#000000')
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
  })

  it('toggles to dark mode, persists preference, and exposes dark tokens', async () => {
    const result = render(() => (
      <DocsThemeProvider>
        <ThemeProbe />
      </DocsThemeProvider>
    ))
    const toggle = result.getByRole('button', { name: 'Toggle' })

    toggle.click()
    await Promise.resolve()

    expect(toggle).toHaveAttribute('data-mode', 'dark')
    expect(toggle).toHaveAttribute('data-background', '#141414')
    expect(toggle).toHaveAttribute('data-text', '#ffffff')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(localStorage.getItem('ant-design-solid-docs-theme')).toBe('dark')
  })

  it('uses a persisted dark preference as the initial mode', () => {
    localStorage.setItem('ant-design-solid-docs-theme', 'dark')

    const result = render(() => (
      <DocsThemeProvider>
        <ThemeProbe />
      </DocsThemeProvider>
    ))
    const toggle = result.getByRole('button', { name: 'Toggle' })

    expect(toggle).toHaveAttribute('data-mode', 'dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })
})
