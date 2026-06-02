import { Button, ConfigProvider, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'
export default function Theming() {
  return (
    <>
      <h1>Theming</h1>
      <p>Use ConfigProvider to override seed tokens and component tokens.</p>
      <DemoBlock
        title="Custom primary color"
        code={`<ConfigProvider theme={{ token: { colorPrimary: '#722ed1' } }}><Button type="primary" /></ConfigProvider>`}
      >
        <ConfigProvider theme={{ token: { colorPrimary: '#722ed1' } }}>
          <Space>
            <Button type="primary">Purple Button</Button>
          </Space>
        </ConfigProvider>
      </DemoBlock>
    </>
  )
}
