import dayjs, { type Dayjs } from 'dayjs'
import { createSignal } from 'solid-js'
import { DatePicker, Space } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const datePickerRows: ApiTableRow[] = [
  {
    property: 'value',
    description: 'Controlled selected value. DatePicker values use dayjs objects.',
    type: 'Dayjs | null; Dayjs[] when multiple',
  },
  {
    property: 'defaultValue',
    description: 'Initial selected value for uncontrolled usage. Values use dayjs objects.',
    type: 'Dayjs | null; Dayjs[] when multiple',
  },
  {
    property: 'format',
    description: 'Display and emitted date string format. Formatting is applied to dayjs values.',
    type: "string | string[] | ((value: Dayjs) => string) | { format: string; type?: 'mask' }",
    defaultValue: "'YYYY-MM-DD'",
  },
  {
    property: 'picker',
    description: 'Panel granularity for the dayjs value selection.',
    type: "'date' | 'week' | 'month' | 'quarter' | 'year' | 'time'",
    defaultValue: "'date'",
  },
  {
    property: 'multiple',
    description: 'Allows selecting multiple dayjs values in one DatePicker.',
    type: 'boolean',
    defaultValue: 'false',
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
    property: 'pickerValue',
    description: 'Controlled panel date. The panel value uses dayjs.',
    type: 'Dayjs',
  },
  {
    property: 'defaultPickerValue',
    description: 'Initial panel date for uncontrolled usage. The panel value uses dayjs.',
    type: 'Dayjs',
  },
  {
    property: 'disabledDate',
    description: 'Disables dayjs date cells.',
    type: '(current: Dayjs, info: { type: PickerType }) => boolean',
  },
  {
    property: 'disabledTime',
    description: 'Disables time options for a selected dayjs value.',
    type: '(date: Dayjs | null) => DisabledTimeConfig',
  },
  {
    property: 'showTime',
    description: 'Adds a time panel and keeps the value as a dayjs object.',
    type: 'boolean | ShowTimeOptions',
    defaultValue: 'false',
  },
  {
    property: 'presets',
    description: 'Quick selections. Preset values are dayjs objects or callbacks returning dayjs.',
    type: 'Array<{ label: JSX.Element; value: Dayjs | (() => Dayjs) }>',
  },
  {
    property: 'cellRender',
    description: 'Custom cell rendering for dayjs panel values.',
    type: '(current: Dayjs, info: CellRenderInfo) => JSX.Element',
  },
  {
    property: 'dateRender',
    description: 'Legacy custom date cell rendering for dayjs values.',
    type: '(current: Dayjs, today: Dayjs) => JSX.Element',
  },
  {
    property: 'renderExtraFooter',
    description: 'Renders extra content in the popup footer.',
    type: '(mode: PickerMode) => JSX.Element',
  },
  {
    property: 'panelRender',
    description: 'Wraps or replaces the generated picker panel.',
    type: '(panel: JSX.Element) => JSX.Element',
  },
  {
    property: 'onChange',
    description: 'Called when selection changes. The value argument uses dayjs.',
    type: '(value: Dayjs | null, dateString: string) => void; multiple: (value: Dayjs[], dateString: string[]) => void',
  },
  {
    property: 'onOpenChange',
    description: 'Called when popup open state changes.',
    type: '(open: boolean) => void',
  },
  {
    property: 'onOk',
    description: 'Called when an OK-confirmed dayjs value is accepted.',
    type: '(value?: Dayjs | null | Dayjs[]) => void',
  },
  { property: 'prefixCls', description: 'Custom CSS class prefix.', type: 'string' },
  { property: 'zIndex', description: 'Custom popup z-index.', type: 'number' },
  {
    property: 'getPopupContainer',
    description: 'Returns popup portal container.',
    type: '(triggerNode?: HTMLElement) => HTMLElement',
  },
]

