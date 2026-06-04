import { createContext, createEffect, createMemo, createSignal, useContext } from 'solid-js'
import { ConfigProvider } from '@ant-design-solid/core'
import type { Accessor, JSX } from 'solid-js'
import { darkAlgorithm, type ThemeConfig } from '@ant-design-solid/theme'

export type DocsThemeMode = 'light' | 'dark'

type DocsThemeContextValue = {
  mode: Accessor<DocsThemeMode>
  toggleTheme: () => void
}

const storageKey = 'ant-design-solid-docs-theme'
const DocsThemeContext = createContext<DocsThemeContextValue>()

function isDocsThemeMode(value: string | null): value is DocsThemeMode {
  return value === 'light' || value === 'dark'
}

function getInitialMode(): DocsThemeMode {
  if (typeof localStorage === 'undefined') return 'light'

  const persistedMode = localStorage.getItem(storageKey)

  return isDocsThemeMode(persistedMode) ? persistedMode : 'light'
}

function themeConfigForMode(mode: DocsThemeMode): ThemeConfig {
  if (mode === 'light') return {}

  return {
    algorithm: darkAlgorithm,
  }
}

export function useDocsTheme() {
  const context = useContext(DocsThemeContext)

  if (!context) {
    throw new Error('useDocsTheme must be used within DocsThemeProvider')
  }

  return context
}

export function DocsThemeProvider(props: { children?: JSX.Element }) {
  const [mode, setMode] = createSignal<DocsThemeMode>(getInitialMode())
  const theme = createMemo(() => themeConfigForMode(mode()))
  const value: DocsThemeContextValue = {
    mode,
    toggleTheme: () => setMode((current) => (current === 'light' ? 'dark' : 'light')),
  }

  createEffect(() => {
    const currentMode = mode()

    document.documentElement.dataset.theme = currentMode
    localStorage.setItem(storageKey, currentMode)
  })

  return (
    <DocsThemeContext.Provider value={value}>
      <ConfigProvider theme={theme()}>{props.children}</ConfigProvider>
    </DocsThemeContext.Provider>
  )
}
