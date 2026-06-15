import { StyleProvider } from '@ant-design-solid/cssinjs'
import { SolidBaseRoot } from '@kobalte/solidbase/client'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { DocsThemeProvider } from './components/theme-context'

const docsBase = import.meta.env.BASE_URL === '/ant-design-solid/' ? '/ant-design-solid' : undefined

export default function App() {
  return (
    <StyleProvider>
      <DocsThemeProvider>
        <Router base={docsBase} root={SolidBaseRoot}>
          <FileRoutes />
        </Router>
      </DocsThemeProvider>
    </StyleProvider>
  )
}
