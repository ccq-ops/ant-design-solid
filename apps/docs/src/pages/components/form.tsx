import { For, createSignal } from 'solid-js'
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
    property: 'layout',
    description: 'Form layout mode.',
    type: "'horizontal' | 'vertical' | 'inline'",
    defaultValue: "'horizontal'",
  },
  {
    property: 'requiredMark',
    description: 'Required mark display style for Form.Item labels.',
    type: "boolean | 'optional'",
    defaultValue: 'true',
  },
  {
    property: 'validateTrigger',
    description: 'Default event name or names that trigger validation for child Form.Item fields.',
    type: 'string | string[]',
    defaultValue: "'onChange'",
  },
  {
    property: 'labelCol / wrapperCol',
    description: 'Common label and control layout metadata passed to form items.',
    type: 'unknown',
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
  {
    property: 'onFieldsChange',
    description: 'Called when registered field values or field state change.',
    type: '(changedFields: FieldData[], allFields: FieldData[]) => void',
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
    type: 'NamePath',
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
    property: 'validateTrigger',
    description: 'Event name or names that trigger validation.',
    type: 'string | string[]',
    defaultValue: 'Form validateTrigger or trigger',
  },
  {
    property: 'shouldUpdate',
    description:
      'For unnamed render areas, re-render when form values change or when a predicate returns true.',
    type: 'boolean | ((prevValues, nextValues) => boolean)',
  },
  {
    property: 'labelCol / wrapperCol',
    description: 'Item-level label and control layout metadata.',
    type: 'unknown',
  },
  {
    property: 'labelAlign / colon / tooltip',
    description:
      'Override label alignment, colon display, or render extra label help for this item.',
    type: "'left' | 'right' / boolean / JSX.Element",
  },
  {
    property: 'getValueFromEvent',
    description: 'Customize how a field value is extracted from control events.',
    type: '(...args: unknown[]) => unknown',
  },
  {
    property: 'getValueProps',
    description: 'Customize props derived from the current field value.',
    type: '(value: unknown) => Record<string, unknown>',
  },
  {
    property: 'normalize',
    description: 'Normalize a value before storing it in the form.',
    type: '(value, prevValue, allValues) => unknown',
  },
  {
    property: 'dependencies',
    description: 'Revalidate this field when dependent fields update.',
    type: 'NamePath[]',
  },
  {
    property: 'validateFirst',
    description: 'Stop validation on the first failing rule, or run rules in parallel.',
    type: "boolean | 'parallel'",
    defaultValue: 'false',
  },
  {
    property: 'validateDebounce',
    description: 'Debounce triggered validation by the given milliseconds.',
    type: 'number',
  },
  {
    property: 'preserve',
    description: 'Keep a field value when the field is unmounted.',
    type: 'boolean',
    defaultValue: 'true',
  },
  {
    property: 'noStyle',
    description: 'Register a field without rendering the styled Form.Item wrapper.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'hidden',
    description: 'Hide the field while still collecting and validating its value.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'extra',
    description: 'Extra prompt content shown below validation help.',
    type: 'JSX.Element',
  },
  {
    property: 'initialValue',
    description: 'Initial value for this field.',
    type: 'unknown',
  },
]

const formListRows: ApiTableRow[] = [
  {
    property: 'name',
    description: 'List field name path.',
    type: 'NamePath',
  },
  {
    property: 'initialValue',
    description: 'Initial array value for the list.',
    type: 'unknown[]',
  },
  {
    property: 'rules',
    description:
      'List-level validation rules exposed through render meta.errors and meta.warnings.',
    type: 'Rule[]',
  },
]

