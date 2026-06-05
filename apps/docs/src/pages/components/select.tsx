import { createSignal } from 'solid-js'
import { Form, Select, Space } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Orange', value: 'orange' },
  { label: 'Pear', value: 'pear' },
]

const disabledOptions = [
  { label: 'Available', value: 'available' },
  { label: 'Disabled', value: 'disabled', disabled: true },
  { label: 'Pending', value: 'pending' },
]

const selectRows: ApiTableRow[] = [
  {
    property: 'value',
    description: 'Controlled selected value.',
    type: 'string | number | boolean',
  },
  {
    property: 'defaultValue',
    description: 'Initial selected value for uncontrolled usage.',
    type: 'string | number | boolean',
  },
  {
    property: 'open',
    description: 'Controlled dropdown open state.',
    type: 'boolean',
  },
  {
    property: 'defaultOpen',
    description: 'Initial dropdown open state.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'options',
    description: 'Select options. Primitive options are normalized to label/value pairs.',
    type: 'OptionInput[]',
  },
  {
    property: 'placeholder',
    description: 'Placeholder displayed when no value is selected.',
    type: 'JSX.Element',
  },
  {
    property: 'disabled',
    description: 'Disables opening and value changes.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'allowClear',
    description: 'Shows a clear button when a value is selected.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'zIndex',
    description: 'Overrides dropdown z-index.',
    type: 'number',
  },
  {
    property: 'getPopupContainer',
    description: 'Returns the element used to mount the dropdown portal.',
    type: '(triggerNode?: HTMLElement) => HTMLElement',
  },
  {
    property: 'onChange',
    description: 'Called when the selected value changes.',
    type: '(value, option) => void',
  },
  {
    property: 'onOpenChange',
    description: 'Called when the dropdown open state changes.',
    type: '(open: boolean) => void',
  },
]

export default function SelectPage() {
  const [value, setValue] = createSignal<string | number | boolean | undefined>('orange')
  const [open, setOpen] = createSignal(false)

  return (
    <>
      <h1>Select</h1>
      <p>Select lets users choose one value from a dropdown list.</p>

      <DemoBlock
        title="Basic"
        code={`<Select placeholder="Select fruit" options={[{ label: 'Apple', value: 'apple' }]} />`}
      >
        <Select class="w-60" placeholder="Select fruit" options={options} />
      </DemoBlock>

      <DemoBlock
        title="Controlled"
        code={`const [value, setValue] = createSignal('orange')
<Select value={value()} onChange={(next) => setValue(next)} options={options} />`}
      >
        <Space direction="vertical">
          <Select
            class="w-60"
            value={value()}
            onChange={(next) => setValue(next)}
            options={options}
          />
          <span>Selected: {String(value() ?? 'none')}</span>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Clearable"
        code={`<Select allowClear defaultValue="apple" options={options} />`}
      >
        <Select class="w-60" allowClear defaultValue="apple" options={options} />
      </DemoBlock>

      <DemoBlock
        title="Disabled options"
        code={`<Select options={[{ label: 'Disabled', value: 'disabled', disabled: true }]} />`}
      >
        <Space direction="vertical" class="w-60">
          <Select placeholder="Pick status" options={disabledOptions} />
          <Select disabled placeholder="Disabled select" options={disabledOptions} />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Open state"
        code={`const [open, setOpen] = createSignal(false)
<Select open={open()} onOpenChange={setOpen} options={options} />`}
      >
        <Space direction="vertical">
          <Select class="w-60" open={open()} onOpenChange={setOpen} options={options} />
          <span>Dropdown is {open() ? 'open' : 'closed'}</span>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="In Form"
        code={`<Form initialValues={{ fruit: 'apple' }}>
  <Form.Item label="Fruit" name="fruit"><Select options={options} /></Form.Item>
</Form>`}
      >
        <Form initialValues={{ fruit: 'apple' }}>
          <Form.Item label="Fruit" name="fruit">
            <Select class="w-60" options={options} />
          </Form.Item>
        </Form>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable rows={selectRows} aria-label="Select API" />
    </>
  )
}
