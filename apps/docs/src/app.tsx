import { createMemo, type JSX } from 'solid-js'
import { Layout } from './site/layout'
import { Home } from './pages/home'
import { GettingStarted } from './pages/getting-started'
import { Theming } from './pages/theming'
import { ButtonPage } from './pages/button-page'
import { InputPage } from './pages/input-page'
import { SpacePage } from './pages/space-page'
import { TypographyPage } from './pages/typography-page'
import { GridPage } from './pages/grid-page'
import { ConfigProviderPage } from './pages/config-provider-page'
import { FormPage } from './pages/form-page'
import { SelectPage } from './pages/select-page'
import { CheckboxPage } from './pages/checkbox-page'
import { RadioPage } from './pages/radio-page'
import { SwitchPage } from './pages/switch-page'
import { AlertPage } from './pages/alert-page'
import { MessagePage } from './pages/message-page'
import { NotificationPage } from './pages/notification-page'
import { ModalPage } from './pages/modal-page'
import { PopconfirmPage } from './pages/popconfirm-page'

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
  '/components/alert': AlertPage,
  '/components/message': MessagePage,
  '/components/notification': NotificationPage,
  '/components/modal': ModalPage,
  '/components/popconfirm': PopconfirmPage,
  '/components/space': SpacePage,
  '/components/typography': TypographyPage,
  '/components/grid': GridPage,
  '/components/config-provider': ConfigProviderPage,
}

export function App() {
  const Page = createMemo(() => routes[window.location.pathname] ?? Home)
  return <Layout>{Page()()}</Layout>
}
