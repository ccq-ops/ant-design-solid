import { createSignal } from 'solid-js'
import { Space, TimePicker } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const timePickerRows: ApiTableRow[] = [
  { property: 'value', description: 'Controlled time value.', type: 'string' },
  {
    property: 'defaultValue',
    description: 'Initial time value for uncontrolled usage.',
    type: 'string',
  },
  {
    property: 'format',
    description: 'Time display and emitted value format.',
    type: "'HH:mm:ss' | 'HH:mm'",
    defaultValue: "'HH:mm:ss'",
  },
  {
    property: 'placeholder',
    description: 'Placeholder text when no time is selected.',
    type: 'string',
    defaultValue: "'Select time'",
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
    type: 'boolean',
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
    property: 'minuteStep',
    description: 'Minute option interval.',
    type: 'number',
    defaultValue: '1',
  },
  {
    property: 'secondStep',
    description: 'Second option interval.',
    type: 'number',
    defaultValue: '1',
  },
  {
    property: 'disabledHours',
    description: 'Returns disabled hour values.',
    type: '() => number[]',
  },
  {
    property: 'disabledMinutes',
    description: 'Returns disabled minute values for selected hour.',
    type: '(selectedHour: number | undefined) => number[]',
  },
  {
    property: 'disabledSeconds',
    description: 'Returns disabled second values for selected hour and minute.',
    type: '(selectedHour: number | undefined, selectedMinute: number | undefined) => number[]',
  },
  {
    property: 'onChange',
    description: 'Called when selection changes.',
    type: '(value: string | undefined) => void',
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

export default function TimePickerPage() {
  const [value, setValue] = createSignal<string | undefined>('09:30:00')
  const [open, setOpen] = createSignal(false)

  return (
    <>
      <h1>TimePicker</h1>
      <p>Select a time from hour, minute, and second columns.</p>

      <DemoBlock title="Basic" code={`<TimePicker />`}>
        <TimePicker />
      </DemoBlock>

      <DemoBlock title="HH:mm" code={`<TimePicker format="HH:mm" minuteStep={15} />`}>
        <TimePicker format="HH:mm" minuteStep={15} />
      </DemoBlock>

      <DemoBlock
        title="Controlled"
        code={`const [value, setValue] = createSignal('09:30:00')
const [open, setOpen] = createSignal(false)
<TimePicker value={value()} open={open()} onChange={setValue} onOpenChange={setOpen} />`}
      >
        <Space direction="vertical">
          <TimePicker value={value()} open={open()} onChange={setValue} onOpenChange={setOpen} />
          <span>Selected time: {value() ?? 'none'}</span>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Disabled time"
        code={`<TimePicker disabledHours={() => [0, 1, 2, 3, 4, 5, 6]} disabledMinutes={(hour) => (hour === 12 ? [0, 15, 30, 45] : [])} />`}
      >
        <TimePicker
          disabledHours={() => [0, 1, 2, 3, 4, 5, 6]}
          disabledMinutes={(hour) => (hour === 12 ? [0, 15, 30, 45] : [])}
        />
      </DemoBlock>

      <DemoBlock title="Clearable" code={`<TimePicker allowClear defaultValue="12:00:00" />`}>
        <TimePicker allowClear defaultValue="12:00:00" />
      </DemoBlock>

      <DemoBlock title="Disabled" code={`<TimePicker disabled defaultValue="08:30:00" />`}>
        <TimePicker disabled defaultValue="08:30:00" />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable rows={timePickerRows} aria-label="TimePicker API" />
    </>
  )
}
