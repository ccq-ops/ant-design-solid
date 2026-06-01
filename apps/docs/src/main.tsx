import { render } from 'solid-js/web'
import { ConfigProvider } from '@ant-design-solid/core'
import { StyleProvider } from '@ant-design-solid/cssinjs'
import { App } from './app'
import './app.css'
render(
  () => (
    <StyleProvider>
      <ConfigProvider>
        <App />
      </ConfigProvider>
    </StyleProvider>
  ),
  document.getElementById('root')!,
)
