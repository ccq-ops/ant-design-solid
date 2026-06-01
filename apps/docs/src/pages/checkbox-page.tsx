import { Checkbox, Form, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../site/demo-block'

export function CheckboxPage() {
  return (
    <>
      <h1>Checkbox</h1>
      <DemoBlock title="Basic" code={`<Checkbox defaultChecked>Agree</Checkbox>`}>
        <Space direction="vertical">
          <Checkbox defaultChecked>Agree</Checkbox>
          <Checkbox disabled>Disabled</Checkbox>
          <Checkbox.Group
            options={[
              { label: 'A', value: 'a' },
              { label: 'B', value: 'b' },
            ]}
            defaultValue={['a']}
          />
        </Space>
      </DemoBlock>
      <DemoBlock
        title="Form integration"
        code={`<Form.Item name="agree" valuePropName="checked"><Checkbox>Agree</Checkbox></Form.Item>`}
      >
        <Form>
          <Form.Item name="agree" valuePropName="checked">
            <Checkbox>Agree to terms</Checkbox>
          </Form.Item>
        </Form>
      </DemoBlock>
    </>
  )
}
