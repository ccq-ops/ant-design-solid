import { render } from '@solidjs/testing-library'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ConfigProvider, message, useConfig, useToken } from '@solid-ant-design/core'
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
      data-container={token().colorBgContainer}
      data-elevated={token().colorBgElevated}
      onClick={docsTheme.toggleTheme}
    >
      Toggle
    </button>
  )
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
  document.cookie = 'theme=; max-age=0; path=/'
  message.destroy()
  ConfigProvider.config({ theme: undefined })
})

afterEach(() => {
  message.destroy()
  ConfigProvider.config({ theme: undefined })
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
    expect(toggle).toHaveAttribute('data-background', '#fff')
    expect(toggle).toHaveAttribute('data-text', '#000')
    expect(document.documentElement).not.toHaveAttribute('data-theme')
  })

  it('toggles to dark mode and exposes dark tokens', async () => {
    const result = render(() => (
      <DocsThemeProvider>
        <ThemeProbe />
      </DocsThemeProvider>
    ))
    const toggle = result.getByRole('button', { name: 'Toggle' })

    toggle.click()
    await Promise.resolve()

    expect(toggle).toHaveAttribute('data-mode', 'dark')
    expect(toggle).toHaveAttribute('data-background', '#000')
    expect(toggle).toHaveAttribute('data-text', '#fff')
    expect(toggle).toHaveAttribute('data-container', '#141414')
    expect(toggle).toHaveAttribute('data-elevated', '#1f1f1f')
  })

  it('toggles back to light mode without inheriting the previous dark algorithm', async () => {
    const result = render(() => (
      <DocsThemeProvider>
        <ThemeProbe />
      </DocsThemeProvider>
    ))
    const toggle = result.getByRole('button', { name: 'Toggle' })

    toggle.click()
    await Promise.resolve()
    toggle.click()
    await Promise.resolve()

    expect(toggle).toHaveAttribute('data-mode', 'light')
    expect(toggle).toHaveAttribute('data-background', '#fff')
    expect(toggle).toHaveAttribute('data-text', '#000')
    expect(toggle).toHaveAttribute('data-container', '#ffffff')
  })

  it('syncs external SolidBase light theme changes back to light tokens', async () => {
    document.documentElement.dataset.theme = 'dark'

    const result = render(() => (
      <DocsThemeProvider>
        <ThemeProbe />
      </DocsThemeProvider>
    ))
    const toggle = result.getByRole('button', { name: 'Toggle' })

    expect(toggle).toHaveAttribute('data-mode', 'dark')

    document.documentElement.dataset.theme = 'slight'
    await Promise.resolve()

    expect(toggle).toHaveAttribute('data-mode', 'light')
    expect(toggle).toHaveAttribute('data-background', '#fff')
    expect(toggle).toHaveAttribute('data-text', '#000')
    expect(toggle).toHaveAttribute('data-container', '#ffffff')
  })

  it('uses the SolidBase dark theme as the initial mode', () => {
    document.documentElement.dataset.theme = 'dark'

    const result = render(() => (
      <DocsThemeProvider>
        <ThemeProbe />
      </DocsThemeProvider>
    ))
    const toggle = result.getByRole('button', { name: 'Toggle' })

    expect(toggle).toHaveAttribute('data-mode', 'dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('uses the SolidBase system dark theme as dark mode', () => {
    document.documentElement.dataset.theme = 'sdark'

    const result = render(() => (
      <DocsThemeProvider>
        <ThemeProbe />
      </DocsThemeProvider>
    ))
    const toggle = result.getByRole('button', { name: 'Toggle' })

    expect(toggle).toHaveAttribute('data-mode', 'dark')
  })

  it('uses the dark theme algorithm in dark mode', () => {
    document.documentElement.dataset.theme = 'dark'
    let bg = ''
    let elevated = ''

    function Probe() {
      const { token } = useConfig()
      bg = token().colorBgContainer
      elevated = token().colorBgElevated
      return <div />
    }

    render(() => (
      <DocsThemeProvider>
        <Probe />
      </DocsThemeProvider>
    ))

    expect(bg).toBe('#141414')
    expect(elevated).toBe('#1f1f1f')
  })

  it('syncs static message theme with dark docs mode', async () => {
    document.documentElement.dataset.theme = 'dark'

    render(() => (
      <DocsThemeProvider>
        <ThemeProbe />
      </DocsThemeProvider>
    ))

    message.info('Dark docs message', 0)
    await Promise.resolve()

    const css = Array.from(document.head.querySelectorAll('style[data-ant-design-solid]'))
      .map((style) => style.textContent ?? '')
      .join('\n')

    expect(document.body).toHaveTextContent('Dark docs message')
    expect(css).toContain('background:#1f1f1f')
  })
})