const rangePickerRows: ApiTableRow[] = [
  {
    property: 'value',
    description: 'Controlled range value. RangePicker values use dayjs objects.',
    type: '[Dayjs | null, Dayjs | null] | null',
  },
  {
    property: 'defaultValue',
    description: 'Initial range value for uncontrolled usage. Values use dayjs objects.',
    type: '[Dayjs | null, Dayjs | null] | null',
  },
  {
    property: 'placeholder',
    description: 'Placeholder text for the start and end inputs.',
    type: '[string, string]',
    defaultValue: "['Start date', 'End date']",
  },
  {
    property: 'disabled',
    description: 'Disables both inputs or an individual range side.',
    type: 'boolean | [boolean, boolean]',
    defaultValue: 'false',
  },
  {
    property: 'allowEmpty',
    description: 'Allows clearing the start or end dayjs value independently.',
    type: '[boolean, boolean]',
  },
  {
    property: 'showTime',
    description: 'Adds a time panel and keeps range values as dayjs objects.',
    type: 'boolean | RangeShowTimeOptions',
    defaultValue: 'false',
  },
  {
    property: 'presets',
    description: 'Quick range selections. Preset endpoints are dayjs objects, null, or callbacks.',
    type: 'Array<{ label: JSX.Element; value: [Dayjs | (() => Dayjs) | null, Dayjs | (() => Dayjs) | null] | (() => tuple) }>',
  },
  {
    property: 'onChange',
    description: 'Called when the selected range changes. The dates argument uses dayjs values.',
    type: '(dates: [Dayjs | null, Dayjs | null] | null, dateStrings: [string, string]) => void',
  },
  {
    property: 'onCalendarChange',
    description: 'Called while selecting range endpoints. The dates argument uses dayjs values.',
    type: "(dates, dateStrings, info: { range: 'start' | 'end' }) => void",
  },
]

