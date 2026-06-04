import { render } from 'solid-js/web'
import { StyleProvider } from '@ant-design-solid/cssinjs'
import { App } from './app'
import { DocsThemeProvider } from './components/theme-context'
import './app.css'
render(
  () => (
    <StyleProvider>
      <DocsThemeProvider>
        <App />
      </DocsThemeProvider>
    </StyleProvider>
  ),
  document.getElementById('root')!,
)
