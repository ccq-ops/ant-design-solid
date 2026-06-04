import { Router } from '@solidjs/router'
import { Layout } from './components/layout'
import { routes } from './routes'

export function App() {
  return <Router root={Layout}>{routes}</Router>
}
