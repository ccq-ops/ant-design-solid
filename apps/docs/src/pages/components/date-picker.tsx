import dayjs, { type Dayjs } from 'dayjs'
import { createSignal } from 'solid-js'
import { DatePicker, Space } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const datePickerRows: ApiTableRow[] = [
  { property: 'value', description: 'Controlled selected date.', type: 'Dayjs | null' },
  {
    property: 'defaultValue',
    description: 'Initial selected date for uncontrolled usage.',
    type: 'Dayjs | null',
  },
  {
    property: 'format',
    description: 'Display and emitted date string format.',
    type: "string | string[] | ((value: Dayjs) => string) | { format: string; type?: 'mask' }",
    defaultValue: "'YYYY-MM-DD'",
  },
  {
    property: 'placeholder',
    description: 'Placeholder text when no date is selected.',
    type: 'string',
    defaultValue: "'Select date'",
  },
  {
    property: 'disabled',
    description: 'Disables the picker.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'allowClear',
    description: 'Shows a clear button when a value is selected.',
    type: 'boolean | { clearIcon?: JSX.Element }',
    defaultValue: 'false',
  },
  { property: 'open', description: 'Controlled popup open state.', type: 'boolean' },
  {
    property: 'defaultOpen',
    description: 'Initial popup open state.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'disabledDate',
    description: 'Disables date cells.',
    type: '(date: Dayjs) => boolean',
  },
  {
    property: 'onChange',
    description: 'Called when selection changes.',
    type: '(value: Dayjs | null, dateString: string) => void',
  },
  {
    property: 'onOpenChange',
    description: 'Called when popup open state changes.',
    type: '(open: boolean) => void',
  },
  { property: 'prefixCls', description: 'Custom CSS class prefix.', type: 'string' },
  { property: 'zIndex', description: 'Custom popup z-index.', type: 'number' },
  {
    property: 'getPopupContainer',
    description: 'Returns popup portal container.',
    type: '(triggerNode?: HTMLElement) => HTMLElement',
  },
]

export default function DatePickerPage() {
  const [value, setValue] = createSignal<Dayjs | null>(dayjs('2026-06-15'))
  const [open, setOpen] = createSignal(false)
  const selectedLabel = () => value()?.format('YYYY-MM-DD') ?? 'none'

  return (
    <>
      <h1>DatePicker</h1>
      <p>Select a date from a one-month calendar popup.</p>

      <DemoBlock title="Basic" code={`<DatePicker />`}>
        <DatePicker />
      </DemoBlock>

      <DemoBlock
        title="Controlled"
        code={`const [value, setValue] = createSignal<Dayjs | null>(dayjs('2026-06-15'))
const [open, setOpen] = createSignal(false)
<DatePicker value={value()} open={open()} onChange={setValue} onOpenChange={setOpen} />`}
      >
        <Space direction="vertical">
          <DatePicker value={value()} open={open()} onChange={setValue} onOpenChange={setOpen} />
          <span>Selected date: {selectedLabel()}</span>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Disabled date"
        code={`<DatePicker disabledDate={(date) => date.day() === 0 || date.day() === 6} />`}
      >
        <DatePicker disabledDate={(date) => date.day() === 0 || date.day() === 6} />
      </DemoBlock>

      <DemoBlock
        title="Clearable"
        code={`<DatePicker allowClear defaultValue={dayjs('2026-06-15')} />`}
      >
        <DatePicker allowClear defaultValue={dayjs('2026-06-15')} />
      </DemoBlock>

      <DemoBlock
        title="Disabled"
        code={`<DatePicker disabled defaultValue={dayjs('2026-06-15')} />`}
      >
        <DatePicker disabled defaultValue={dayjs('2026-06-15')} />
      </DemoBlock>

      <h2>API</h2>
      <p>
        <code>format</code> supports dayjs format strings, arrays, display functions, and mask
        objects for display and emitted strings.
      </p>
      <ApiTable rows={datePickerRows} aria-label="DatePicker API" />
    </>
  )
}
