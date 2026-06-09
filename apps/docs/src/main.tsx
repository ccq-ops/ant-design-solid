import { Router } from '@solidjs/router'
import { render } from 'solid-js/web'
import { StyleProvider } from '@ant-design-solid/cssinjs'
import { Layout } from './components/layout'
import { DocsThemeProvider } from './components/theme-context'
import { routes } from './routes'
import './main.css'

render(
  () => (
    <StyleProvider>
      <DocsThemeProvider>
        <Router root={Layout}>{routes}</Router>
      </DocsThemeProvider>
    </StyleProvider>
  ),
  document.getElementById('root')!,
)
