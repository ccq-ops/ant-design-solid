import { createSignal } from 'solid-js'
import { DatePicker, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

export default function DatePickerPage() {
  const [value, setValue] = createSignal<Date | string | undefined>('2026-06-15')
  const [open, setOpen] = createSignal(false)
  const selectedLabel = () => {
    const selected = value()
    return selected instanceof Date ? selected.toDateString() : (selected ?? 'none')
  }

  return (
    <>
      <h1>DatePicker</h1>
      <p>Select a date from a one-month calendar popup.</p>

      <DemoBlock title="Basic" code={`<DatePicker />`}>
        <DatePicker />
      </DemoBlock>

      <DemoBlock
        title="Controlled"
        code={`const [value, setValue] = createSignal<Date | string | undefined>('2026-06-15')
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
        code={`<DatePicker disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6} />`}
      >
        <DatePicker disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6} />
      </DemoBlock>

      <DemoBlock title="Clearable" code={`<DatePicker allowClear defaultValue="2026-06-15" />`}>
        <DatePicker allowClear defaultValue="2026-06-15" />
      </DemoBlock>

      <DemoBlock title="Disabled" code={`<DatePicker disabled defaultValue="2026-06-15" />`}>
        <DatePicker disabled defaultValue="2026-06-15" />
      </DemoBlock>

      <h2>API</h2>
      <ul>
        <li>
          Use <code>value</code> and <code>onChange</code> for controlled date selection.
        </li>
        <li>
          <code>format</code> supports common <code>YYYY</code>, <code>MM</code>, and{' '}
          <code>DD</code> tokens for display and emitted strings.
        </li>
        <li>
          <code>disabledDate</code> receives each local date and prevents selection when it returns{' '}
          <code>true</code>.
        </li>
      </ul>
    </>
  )
}
