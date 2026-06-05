import { createSignal } from 'solid-js'
import {
  Button,
  Checkbox,
  Form,
  Input,
  Space,
  Switch,
  message,
  useForm,
} from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const formRows: ApiTableRow[] = [
  {
    property: 'form',
    description: 'External form instance created by useForm or createFormInstance.',
    type: 'FormInstance',
  },
  {
    property: 'initialValues',
    description: 'Initial field values applied when the form is mounted.',
    type: 'FormValues',
  },
  {
    property: 'onFinish',
    description: 'Called with all values after validation succeeds on submit.',
    type: '(values: FormValues) => void',
  },
  {
    property: 'onFinishFailed',
    description: 'Called with values and error fields after validation fails.',
    type: '(errorInfo: ValidateErrorInfo) => void',
  },
  {
    property: 'onValuesChange',
    description: 'Called whenever a registered field updates its value.',
    type: '(changedValues: FormValues, allValues: FormValues) => void',
  },
]

const formItemRows: ApiTableRow[] = [
  {
    property: 'label',
    description: 'Label displayed before the field control.',
    type: 'JSX.Element',
  },
  {
    property: 'name',
    description: 'Field name used to read and write values in the form store.',
    type: 'string',
  },
  {
    property: 'rules',
    description: 'Validation rules for this field.',
    type: 'Rule[]',
  },
  {
    property: 'required',
    description: 'Adds a required rule and displays the required mark.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'help',
    description: 'Custom help text shown below the control.',
    type: 'JSX.Element',
  },
  {
    property: 'validateStatus',
    description: 'Manually sets validation visual state.',
    type: "'success' | 'warning' | 'error' | 'validating'",
  },
  {
    property: 'valuePropName',
    description: 'Prop name used by child controls for their value.',
    type: 'string',
    defaultValue: "'value'",
  },
  {
    property: 'trigger',
    description: 'Child event name that updates the field value.',
    type: 'string',
    defaultValue: "'onChange'",
  },
  {
    property: 'initialValue',
    description: 'Initial value for this field.',
    type: 'unknown',
  },
]

const formInstanceRows: ApiTableRow[] = [
  {
    property: 'getFieldValue',
    description: 'Reads one field value.',
    type: '(name: string) => unknown',
  },
  {
    property: 'setFieldValue',
    description: 'Sets one field value and clears its errors.',
    type: '(name: string, value: unknown) => void',
  },
  {
    property: 'getFieldsValue',
    description: 'Returns a shallow copy of all form values.',
    type: '() => FormValues',
  },
  {
    property: 'setFieldsValue',
    description: 'Merges multiple values into the form store.',
    type: '(values: FormValues) => void',
  },
  {
    property: 'resetFields',
    description: 'Resets all fields or the provided field names to their initial values.',
    type: '(names?: string[]) => void',
  },
  {
    property: 'validateFields',
    description: 'Validates all fields or selected fields and resolves with values.',
    type: '(names?: string[]) => Promise<FormValues>',
  },
  {
    property: 'submit',
    description: 'Runs validation and calls onFinish or onFinishFailed.',
    type: '() => void',
  },
]

const ruleRows: ApiTableRow[] = [
  {
    property: 'required',
    description: 'Requires a non-empty value.',
    type: 'boolean',
  },
  {
    property: 'type',
    description: 'Checks the runtime value type.',
    type: "'string' | 'number' | 'boolean' | 'array'",
  },
  {
    property: 'min / max / len',
    description: 'Validates string length, array length, or numeric value depending on the field.',
    type: 'number',
  },
  {
    property: 'pattern',
    description: 'Requires the value to match a regular expression.',
    type: 'RegExp',
  },
  {
    property: 'message',
    description: 'Error message shown when the rule fails.',
    type: 'string',
  },
  {
    property: 'validator',
    description: 'Custom synchronous validator. Return a string to report an error.',
    type: '(value: unknown, values: FormValues) => string | void',
  },
]

