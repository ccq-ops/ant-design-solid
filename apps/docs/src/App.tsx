import { createMemo, type JSX } from 'solid-js'
import { Layout } from './site/Layout'
import { Home } from './pages/Home'
import { GettingStarted } from './pages/GettingStarted'
import { Theming } from './pages/Theming'
import { ButtonPage } from './pages/ButtonPage'
import { InputPage } from './pages/InputPage'
import { SpacePage } from './pages/SpacePage'
import { TypographyPage } from './pages/TypographyPage'
import { GridPage } from './pages/GridPage'
import { ConfigProviderPage } from './pages/ConfigProviderPage'
const routes: Record<string, () => JSX.Element> = { '/': Home, '/docs/getting-started': GettingStarted, '/docs/theming': Theming, '/components/button': ButtonPage, '/components/input': InputPage, '/components/space': SpacePage, '/components/typography': TypographyPage, '/components/grid': GridPage, '/components/config-provider': ConfigProviderPage }
export function App() { const Page = createMemo(() => routes[window.location.pathname] ?? Home); return <Layout>{Page()()}</Layout> }
