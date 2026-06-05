import { createSignal } from 'solid-js'
import { Checkbox, Form, Space } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const checkboxOptions = [
  { label: 'Apple', value: 'apple' },
  { label: 'Orange', value: 'orange' },
  { label: 'Pear', value: 'pear', disabled: true },
]

const checkboxRows: ApiTableRow[] = [
  { property: 'checked', description: 'Controlled checked state.', type: 'boolean' },
  {
    property: 'defaultChecked',
    description: 'Initial checked state for uncontrolled usage.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'disabled',
    description: 'Disables the checkbox.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'indeterminate',
    description: 'Displays the mixed selection state.',
    type: 'boolean',
    defaultValue: 'false',
  },
  { property: 'prefixCls', description: 'Custom CSS class prefix.', type: 'string' },
  { property: 'children', description: 'Checkbox label content.', type: 'JSX.Element' },
  {
    property: 'onChange',
    description: 'Called when the native checkbox change event fires.',
    type: 'JSX.EventHandler<HTMLInputElement, Event>',
  },
]

const checkboxGroupRows: ApiTableRow[] = [
  { property: 'value', description: 'Controlled checked values.', type: '(string | number | boolean)[]' },
  {
    property: 'defaultValue',
    description: 'Initial checked values for uncontrolled usage.',
    type: '(string | number | boolean)[]',
  },
  { property: 'options', description: 'Options rendered as checkboxes.', type: 'OptionInput[]' },
  {
    property: 'disabled',
    description: 'Disables all checkboxes in the group.',
    type: 'boolean',
    defaultValue: 'false',
  },
  { property: 'prefixCls', description: 'Custom checkbox CSS class prefix.', type: 'string' },
  { property: 'children', description: 'Additional custom checkbox content.', type: 'JSX.Element' },
  {
    property: 'onChange',
    description: 'Called with the next checked value array.',
    type: '(checkedValue: OptionValue[]) => void',
  },
]

export default function CheckboxPage() {
  const [checked, setChecked] = createSignal(true)
  const [fruits, setFruits] = createSignal<(string | number | boolean)[]>(['apple'])

  return (
    <>
      <h1>Checkbox</h1>
      <p>Checkbox lets users select one or more independent options.</p>

      <DemoBlock title="Basic" code={`<Checkbox defaultChecked>Agree</Checkbox>`}>
        <Space>
          <Checkbox defaultChecked>Agree</Checkbox>
          <Checkbox>Remember me</Checkbox>
          <Checkbox indeterminate>Partially selected</Checkbox>
        </Space>
      </DemoBlock>

      <DemoBlock title="Disabled" code={`<Checkbox disabled>Disabled</Checkbox>`}>
        <Space>
          <Checkbox disabled>Disabled</Checkbox>
          <Checkbox disabled defaultChecked>
            Checked disabled
          </Checkbox>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Controlled"
        code={`const [checked, setChecked] = createSignal(true)
<Checkbox checked={checked()} onChange={(event) => setChecked(event.currentTarget.checked)}>Controlled</Checkbox>`}
      >
        <Space>
          <Checkbox checked={checked()} onChange={(event) => setChecked(event.currentTarget.checked)}>
            Controlled
          </Checkbox>
          <span>{checked() ? 'Checked' : 'Unchecked'}</span>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Group"
        code={`<Checkbox.Group options={options} defaultValue={['apple']} />`}
      >
        <Space direction="vertical">
          <Checkbox.Group options={checkboxOptions} defaultValue={['apple']} />
          <Checkbox.Group
            options={checkboxOptions}
            value={fruits()}
            onChange={(next) => setFruits(next)}
          />
          <span>Selected: {fruits().join(', ') || 'none'}</span>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="In Form"
        code={`<Form.Item name="agree" valuePropName="checked">
  <Checkbox>Agree</Checkbox>
</Form.Item>`}
      >
        <Form initialValues={{ agree: true, fruits: ['orange'] }}>
          <Space direction="vertical">
            <Form.Item name="agree" valuePropName="checked">
              <Checkbox>Agree to terms</Checkbox>
            </Form.Item>
            <Form.Item name="fruits">
              <Checkbox.Group options={checkboxOptions} />
            </Form.Item>
          </Space>
        </Form>
      </DemoBlock>

      <h2>API</h2>
      <h3>Checkbox</h3>
      <ApiTable rows={checkboxRows} aria-label="Checkbox API" />
      <h3>Checkbox.Group</h3>
      <ApiTable rows={checkboxGroupRows} aria-label="Checkbox Group API" />
    </>
  )
}
