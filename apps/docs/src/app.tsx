import { StyleProvider } from '@ant-design-solid/cssinjs'
import { SolidBaseRoot } from '@kobalte/solidbase/client'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { DocsThemeProvider } from './components/theme-context'

export default function App() {
  return (
    <StyleProvider>
      <DocsThemeProvider>
        <Router root={SolidBaseRoot}>
          <FileRoutes />
        </Router>
      </DocsThemeProvider>
    </StyleProvider>
  )
}