const formInstanceRows: ApiTableRow[] = [
  {
    property: 'getFieldValue',
    description: 'Reads one field value.',
    type: '(name: NamePath) => unknown',
  },
  {
    property: 'setFieldValue',
    description: 'Sets one field value and clears its errors.',
    type: '(name: NamePath, value: unknown) => void',
  },
  {
    property: 'getFieldsValue',
    description: 'Returns registered field values, selected values, or all values with true.',
    type: '(nameList?: true | NamePath[]) => FormValues',
  },
  {
    property: 'setFieldsValue',
    description: 'Merges multiple values into the form store.',
    type: '(values: FormValues) => void',
  },
  {
    property: 'setFields',
    description: 'Sets field values or field state such as errors and touched.',
    type: '(fields: FieldData[]) => void',
  },
  {
    property: 'resetFields',
    description: 'Resets all fields or the provided field names to their initial values.',
    type: '(names?: NamePath[]) => void',
  },
  {
    property: 'validateFields',
    description: 'Validates all fields or selected fields and resolves with values.',
    type: '(names?: NamePath[], config?: ValidateConfig) => Promise<FormValues>',
  },
  {
    property: 'getFieldError',
    description: 'Returns current errors for one field.',
    type: '(name: NamePath) => string[]',
  },
  {
    property: 'getFieldsError',
    description: 'Returns error and warning state for registered fields.',
    type: '(names?: NamePath[]) => FieldError[]',
  },
  {
    property: 'scrollToField',
    description: 'Scrolls a registered field element into view and can focus its control.',
    type: '(name: NamePath, options?: ScrollIntoViewOptions | { focus?: boolean }) => void',
  },
  {
    property: 'getFieldInstance',
    description: 'Returns the registered field DOM element when available.',
    type: '(name: NamePath) => unknown',
  },
  {
    property: 'isFieldTouched',
    description: 'Checks whether a field has been touched.',
    type: '(name: NamePath) => boolean',
  },
  {
    property: 'isFieldsTouched',
    description: 'Checks whether any or all fields have been touched.',
    type: '(allTouched?: boolean) => boolean; (names?: NamePath[], allTouched?: boolean) => boolean',
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
    type: "'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url' | 'enum'",
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
    property: 'fields',
    description: 'Object or array child rules keyed by property name or numeric index string.',
    type: 'Record<string, Rule>',
  },
  {
    property: 'defaultField',
    description: 'Rule applied to each item when validating an array value.',
    type: 'Rule',
  },
  {
    property: 'validator',
    description:
      'Custom validator. Return a string, throw, or reject to report an error. Set validator.legacy = true to use the old (value, values) call shape.',
    type: '(rule, value, values?) => string | void | Promise<void>',
  },
]

function WatchedUsername() {
  const username = Form.useWatch('username')
  return <span>Watched: {String(username() ?? '')}</span>
}

function DynamicRuleFields() {
  const requireNickname = Form.useWatch('requireNickname')

  return (
    <>
      <Form.Item name="requireNickname" valuePropName="checked">
        <Checkbox>Nickname is required</Checkbox>
      </Form.Item>
      <Form.Item
        label="Nickname"
        name="nickname"
        rules={[
          {
            required: Boolean(requireNickname()),
            message: 'Please input nickname',
          },
        ]}
      >
        <Input placeholder="Nickname" />
      </Form.Item>
    </>
  )
}

function ConditionalCompanyField() {
  const business = Form.useWatch('business')

  return (
    <>
      <Form.Item name="business" valuePropName="checked">
        <Checkbox>Business account</Checkbox>
      </Form.Item>
      {business() ? (
        <Form.Item label="Company" name="company" rules={[{ required: true }]}>
          <Input placeholder="Company name" />
        </Form.Item>
      ) : null}
    </>
  )
}

function StatusInput() {
  const status = Form.Item.useStatus()
  return <Input placeholder={`Status: ${status.status() ?? 'none'}`} />
}