export default function FormPage() {
  const [instanceForm] = useForm()
  const [summary, setSummary] = createSignal('Submit the form to see values.')

  return (
    <>
      <h1>Form</h1>
      <p>Form stores field values, validates rules, and coordinates common input controls.</p>

      <DemoBlock
        title="Basic form"
        code={`<Form onFinish={console.log}>
  <Form.Item name="username" rules={[{ required: true, message: 'Username is required' }]}>
    <Input placeholder="Username" />
  </Form.Item>
  <Button htmlType="submit">Submit</Button>
</Form>`}
      >
        <Form onFinish={(values) => message.success(`Submitted ${values.username}`)}>
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

      <DemoBlock
        title="Labels and initial values"
        code={`<Form initialValues={{ username: 'solid-user', email: 'hello@example.com' }}>
  <Form.Item label="Username" name="username"><Input /></Form.Item>
  <Form.Item label="Email" name="email"><Input /></Form.Item>
</Form>`}
      >
        <Form initialValues={{ username: 'solid-user', email: 'hello@example.com' }}>
          <Space direction="vertical" class="w-90">
            <Form.Item label="Username" name="username">
              <Input />
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input />
            </Form.Item>
          </Space>
        </Form>
      </DemoBlock>

      <DemoBlock
        title="Validation"
        code={`<Form onFinishFailed={({ errorFields }) => console.log(errorFields)}>
  <Form.Item label="Email" name="email" rules={[{ required: true }, { pattern: /@/, message: 'Enter a valid email' }]}>
    <Input />
  </Form.Item>
</Form>`}
      >
        <Form
          onFinish={() => message.success('Validation passed')}
          onFinishFailed={({ errorFields }) =>
            message.error(errorFields[0]?.errors[0] ?? 'Invalid')
          }
        >
          <Space direction="vertical" class="w-90">
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Email is required' },
                { pattern: /@/, message: 'Enter a valid email' },
              ]}
            >
              <Input placeholder="name@example.com" />
            </Form.Item>
            <Button htmlType="submit">Validate</Button>
          </Space>
        </Form>
      </DemoBlock>

      <DemoBlock
        title="Form instance"
        code={`const [form] = useForm()
<Form form={form} initialValues={{ username: 'initial' }}>
  <Form.Item name="username"><Input /></Form.Item>
</Form>
<Button onClick={() => form.setFieldsValue({ username: 'updated' })}>Fill</Button>`}
      >
        <Space direction="vertical" class="w-90">
          <Form
            form={instanceForm}
            initialValues={{ username: 'initial' }}
            onValuesChange={(_, values) => setSummary(JSON.stringify(values))}
          >
            <Form.Item label="Username" name="username">
              <Input />
            </Form.Item>
          </Form>
          <Space>
            <Button onClick={() => instanceForm.setFieldsValue({ username: 'updated' })}>
              Fill
            </Button>
            <Button onClick={() => instanceForm.resetFields()}>Reset</Button>
            <Button onClick={() => setSummary(JSON.stringify(instanceForm.getFieldsValue()))}>
              Read
            </Button>
          </Space>
          <span>{summary()}</span>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Custom value binding"
        code={`<Form.Item name="enabled" valuePropName="checked">
  <Switch />
</Form.Item>
<Form.Item name="agree" valuePropName="checked" rules={[{ required: true }]}>
  <Checkbox>I agree</Checkbox>
</Form.Item>`}
      >
        <Form initialValues={{ enabled: true }} onFinish={() => message.success('Saved')}>
          <Space direction="vertical">
            <Form.Item label="Enabled" name="enabled" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item
              name="agree"
              valuePropName="checked"
              rules={[{ required: true, message: 'Please agree before saving' }]}
            >
              <Checkbox>I agree</Checkbox>
            </Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Space>
        </Form>
      </DemoBlock>

      <h2>API</h2>
      <h3>Form</h3>
      <ApiTable rows={formRows} aria-label="Form API" />
      <h3>Form.Item</h3>
      <ApiTable rows={formItemRows} aria-label="Form Item API" />
      <h3>FormInstance</h3>
      <ApiTable rows={formInstanceRows} aria-label="Form Instance API" />
      <h3>Rule</h3>
      <ApiTable rows={ruleRows} aria-label="Form Rule API" />
    </>
  )
}
