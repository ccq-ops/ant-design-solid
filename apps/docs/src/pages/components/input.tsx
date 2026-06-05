import { Form, Input, Space } from '@ant-design-solid/core'
import { SearchOutlined, UserOutlined } from '@ant-design-solid/icons'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const inputRows: ApiTableRow[] = [
  {
    property: 'size',
    description: 'Input size. Defaults to the current ConfigProvider component size.',
    type: 'ComponentSize',
  },
  {
    property: 'status',
    description: 'Validation visual status.',
    type: "'error' | 'warning'",
  },
  {
    property: 'prefix',
    description: 'Element rendered before the input value.',
    type: 'JSX.Element',
  },
  {
    property: 'suffix',
    description: 'Element rendered after the input value.',
    type: 'JSX.Element',
  },
  {
    property: 'allowClear',
    description: 'Shows a clear button when the input has a value.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'value',
    description: 'Controlled input value.',
    type: 'string | number',
  },
  {
    property: 'defaultValue',
    description: 'Initial uncontrolled input value.',
    type: 'string | number',
  },
]

const textAreaRows: ApiTableRow[] = [
  {
    property: 'value',
    description: 'Controlled textarea value.',
    type: 'string | number',
  },
  {
    property: 'defaultValue',
    description: 'Initial uncontrolled textarea value.',
    type: 'string | number',
  },
  {
    property: 'showCount',
    description: 'Shows the current character count, and maxLength when provided.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'status',
    description: 'Validation visual status.',
    type: "'error' | 'warning'",
  },
]

export default function InputPage() {
  return (
    <>
      <h1>Input</h1>
      <p>Input captures single-line text and includes affix, clear, and status states.</p>

      <DemoBlock title="Basic" code={`<Input placeholder="Basic usage" />`}>
        <Input placeholder="Basic usage" />
      </DemoBlock>

      <DemoBlock
        title="Sizes"
        code={`<Input size="small" placeholder="Small" />
<Input placeholder="Middle" />
<Input size="large" placeholder="Large" />`}
      >
        <Space direction="vertical" class="w-80">
          <Input size="small" placeholder="Small" />
          <Input placeholder="Middle" />
          <Input size="large" placeholder="Large" />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Prefix and suffix"
        code={`<Input prefix={<UserOutlined />} suffix={<SearchOutlined />} placeholder="Search user" />`}
      >
        <Input
          class="w-80"
          prefix={<UserOutlined />}
          suffix={<SearchOutlined />}
          placeholder="Search user"
        />
      </DemoBlock>

      <DemoBlock
        title="Status and clear"
        code={`<Input allowClear defaultValue="Clear me" />
<Input status="warning" defaultValue="Warning" />
<Input status="error" defaultValue="Error" />`}
      >
        <Space direction="vertical" class="w-80">
          <Input allowClear defaultValue="Clear me" />
          <Input status="warning" defaultValue="Warning" />
          <Input status="error" defaultValue="Error" />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="TextArea"
        code={`<Input.TextArea showCount maxLength={120} defaultValue="Write something" />`}
      >
        <Input.TextArea showCount maxLength={120} defaultValue="Write something" />
      </DemoBlock>

      <DemoBlock
        title="In Form"
        code={`<Form initialValues={{ email: 'hello@example.com' }}>
  <Form.Item label="Email" name="email"><Input /></Form.Item>
</Form>`}
      >
        <Form initialValues={{ email: 'hello@example.com' }}>
          <Form.Item label="Email" name="email">
            <Input class="w-80" />
          </Form.Item>
        </Form>
      </DemoBlock>

      <h2>API</h2>
      <h3>Input</h3>
      <ApiTable rows={inputRows} aria-label="Input API" />
      <h3>Input.TextArea</h3>
      <ApiTable rows={textAreaRows} aria-label="TextArea API" />
    </>
  )
}