export default function FormPage() {
  const [instanceForm] = useForm()
  const [validateOnlyForm] = useForm()
  const [shouldUpdateForm] = useForm()
  const [scrollForm] = useForm()
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
        title="Form layout"
        code={`<Form layout="vertical">
  <Form.Item label="Username" name="verticalUsername"><Input /></Form.Item>
  <Form.Item label="Email" name="verticalEmail"><Input /></Form.Item>
</Form>
<Form layout="inline">
  <Form.Item name="inlineUsername"><Input placeholder="Username" /></Form.Item>
  <Button htmlType="submit">Submit</Button>
</Form>`}
      >
        <Space direction="vertical" size="large">
          <Form layout="vertical" initialValues={{ verticalUsername: 'solid-user' }}>
            <Space direction="vertical" class="w-90">
              <Form.Item label="Username" name="verticalUsername">
                <Input />
              </Form.Item>
              <Form.Item label="Email" name="verticalEmail">
                <Input placeholder="hello@example.com" />
              </Form.Item>
            </Space>
          </Form>
          <Form layout="inline" onFinish={() => message.success('Inline form submitted')}>
            <Form.Item name="inlineUsername">
              <Input placeholder="Username" />
            </Form.Item>
            <Form.Item name="inlineEmail">
              <Input placeholder="Email" />
            </Form.Item>
            <Button htmlType="submit">Submit</Button>
          </Form>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Required mark"
        code={`<Form requiredMark="optional">
  <Form.Item label="Username" name="username" rules={[{ required: true }]}><Input /></Form.Item>
  <Form.Item label="Nickname" name="nickname"><Input /></Form.Item>
</Form>
<Form requiredMark={false}>
  <Form.Item label="Email" name="email" rules={[{ required: true }]}><Input /></Form.Item>
</Form>`}
      >
        <Space direction="vertical" size="large">
          <Form requiredMark="optional">
            <Space direction="vertical" class="w-90">
              <Form.Item label="Username" name="markUsername" rules={[{ required: true }]}>
                <Input placeholder="Required" />
              </Form.Item>
              <Form.Item label="Nickname" name="markNickname">
                <Input placeholder="Optional" />
              </Form.Item>
            </Space>
          </Form>
          <Form requiredMark={false}>
            <Space direction="vertical" class="w-90">
              <Form.Item label="Email" name="hiddenMarkEmail" rules={[{ required: true }]}>
                <Input placeholder="Required mark hidden" />
              </Form.Item>
            </Space>
          </Form>
        </Space>
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
        title="Validate trigger"
        code={`<Form>
  <Form.Item
    label="Email"
    name="email"
    validateTrigger="onBlur"
    rules={[
      { required: true, message: 'Email is required' },
      { type: 'email', message: 'Enter a valid email after blur' },
    ]}
  >
    <Input />
  </Form.Item>
</Form>`}
      >
        <Form>
          <Space direction="vertical" class="w-90">
            <Form.Item
              label="Email"
              name="triggerEmail"
              validateTrigger="onBlur"
              rules={[
                { required: true, message: 'Email is required' },
                { type: 'email', message: 'Enter a valid email after blur' },
              ]}
            >
              <Input placeholder="Validation runs on blur" />
            </Form.Item>
          </Space>
        </Form>
      </DemoBlock>

      <DemoBlock
        title="Validate only"
        code={`const [form] = useForm()
form.validateFields(undefined, { validateOnly: true })

<Form form={form}>
  <Form.Item label="Username" name="username" rules={[{ required: true }]}>
    <Input />
  </Form.Item>
</Form>`}
      >
        <Space direction="vertical" class="w-90">
          <Form form={validateOnlyForm}>
            <Form.Item
              label="Username"
              name="validateOnlyUsername"
              rules={[{ required: true, message: 'Username is required' }]}
            >
              <Input placeholder="Validate without showing field errors" />
            </Form.Item>
          </Form>
          <Button
            onClick={() => {
              void validateOnlyForm
                .validateFields(undefined, { validateOnly: true })
                .then(() => message.success('Validate only passed'))
                .catch((error) =>
                  message.error(error.errorFields?.[0]?.errors[0] ?? 'Validation failed'),
                )
            }}
          >
            Validate only
          </Button>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Warning only"
        code={`<Form onFinish={console.log}>
  <Form.Item label="Website" name="website" rules={[{ type: 'url', warningOnly: true, message: 'Enter a valid URL' }]}>
    <Input />
  </Form.Item>
  <Button htmlType="submit">Submit</Button>
</Form>`}
      >
        <Form onFinish={() => message.success('Submitted despite warnings')}>
          <Space direction="vertical" class="w-90">
            <Form.Item
              label="Website"
              name="warningWebsite"
              rules={[{ type: 'url', warningOnly: true, message: 'Enter a valid URL' }]}
            >
              <Input placeholder="https://example.com" />
            </Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
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

      <DemoBlock
        title="Nested fields"
        code={`<Form initialValues={{ user: { email: 'hello@example.com' } }} onFinish={console.log}>
  <Form.Item label="Email" name={['user', 'email']} rules={[{ type: 'email' }]}>
    <Input />
  </Form.Item>
</Form>`}
      >
        <Form
          initialValues={{ user: { email: 'hello@example.com' } }}
          onFinish={(values) => message.success(JSON.stringify(values))}
        >
          <Space direction="vertical" class="w-90">
            <Form.Item
              label="Email"
              name={['user', 'email']}
              rules={[{ type: 'email', message: 'Enter an email' }]}
            >
              <Input />
            </Form.Item>
            <Button htmlType="submit">Submit nested</Button>
          </Space>
        </Form>
      </DemoBlock>

      <DemoBlock
        title="Watch fields"
        code={`function WatchedUsername() {
  const username = Form.useWatch('username')
  return <span>Watched: {String(username() ?? '')}</span>
}

<Form>
  <Form.Item label="Username" name="username"><Input /></Form.Item>
  <WatchedUsername />
</Form>`}
      >
        <Form>
          <Space direction="vertical" class="w-90">
            <Form.Item label="Username" name="username">
              <Input />
            </Form.Item>
            <WatchedUsername />
          </Space>
        </Form>
      </DemoBlock>

      <DemoBlock
        title="Dynamic rules"
        code={`function DynamicRuleFields() {
  const requireNickname = Form.useWatch('requireNickname')

  return (
    <>
      <Form.Item name="requireNickname" valuePropName="checked">
        <Checkbox>Nickname is required</Checkbox>
      </Form.Item>
      <Form.Item label="Nickname" name="nickname" rules={[{ required: Boolean(requireNickname()) }]}>
        <Input />
      </Form.Item>
    </>
  )
}

<Form onFinish={console.log}>
  <DynamicRuleFields />
  <Button htmlType="submit">Submit</Button>
</Form>`}
      >
        <Form onFinish={(values) => message.success(JSON.stringify(values))}>
          <Space direction="vertical" class="w-90">
            <DynamicRuleFields />
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Space>
        </Form>
      </DemoBlock>

      <DemoBlock
        title="Dependencies"
        code={`<Form onFinish={console.log}>
  <Form.Item label="Password" name="password" rules={[{ required: true }]}>
    <Input type="password" />
  </Form.Item>
  <Form.Item
    label="Confirm"
    name="confirm"
    dependencies={['password']}
    rules={[{
      validator: (_, value, values) => {
        if (value && value !== values?.password) return 'Passwords do not match'
      },
    }]}
  >
    <Input type="password" />
  </Form.Item>
</Form>`}
      >
        <Form onFinish={() => message.success('Password confirmed')}>
          <Space direction="vertical" class="w-90">
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please input password' }]}
            >
              <Input type="password" placeholder="Password" />
            </Form.Item>
            <Form.Item
              label="Confirm"
              name="confirm"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Please confirm password' },
                {
                  validator: (_, value, values) => {
                    const formValues = values as { password?: unknown } | undefined
                    if (value && value !== formValues?.password) return 'Passwords do not match'
                  },
                },
              ]}
            >
              <Input type="password" placeholder="Confirm password" />
            </Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Space>
        </Form>
      </DemoBlock>

      <DemoBlock
        title="shouldUpdate"
        code={`const [form] = useForm()

<Form form={form} initialValues={{ username: 'Ada' }}>
  <Form.Item label="Username" name="username"><Input /></Form.Item>
  <Form.Item shouldUpdate>
    {() => <pre>{JSON.stringify(form.getFieldsValue(true), null, 2)}</pre>}
  </Form.Item>
</Form>`}
      >
        <Form form={shouldUpdateForm} initialValues={{ username: 'Ada', email: 'ada@example.com' }}>
          <Space direction="vertical" class="w-90">
            <Form.Item label="Username" name="username">
              <Input placeholder="Username" />
            </Form.Item>
            <Form.Item label="Email" name="email">
              <Input placeholder="Email" />
            </Form.Item>
            <Form.Item shouldUpdate>
              {() => (
                <pre class="rounded bg-gray-50 p-3 text-sm">
                  {JSON.stringify(shouldUpdateForm.getFieldsValue(true), null, 2)}
                </pre>
              )}
            </Form.Item>
          </Space>
        </Form>
      </DemoBlock>

      <DemoBlock
        title="noStyle nested control"
        code={`<Form onFinish={console.log}>
  <Form.Item label="Address">
    <Form.Item name={['address', 'street']} noStyle>
      <Input placeholder="Street" />
    </Form.Item>
  </Form.Item>
</Form>`}
      >
        <Form onFinish={(values) => message.success(JSON.stringify(values))}>
          <Space direction="vertical" class="w-90">
            <Form.Item label="Address">
              <Form.Item name={['address', 'street']} noStyle>
                <Input placeholder="Street" />
              </Form.Item>
            </Form.Item>
            <Button htmlType="submit">Submit address</Button>
          </Space>
        </Form>
      </DemoBlock>

      <DemoBlock
        title="Dynamic Form.Item"
        code={`function ConditionalCompanyField() {
  const business = Form.useWatch('business')

  return (
    <>
      <Form.Item name="business" valuePropName="checked">
        <Checkbox>Business account</Checkbox>
      </Form.Item>
      {business() ? (
        <Form.Item label="Company" name="company" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      ) : null}
    </>
  )
}

<Form onFinish={console.log}>
  <ConditionalCompanyField />
  <Button htmlType="submit">Submit</Button>
</Form>`}
      >
        <Form onFinish={(values) => message.success(JSON.stringify(values))}>
          <Space direction="vertical" class="w-90">
            <ConditionalCompanyField />
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Space>
        </Form>
      </DemoBlock>

      <DemoBlock
        title="Dynamic list"
        code={`<Form initialValues={{ users: [{ name: 'Ada' }] }} onFinish={console.log}>
  <Form.List name="users">
    {(fields, operation) => (
      <>
        <For each={fields()}>
          {(field) => (
            <Form.Item label={"User " + (field.name + 1)} name={[field.name, 'name']}>
              <Input />
            </Form.Item>
          )}
        </For>
        <Button onClick={() => operation.add({ name: '' })}>Add user</Button>
        <Button htmlType="submit">Submit list</Button>
      </>
    )}
  </Form.List>
</Form>`}
      >
        <Form
          initialValues={{ users: [{ name: 'Ada' }] }}
          onFinish={(values) => message.success(JSON.stringify(values))}
        >
          <Form.List name="users">
            {(fields, operation) => (
              <Space direction="vertical" class="w-90">
                <For each={fields()}>
                  {(field) => (
                    <Form.Item label={'User ' + (field.name + 1)} name={[field.name, 'name']}>
                      <Input />
                    </Form.Item>
                  )}
                </For>
                <Space>
                  <Button onClick={() => operation.add({ name: '' })}>Add user</Button>
                  <Button htmlType="submit">Submit list</Button>
                </Space>
              </Space>
            )}
          </Form.List>
        </Form>
      </DemoBlock>

      <DemoBlock
        title="Advanced dynamic list"
        code={`<Form.List
  name="passengers"
  initialValue={[{ name: 'Ada' }, { name: 'Grace' }]}
  rules={[{ required: true, message: 'At least one passenger is required' }]}
>
  {(fields, operation, meta) => (
    <>
      <For each={fields()}>
        {(field) => (
          <Space>
            <Form.Item name={[field.name, 'name']} rules={[{ required: true }]}>
              <Input placeholder="Passenger name" />
            </Form.Item>
            <Button onClick={() => operation.move(field.name, field.name - 1)}>Up</Button>
            <Button onClick={() => operation.remove(field.name)}>Remove</Button>
          </Space>
        )}
      </For>
      <Button onClick={() => operation.add({ name: '' })}>Add passenger</Button>
      <Form.ErrorList errors={meta.errors} />
    </>
  )}
</Form.List>`}
      >
        <Form onFinish={(values) => message.success(JSON.stringify(values))}>
          <Form.List
            name="passengers"
            initialValue={[{ name: 'Ada' }, { name: 'Grace' }]}
            rules={[{ required: true, message: 'At least one passenger is required' }]}
          >
            {(fields, operation, meta) => (
              <Space direction="vertical" class="w-100">
                <For each={fields()}>
                  {(field) => (
                    <Space>
                      <Form.Item
                        label={'Passenger ' + (field.name + 1)}
                        name={[field.name, 'name']}
                        rules={[{ required: true, message: 'Passenger name is required' }]}
                      >
                        <Input placeholder="Passenger name" />
                      </Form.Item>
                      <Button
                        disabled={field.name === 0}
                        onClick={() => operation.move(field.name, field.name - 1)}
                      >
                        Up
                      </Button>
                      <Button onClick={() => operation.move(field.name, field.name + 1)}>
                        Down
                      </Button>
                      <Button danger onClick={() => operation.remove(field.name)}>
                        Remove
                      </Button>
                    </Space>
                  )}
                </For>
                <Space>
                  <Button onClick={() => operation.add({ name: '' })}>Add passenger</Button>
                  <Button onClick={() => operation.add({ name: 'Inserted' }, 0)}>Add to top</Button>
                  <Button type="primary" htmlType="submit">
                    Submit passengers
                  </Button>
                </Space>
                <Form.ErrorList errors={meta.errors} />
              </Space>
            )}
          </Form.List>
        </Form>
      </DemoBlock>

      <DemoBlock
        title="Scroll to field"
        code={`const [form] = useForm()

<Form form={form}>
  <Form.Item label="Target" name="target" rules={[{ required: true }]}>
    <Input />
  </Form.Item>
</Form>
<Button onClick={() => form.scrollToField?.('target', { focus: true })}>
  Scroll to target
</Button>`}
      >
        <Space direction="vertical" class="w-90">
          <Form form={scrollForm}>
            <Space direction="vertical" class="w-90">
              <Form.Item label="Before" name="before">
                <Input placeholder="Another field" />
              </Form.Item>
              <div style={{ height: '120px' }} />
              <Form.Item
                label="Target"
                name="target"
                rules={[{ required: true, message: 'Target is required' }]}
              >
                <Input placeholder="Scroll target" />
              </Form.Item>
            </Space>
          </Form>
          <Button onClick={() => scrollForm.scrollToField?.('target', { focus: true })}>
            Scroll to target
          </Button>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="getValueProps and normalize"
        code={`<Form initialValues={{ code: 'SOLID' }}>
  <Form.Item
    label="Code"
    name="code"
    normalize={(value) => String(value).trim().toUpperCase()}
    getValueProps={(value) => ({ value: String(value ?? '').toLowerCase() })}
  >
    {(control) => (
      <input
        value={String(control.valueProps().value ?? '')}
        onInput={(event) => control.onChange(event)}
      />
    )}
  </Form.Item>
</Form>`}
      >
        <Form
          initialValues={{ code: 'SOLID' }}
          onFinish={(values) => message.success(JSON.stringify(values))}
        >
          <Space direction="vertical" class="w-90">
            <Form.Item
              label="Code"
              name="code"
              normalize={(value) => String(value).trim().toUpperCase()}
              getValueProps={(value) => ({ value: String(value ?? '').toLowerCase() })}
              extra="Stored value is trimmed and uppercased; the input displays it in lowercase."
            >
              {(control) => (
                <input
                  class="ant-input"
                  value={String(control.valueProps().value ?? '')}
                  placeholder="Type with spaces or mixed case"
                  onInput={(event) => control.onChange(event)}
                />
              )}
            </Form.Item>
            <Button htmlType="submit">Submit normalized value</Button>
          </Space>
        </Form>
      </DemoBlock>

      <DemoBlock
        title="Form.Item.useStatus"
        code={`function StatusInput() {
  const status = Form.Item.useStatus()
  return <Input placeholder={\`Status: \${status.status() ?? 'none'}\`} />
}

<Form>
  <Form.Item label="Username" name="username" rules={[{ required: true }]}>
    <StatusInput />
  </Form.Item>
</Form>`}
      >
        <Form>
          <Space direction="vertical" class="w-90">
            <Form.Item
              label="Username"
              name="statusUsername"
              rules={[{ required: true, message: 'Username is required' }]}
            >
              <StatusInput />
            </Form.Item>
            <Button htmlType="submit">Check status</Button>
          </Space>
        </Form>
      </DemoBlock>

      <h2>API</h2>
      <h3>Form</h3>
      <ApiTable rows={formRows} aria-label="Form API" />
      <h3>Form.Item</h3>
      <ApiTable rows={formItemRows} aria-label="Form Item API" />
      <h3>Form.List</h3>
      <ApiTable rows={formListRows} aria-label="Form List API" />
      <h3>FormInstance</h3>
      <ApiTable rows={formInstanceRows} aria-label="Form Instance API" />
      <h3>Rule</h3>
      <ApiTable rows={ruleRows} aria-label="Form Rule API" />
    </>
  )
}
