import { createSignal } from 'solid-js'
import { Space, TimePicker } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

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
      <ul>
        <li>
          Use <code>format="HH:mm"</code> to hide seconds and emit <code>HH:mm</code> values.
        </li>
        <li>
          <code>minuteStep</code> and <code>secondStep</code> control selectable increments.
        </li>
        <li>
          <code>disabledHours</code>, <code>disabledMinutes</code>, and <code>disabledSeconds</code>{' '}
          disable individual cells.
        </li>
      </ul>
    </>
  )
}
