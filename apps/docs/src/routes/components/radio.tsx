import { Form, Radio, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

const options = [
  { label: 'A', value: 'a' },
  { label: 'B', value: 'b' },
  { label: 'Disabled', value: 'disabled', disabled: true },
]

export default function RadioPage() {
  return (
    <>
      <h1>Radio</h1>
      <DemoBlock title="Basic" code={`<Radio.Group options={options} defaultValue="a" />`}>
        <Space direction="vertical">
          <Radio.Group options={options} defaultValue="a" />
          <Radio.Group optionType="button" options={options} defaultValue="b" />
          <Radio.Group disabled options={options} defaultValue="a" />
        </Space>
      </DemoBlock>
      <DemoBlock
        title="Form integration"
        code={`<Form.Item name="choice"><Radio.Group options={options} /></Form.Item>`}
      >
        <Form initialValues={{ choice: 'a' }}>
          <Form.Item name="choice">
            <Radio.Group options={options} />
          </Form.Item>
        </Form>
      </DemoBlock>
    </>
  )
}
