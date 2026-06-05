import { createSignal } from 'solid-js'
import { Form, Space, Switch } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const switchRows: ApiTableRow[] = [
  {
    property: 'checked',
    description: 'Controlled checked state.',
    type: 'boolean',
  },
  {
    property: 'defaultChecked',
    description: 'Initial checked state for uncontrolled usage.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'disabled',
    description: 'Disables user interaction.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'loading',
    description: 'Displays loading state and disables interaction.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'size',
    description: 'Switch size.',
    type: "'small' | 'middle'",
    defaultValue: "'middle'",
  },
  {
    property: 'checkedChildren',
    description: 'Content displayed when checked.',
    type: 'JSX.Element',
  },
  {
    property: 'unCheckedChildren',
    description: 'Content displayed when unchecked.',
    type: 'JSX.Element',
  },
  {
    property: 'prefixCls',
    description: 'Custom CSS class prefix.',
    type: 'string',
  },
  {
    property: 'onChange',
    description: 'Called with the next checked state after user interaction.',
    type: '(checked: boolean, event: MouseEvent) => void',
  },
]

export default function SwitchPage() {
  const [checked, setChecked] = createSignal(true)

  return (
    <>
      <h1>Switch</h1>
      <p>Switch toggles a boolean state on or off.</p>

      <DemoBlock title="Basic" code={`<Switch checkedChildren="On" unCheckedChildren="Off" />`}>
        <Space>
          <Switch checkedChildren="On" unCheckedChildren="Off" />
          <Switch defaultChecked checkedChildren="On" unCheckedChildren="Off" />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Controlled"
        code={`const [checked, setChecked] = createSignal(true)
<Switch checked={checked()} onChange={setChecked} />`}
      >
        <Space>
          <Switch checked={checked()} onChange={setChecked} />
          <span>{checked() ? 'Enabled' : 'Disabled'}</span>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Disabled"
        code={`<Switch disabled />
<Switch disabled defaultChecked />`}
      >
        <Space>
          <Switch disabled />
          <Switch disabled defaultChecked />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Loading"
        code={`<Switch loading />
<Switch loading defaultChecked />`}
      >
        <Space>
          <Switch loading />
          <Switch loading defaultChecked />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Sizes"
        code={`<Switch size="small" />
<Switch />`}
      >
        <Space align="center">
          <Switch size="small" defaultChecked />
          <Switch defaultChecked />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="In Form"
        code={`<Form initialValues={{ enabled: true }}>
  <Form.Item name="enabled" valuePropName="checked"><Switch /></Form.Item>
</Form>`}
      >
        <Form initialValues={{ enabled: true }}>
          <Form.Item label="Enabled" name="enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable rows={switchRows} aria-label="Switch API" />
    </>
  )
}
