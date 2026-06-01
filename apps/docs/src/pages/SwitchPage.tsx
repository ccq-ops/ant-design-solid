import { Form, Space, Switch } from '@ant-design-solid/core'
import { DemoBlock } from '../site/DemoBlock'

export function SwitchPage() {
  return (
    <>
      <h1>Switch</h1>
      <DemoBlock title="Basic" code={`<Switch checkedChildren="On" unCheckedChildren="Off" />`}>
        <Space>
          <Switch checkedChildren="On" unCheckedChildren="Off" />
          <Switch size="small" defaultChecked />
          <Switch disabled />
          <Switch loading />
        </Space>
      </DemoBlock>
      <DemoBlock title="Form integration" code={`<Form.Item name="enabled" valuePropName="checked"><Switch /></Form.Item>`}>
        <Form>
          <Form.Item name="enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </DemoBlock>
    </>
  )
}