export default function DatePickerPage() {
  const [value, setValue] = createSignal<Dayjs | null>(dayjs('2026-06-15'))
  const [open, setOpen] = createSignal(false)
  const [multipleValue, setMultipleValue] = createSignal<Dayjs[]>([
    dayjs('2026-06-10'),
    dayjs('2026-06-15'),
  ])
  const selectedLabel = () => value()?.format('YYYY-MM-DD') ?? 'none'
  const multipleLabel = () =>
    multipleValue()
      .map((date) => date.format('YYYY-MM-DD'))
      .join(', ') || 'none'

  return (
    <>
      <h1>DatePicker</h1>
      <p>
        Select dates, date ranges, and date-time values. Like antd, DatePicker values are{' '}
        <code>dayjs</code> objects rather than strings.
      </p>

      <DemoBlock
        title="Basic dayjs value"
        code={`<DatePicker defaultValue={dayjs('2026-06-15')} />`}
      >
        <DatePicker defaultValue={dayjs('2026-06-15')} />
      </DemoBlock>

      <DemoBlock
        title="Controlled open and value"
        code={`const [value, setValue] = createSignal<Dayjs | null>(dayjs('2026-06-15'))
const [open, setOpen] = createSignal(false)

<Space direction="vertical">
  <DatePicker value={value()} open={open()} onChange={setValue} onOpenChange={setOpen} />
  <span>Selected date: {value()?.format('YYYY-MM-DD') ?? 'none'}</span>
</Space>`}
      >
        <Space direction="vertical">
          <DatePicker value={value()} open={open()} onChange={setValue} onOpenChange={setOpen} />
          <span>Selected date: {selectedLabel()}</span>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Picker variants"
        code={`<Space wrap>
  <DatePicker picker="week" defaultValue={dayjs('2026-06-15')} />
  <DatePicker picker="month" defaultValue={dayjs('2026-06-01')} />
  <DatePicker picker="quarter" defaultValue={dayjs('2026-04-01')} />
  <DatePicker picker="year" defaultValue={dayjs('2026-01-01')} />
</Space>`}
      >
        <Space wrap>
          <DatePicker picker="week" defaultValue={dayjs('2026-06-15')} />
          <DatePicker picker="month" defaultValue={dayjs('2026-06-01')} />
          <DatePicker picker="quarter" defaultValue={dayjs('2026-04-01')} />
          <DatePicker picker="year" defaultValue={dayjs('2026-01-01')} />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="RangePicker"
        code={`<DatePicker.RangePicker defaultValue={[dayjs('2026-06-01'), dayjs('2026-06-15')]} />`}
      >
        <DatePicker.RangePicker defaultValue={[dayjs('2026-06-01'), dayjs('2026-06-15')]} />
      </DemoBlock>

      <DemoBlock
        title="Disabled date and time"
        code={`<DatePicker
  showTime
  disabledDate={(date) => date.isBefore(dayjs('2026-06-01'), 'day') || date.day() === 0}
  disabledTime={() => ({
    disabledHours: () => [0, 1, 2, 3, 4, 5, 22, 23],
    disabledMinutes: (hour) => (hour === 12 ? [0, 15, 30, 45] : []),
  })}
/>`}
      >
        <DatePicker
          showTime
          disabledDate={(date) => date.isBefore(dayjs('2026-06-01'), 'day') || date.day() === 0}
          disabledTime={() => ({
            disabledHours: () => [0, 1, 2, 3, 4, 5, 22, 23],
            disabledMinutes: (hour) => (hour === 12 ? [0, 15, 30, 45] : []),
          })}
        />
      </DemoBlock>

      <DemoBlock
        title="Show time"
        code={`<Space wrap>
  <DatePicker showTime defaultValue={dayjs('2026-06-15 09:30:00')} />
  <DatePicker.RangePicker showTime defaultValue={[dayjs('2026-06-01 09:00:00'), dayjs('2026-06-15 18:00:00')]} />
</Space>`}
      >
        <Space wrap>
          <DatePicker showTime defaultValue={dayjs('2026-06-15 09:30:00')} />
          <DatePicker.RangePicker
            showTime
            defaultValue={[dayjs('2026-06-01 09:00:00'), dayjs('2026-06-15 18:00:00')]}
          />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Multiple"
        code={`const [multipleValue, setMultipleValue] = createSignal<Dayjs[]>([
  dayjs('2026-06-10'),
  dayjs('2026-06-15'),
])

<Space direction="vertical">
  <DatePicker multiple value={multipleValue()} onChange={setMultipleValue} />
  <span>Selected dates: {multipleValue().map((date) => date.format('YYYY-MM-DD')).join(', ') || 'none'}</span>
</Space>`}
      >
        <Space direction="vertical">
          <DatePicker multiple value={multipleValue()} onChange={setMultipleValue} />
          <span>Selected dates: {multipleLabel()}</span>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Presets"
        code={`<Space direction="vertical">
  <DatePicker
    presets={[
      { label: 'Today', value: () => dayjs() },
      { label: 'Next week', value: () => dayjs().add(7, 'day') },
    ]}
  />
  <DatePicker.RangePicker
    presets={[
      { label: 'This month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
      { label: 'Next 7 days', value: () => [dayjs(), dayjs().add(7, 'day')] },
    ]}
  />
</Space>`}
      >
        <Space direction="vertical">
          <DatePicker
            presets={[
              { label: 'Today', value: () => dayjs() },
              { label: 'Next week', value: () => dayjs().add(7, 'day') },
            ]}
          />
          <DatePicker.RangePicker
            presets={[
              { label: 'This month', value: [dayjs().startOf('month'), dayjs().endOf('month')] },
              { label: 'Next 7 days', value: () => [dayjs(), dayjs().add(7, 'day')] },
            ]}
          />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Custom rendering"
        code={`<DatePicker
  defaultOpen
  defaultPickerValue={dayjs('2026-06-01')}
  cellRender={(current, info) => (
    <div class={current.date() === 15 ? 'rounded bg-blue-50 text-blue-600' : undefined}>
      {info.originNode}
    </div>
  )}
  renderExtraFooter={() => <span>Custom footer</span>}
  panelRender={(panel) => <section aria-label="custom date panel">{panel}</section>}
/>`}
      >
        <DatePicker
          defaultOpen
          defaultPickerValue={dayjs('2026-06-01')}
          cellRender={(current, info) => (
            <div class={current.date() === 15 ? 'rounded bg-blue-50 text-blue-600' : undefined}>
              {info.originNode}
            </div>
          )}
          renderExtraFooter={() => <span>Custom footer</span>}
          panelRender={(panel) => <section aria-label="custom date panel">{panel}</section>}
        />
      </DemoBlock>

      <h2>API</h2>
      <p>
        DatePicker and RangePicker values use <code>dayjs</code>. The <code>dateString</code>{' '}
        callback argument is only the formatted string representation of those dayjs values.
      </p>
      <ApiTable rows={datePickerRows} aria-label="DatePicker API" />

      <h2>RangePicker API</h2>
      <ApiTable rows={rangePickerRows} aria-label="RangePicker API" />
    </>
  )
}
