import { createSignal } from 'solid-js'
import { Form, InputNumber, Space } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const inputNumberRows: ApiTableRow[] = [
  { property: 'value', description: 'Controlled numeric value.', type: 'number' },
  {
    property: 'defaultValue',
    description: 'Initial numeric value for uncontrolled usage.',
    type: 'number',
  },
  { property: 'min', description: 'Minimum allowed value.', type: 'number' },
  { property: 'max', description: 'Maximum allowed value.', type: 'number' },
  {
    property: 'step',
    description: 'Increment used by controls and keyboard stepping.',
    type: 'number',
    defaultValue: '1',
  },
  { property: 'precision', description: 'Number of decimal places to keep.', type: 'number' },
  { property: 'placeholder', description: 'Input placeholder text.', type: 'string' },
  {
    property: 'disabled',
    description: 'Disables input and controls.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'size',
    description: 'Input size from the theme component size scale.',
    type: 'ComponentSize',
  },
  { property: 'status', description: 'Validation visual status.', type: "'error' | 'warning'" },
  {
    property: 'controls',
    description: 'Shows increment and decrement controls.',
    type: 'boolean',
    defaultValue: 'true',
  },
  {
    property: 'formatter',
    description: 'Formats the value for display.',
    type: '(value: number | undefined) => string',
  },
  {
    property: 'parser',
    description: 'Parses displayed text back into a numeric value.',
    type: '(displayValue: string) => number | undefined',
  },
  {
    property: 'onChange',
    description: 'Called with the normalized numeric value.',
    type: '(value: number | undefined) => void',
  },
]

export default function InputNumberPage() {
  const [value, setValue] = createSignal<number | undefined>(3)

  return (
    <>
      <h1>InputNumber</h1>
      <p>Enter numeric values with optional controls, bounds, precision, and formatting.</p>
      <p>Its onChange callback receives the normalized numeric value, not a DOM change event.</p>

      <DemoBlock title="Basic" code={`<InputNumber defaultValue={3} />`}>
        <InputNumber defaultValue={3} />
      </DemoBlock>

      <DemoBlock
        title="Min, max, and step"
        code={`<InputNumber min={0} max={10} step={0.5} defaultValue={2} />`}
      >
        <InputNumber min={0} max={10} step={0.5} defaultValue={2} />
      </DemoBlock>

      <DemoBlock
        title="Controlled"
        code={`const [value, setValue] = createSignal<number | undefined>(3)\n<InputNumber value={value()} onChange={setValue} />`}
      >
        <Space>
          <InputNumber value={value()} onChange={setValue} />
          <span>Value: {value() ?? 'empty'}</span>
        </Space>
      </DemoBlock>

      <DemoBlock title="Precision" code={`<InputNumber precision={2} defaultValue={1.236} />`}>
        <InputNumber precision={2} defaultValue={1.236} />
      </DemoBlock>

      <DemoBlock
        title="Formatter and parser"
        code={`<InputNumber formatter={(value) => value === undefined ? '' : \`$ ${value}\`} parser={(display) => Number(display.replace(/[$,\\s]/g, ''))} />`}
      >
        <InputNumber
          defaultValue={1000}
          formatter={(nextValue) => (nextValue === undefined ? '' : `$ ${nextValue}`)}
          parser={(displayValue) => {
            const parsed = Number(displayValue.replace(/[$,\s]/g, ''))
            return Number.isNaN(parsed) ? undefined : parsed
          }}
        />
      </DemoBlock>

      <DemoBlock
        title="Sizes and statuses"
        code={`<InputNumber size="small" defaultValue={1} />
<InputNumber status="warning" defaultValue={2} />
<InputNumber size="large" status="error" defaultValue={3} />`}
      >
        <Space>
          <InputNumber size="small" defaultValue={1} />
          <InputNumber defaultValue={2} status="warning" />
          <InputNumber size="large" defaultValue={3} status="error" />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Disabled and no controls"
        code={`<InputNumber defaultValue={4} disabled />
<InputNumber defaultValue={5} controls={false} />`}
      >
        <Space>
          <InputNumber defaultValue={4} disabled />
          <InputNumber defaultValue={5} controls={false} />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Form usage"
        code={`<Form><Form.Item name="amount" label="Amount"><InputNumber min={0} /></Form.Item></Form>`}
      >
        <Form onFinish={(values) => console.log(values)}>
          <Form.Item name="amount" label="Amount">
            <InputNumber min={0} />
          </Form.Item>
          <button type="submit">Submit</button>
        </Form>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable rows={inputNumberRows} aria-label="InputNumber API" />
    </>
  )
}
