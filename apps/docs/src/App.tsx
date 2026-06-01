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
import { FormPage } from './pages/FormPage'
import { SelectPage } from './pages/SelectPage'
import { CheckboxPage } from './pages/CheckboxPage'
import { RadioPage } from './pages/RadioPage'
import { SwitchPage } from './pages/SwitchPage'

const routes: Record<string, () => JSX.Element> = {
  '/': Home,
  '/docs/getting-started': GettingStarted,
  '/docs/theming': Theming,
  '/components/button': ButtonPage,
  '/components/input': InputPage,
  '/components/form': FormPage,
  '/components/select': SelectPage,
  '/components/checkbox': CheckboxPage,
  '/components/radio': RadioPage,
  '/components/switch': SwitchPage,
  '/components/space': SpacePage,
  '/components/typography': TypographyPage,
  '/components/grid': GridPage,
  '/components/config-provider': ConfigProviderPage,
}

export function App() {
  const Page = createMemo(() => routes[window.location.pathname] ?? Home)
  return <Layout>{Page()()}</Layout>
}
