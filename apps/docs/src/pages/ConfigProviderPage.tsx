import { Button, ConfigProvider } from '@ant-design-solid/core'
import { DemoBlock } from '../site/DemoBlock'
export function ConfigProviderPage() {
  return (
    <>
      <h1>ConfigProvider</h1>
      <DemoBlock
        title="Theme override"
        code={`<ConfigProvider theme={{ token: { colorPrimary: '#722ed1' } }}><Button type="primary" /></ConfigProvider>`}
      >
        <ConfigProvider theme={{ token: { colorPrimary: '#722ed1' } }}>
          <Button type="primary">Custom Theme</Button>
        </ConfigProvider>
      </DemoBlock>
    </>
  )
}
