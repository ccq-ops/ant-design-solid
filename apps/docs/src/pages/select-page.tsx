import { Form, Select, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../site/demo-block'

const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Orange', value: 'orange' },
  { label: 'Disabled', value: 'disabled', disabled: true },
]

export function SelectPage() {
  return (
    <>
      <h1>Select</h1>
      <DemoBlock
        title="Basic"
        code={`<Select placeholder="Select fruit" options={[{ label: 'Apple', value: 'apple' }]} />`}
      >
        <Space direction="vertical" style={{ width: '240px' }}>
          <Select placeholder="Select fruit" allowClear options={options} />
          <Select disabled placeholder="Disabled" options={options} />
        </Space>
      </DemoBlock>
      <DemoBlock
        title="Form integration"
        code={`<Form.Item name="fruit"><Select options={options} /></Form.Item>`}
      >
        <Form initialValues={{ fruit: 'apple' }}>
          <Form.Item name="fruit">
            <Select options={options} />
          </Form.Item>
        </Form>
      </DemoBlock>
    </>
  )
}
