import { Router } from '@solidjs/router'
import { Layout } from './site/layout'
import { routes } from './site/routes'

export function App() {
  return <Router root={Layout}>{routes}</Router>
}
