import { ConfigProvider } from '@solid-ant-design/core'
import { setTheme } from '@kobalte/solidbase/client'
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  useContext,
} from 'solid-js'
import type { Accessor, JSX } from 'solid-js'
import { darkAlgorithm, defaultAlgorithm, type ThemeConfig } from '@solid-ant-design/theme'

export type DocsThemeMode = 'light' | 'dark'

type DocsThemeContextValue = {
  mode: Accessor<DocsThemeMode>
  toggleTheme: () => void
}

const DocsThemeContext = createContext<DocsThemeContextValue>()

function getCurrentMode(): DocsThemeMode {
  if (typeof document === 'undefined') return 'light'

  const theme = document.documentElement.dataset.theme

  return theme === 'dark' || theme === 'sdark' ? 'dark' : 'light'
}

function themeConfigForMode(mode: DocsThemeMode): ThemeConfig {
  if (mode === 'light') return { algorithm: defaultAlgorithm }

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
  const [mode, setMode] = createSignal<DocsThemeMode>(getCurrentMode())
  const theme = createMemo(() => themeConfigForMode(mode()))
  const value: DocsThemeContextValue = {
    mode,
    toggleTheme: () => {
      const nextMode = mode() === 'light' ? 'dark' : 'light'

      setMode(nextMode)
      setTheme(nextMode)
    },
  }

  createEffect(() => {
    ConfigProvider.config({ theme: theme() })
  })

  onMount(() => {
    setMode(getCurrentMode())

    const observer = new MutationObserver(() => setMode(getCurrentMode()))

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    onCleanup(() => observer.disconnect())
  })

  return (
    <DocsThemeContext.Provider value={value}>
      <ConfigProvider theme={theme()}>{props.children}</ConfigProvider>
    </DocsThemeContext.Provider>
  )
}
