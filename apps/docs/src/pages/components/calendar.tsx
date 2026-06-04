import { createSignal } from 'solid-js'
import { Calendar, Space } from '@ant-design-solid/core'
import type { CalendarMode } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export default function CalendarPage() {
  const [value, setValue] = createSignal<Date | string | undefined>('2026-06-15')
  const [mode, setMode] = createSignal<CalendarMode>('month')
  const selectedLabel = () => {
    const selected = value()
    return selected instanceof Date ? selected.toDateString() : (selected ?? 'none')
  }

  return (
    <>
      <h1>Calendar</h1>
      <p>Display dates in a month or year panel with selectable and customizable cells.</p>

      <DemoBlock title="Basic" code={`<Calendar />`}>
        <Calendar />
      </DemoBlock>

      <DemoBlock title="Card" code={`<Calendar fullscreen={false} defaultValue="2026-06-15" />`}>
        <Calendar fullscreen={false} defaultValue="2026-06-15" />
      </DemoBlock>

      <DemoBlock
        title="Custom date content"
        code={`<Calendar
  defaultValue="2026-06-15"
  dateCellRender={(date) => date.getDate() === 15 ? <span>Release</span> : null}
/>`}
      >
        <Calendar
          defaultValue="2026-06-15"
          dateCellRender={(date) => (date.getDate() === 15 ? <span>Release</span> : null)}
        />
      </DemoBlock>

      <DemoBlock
        title="Controlled"
        code={`const [value, setValue] = createSignal<Date | string | undefined>('2026-06-15')
const [mode, setMode] = createSignal<CalendarMode>('month')
<Calendar value={value()} mode={mode()} onChange={setValue} onPanelChange={(_, nextMode) => setMode(nextMode)} />`}
      >
        <Space direction="vertical">
          <Calendar
            value={value()}
            mode={mode()}
            onChange={setValue}
            onPanelChange={(_, nextMode) => setMode(nextMode)}
          />
          <span>Selected date: {selectedLabel()}</span>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Disabled dates"
        code={`<Calendar disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6} />`}
      >
        <Calendar disabledDate={(date) => date.getDay() === 0 || date.getDay() === 6} />
      </DemoBlock>

      <DemoBlock
        title="Custom header"
        code={`<Calendar
  defaultValue="2026-06-15"
  headerRender={({ value, onChange, onModeChange }) => (
    <Space>
      <button type="button" onClick={() => onChange(new Date(value.getFullYear(), value.getMonth() - 1, 1))}>Previous</button>
      <button type="button" onClick={() => onModeChange('year')}>Year view</button>
    </Space>
  )}
/>`}
      >
        <Calendar
          fullscreen={false}
          defaultValue="2026-06-15"
          headerRender={({ value, onChange, onModeChange }) => (
            <Space>
              <button
                type="button"
                onClick={() => onChange(new Date(value.getFullYear(), value.getMonth() - 1, 1))}
              >
                Previous
              </button>
              <button type="button" onClick={() => onModeChange('year')}>
                Year view
              </button>
            </Space>
          )}
          dateCellRender={(date) =>
            sameDay(date, new Date(2026, 5, 15)) ? <span>Selected</span> : null
          }
        />
      </DemoBlock>

      <h2>API</h2>
      <ul>
        <li>
          Use <code>value</code> and <code>onChange</code> for controlled date selection.
        </li>
        <li>
          Use <code>mode</code> and <code>onPanelChange</code> for controlled month/year panels.
        </li>
        <li>
          Use <code>dateCellRender</code> or <code>dateFullCellRender</code> to customize date
          cells.
        </li>
        <li>
          Use <code>monthCellRender</code> or <code>monthFullCellRender</code> to customize year
          panel month cells.
        </li>
      </ul>
    </>
  )
}
