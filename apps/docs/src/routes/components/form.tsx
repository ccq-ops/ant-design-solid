import { Button, Form, Input, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

export default function FormPage() {
  return (
    <>
      <h1>Form</h1>
      <DemoBlock
        title="Basic form"
        code={`<Form onFinish={console.log}><Form.Item name="username" rules={[{ required: true }]}><Input placeholder="Username" /></Form.Item><Button htmlType="submit">Submit</Button></Form>`}
      >
        <Form onFinish={(values) => console.log(values)}>
          <Space direction="vertical" class="w-80">
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Username is required' }]}
            >
              <Input placeholder="Username" />
            </Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Space>
        </Form>
      </DemoBlock>
    </>
  )
}
