import { For, Show, createMemo } from 'solid-js'
import type { JSX } from 'solid-js'
import { dayjs, monthStart, samePickerValue } from './date-utils'
import type {
  CellRenderInfo,
  DatePickerLocale,
  DatePickerSemanticSlot,
  PickerType,
} from './interface'
import { semanticClass, semanticStyle } from './semantic'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function monthDates(value: dayjs.Dayjs): Array<dayjs.Dayjs | null> {
  const firstDate = monthStart(value)
  const dates: Array<dayjs.Dayjs | null> = Array.from({ length: firstDate.day() }, () => null)
  for (let day = 1; day <= firstDate.daysInMonth(); day += 1) dates.push(firstDate.date(day))
  return dates
}

function monthWeekRows(value: dayjs.Dayjs): Array<Array<dayjs.Dayjs | null>> {
  const cells = monthDates(value)
  const rows: Array<Array<dayjs.Dayjs | null>> = []
  for (let index = 0; index < cells.length; index += 7) {
    rows.push(cells.slice(index, index + 7))
  }
  return rows
}

export interface DatePanelProps {
  prefixCls: string
  viewDate: dayjs.Dayjs
  picker?: PickerType
  selectedValue?: dayjs.Dayjs | dayjs.Dayjs[] | null
  rangeValue?: [dayjs.Dayjs | null, dayjs.Dayjs | null]
  activeRange?: 'start' | 'end'
  hoverValue?: dayjs.Dayjs | null
  disabledDate?: (current: dayjs.Dayjs, info: { type: PickerType }) => boolean
  showWeek?: boolean
  cellRender?: (current: dayjs.Dayjs, info: CellRenderInfo) => JSX.Element
  dateRender?: (current: dayjs.Dayjs, today: dayjs.Dayjs) => JSX.Element
  locale?: DatePickerLocale
  classNames?: Partial<Record<DatePickerSemanticSlot, string>>
  styles?: Partial<Record<DatePickerSemanticSlot, JSX.CSSProperties>>
  onSelect?: (date: dayjs.Dayjs) => void
  onHover?: (date: dayjs.Dayjs | null) => void
}

export function DatePanel(props: DatePanelProps) {
  const picker = () => props.picker ?? 'date'
  const today = () => dayjs()
  const dates = createMemo(() => monthDates(props.viewDate))
  const weekRows = createMemo(() => monthWeekRows(props.viewDate))

  function renderCellContent(cellDate: dayjs.Dayjs, originNode: JSX.Element): JSX.Element {
    if (props.cellRender) {
      return props.cellRender(cellDate, {
        originNode,
        today: today(),
        range: props.activeRange,
        type: picker(),
        locale: props.locale,
      })
    }
    if (props.dateRender) return props.dateRender(cellDate, today())
    return cellDate.date()
  }

  function firstDateInRow(row: Array<dayjs.Dayjs | null>): dayjs.Dayjs | undefined {
    return row.find((date): date is dayjs.Dayjs => Boolean(date))
  }

  function renderWeekButton(row: Array<dayjs.Dayjs | null>): JSX.Element {
    const firstDate = firstDateInRow(row)
    if (!firstDate)
      return <div class={`${props.prefixCls}-empty-cell ${props.prefixCls}-week-cell`} />
    const weekStart = () => firstDate.startOf('week')
    const weekLabel = () => `${weekStart().format('YYYY')}-week-${weekStart().week()}`
    const weekDisabled = () => Boolean(props.disabledDate?.(weekStart(), { type: 'week' }))
    const weekSelected = () =>
      Array.isArray(props.selectedValue)
        ? props.selectedValue.some((value) => samePickerValue(value, weekStart(), 'week'))
        : samePickerValue(props.selectedValue, weekStart(), 'week')
    return (
      <button
        type="button"
        aria-label={weekLabel()}
        aria-pressed={weekSelected()}
        aria-disabled={weekDisabled()}
        disabled={weekDisabled()}
        class={semanticClass(
          'cell',
          props.classNames,
          `${props.prefixCls}-cell`,
          `${props.prefixCls}-week-cell`,
          weekSelected() && `${props.prefixCls}-cell-selected`,
          weekDisabled() && `${props.prefixCls}-cell-disabled`,
        )}
        style={semanticStyle('cell', props.styles)}
        onClick={() => {
          if (!weekDisabled()) props.onSelect?.(weekStart())
        }}
      >
        {weekStart().week()}
      </button>
    )
  }

  function renderDateCell(date: dayjs.Dayjs | null): JSX.Element {
    if (!date) return <div class={`${props.prefixCls}-empty-cell`} />
    const dateString = () => date.format('YYYY-MM-DD')
    const cellDisabled = () => Boolean(props.disabledDate?.(date, { type: picker() }))
    const selected = () =>
      Array.isArray(props.selectedValue)
        ? props.selectedValue.some((value) => samePickerValue(value, date, picker()))
        : samePickerValue(props.selectedValue, date, picker())
    const rangeStart = () => samePickerValue(props.rangeValue?.[0], date, picker())
    const rangeEnd = () => samePickerValue(props.rangeValue?.[1], date, picker())
    const displayRange = (): [dayjs.Dayjs | null, dayjs.Dayjs | null] => {
      const [start, end] = props.rangeValue ?? [null, null]
      if (start && end) return [start, end]
      if (!props.hoverValue) return [start, end]
      if (props.activeRange === 'end' && start) return [start, props.hoverValue]
      if (props.activeRange === 'start' && end) return [props.hoverValue, end]
      return [start, end]
    }
    const inRange = () => {
      const [start, end] = displayRange()
      if (!start || !end) return false
      const normalizedStart = start.isBefore(end, 'day') ? start : end
      const normalizedEnd = start.isBefore(end, 'day') ? end : start
      return date.isAfter(normalizedStart, 'day') && date.isBefore(normalizedEnd, 'day')
    }
    const originNode = () => date.date()
    return (
      <button
        type="button"
        aria-label={dateString()}
        aria-pressed={selected()}
        aria-disabled={cellDisabled()}
        disabled={cellDisabled()}
        class={semanticClass(
          'cell',
          props.classNames,
          `${props.prefixCls}-cell`,
          samePickerValue(today(), date, 'date') && `${props.prefixCls}-cell-today`,
          selected() && `${props.prefixCls}-cell-selected`,
          rangeStart() && `${props.prefixCls}-cell-range-start`,
          rangeEnd() && `${props.prefixCls}-cell-range-end`,
          inRange() && `${props.prefixCls}-cell-in-range`,
          cellDisabled() && `${props.prefixCls}-cell-disabled`,
        )}
        style={semanticStyle('cell', props.styles)}
        onClick={() => {
          if (!cellDisabled()) props.onSelect?.(date)
        }}
        onMouseEnter={() => {
          if (!cellDisabled()) props.onHover?.(date)
        }}
        onMouseLeave={() => props.onHover?.(null)}
      >
        {renderCellContent(date, originNode())}
      </button>
    )
  }

  return (
    <>
      <div
        class={
          picker() === 'week'
            ? `${props.prefixCls}-weekdays ${props.prefixCls}-weekdays-with-week`
            : `${props.prefixCls}-weekdays`
        }
      >
        <Show when={picker() === 'week'}>
          <div class={`${props.prefixCls}-weekday ${props.prefixCls}-week-column-header`}>Week</div>
        </Show>
        <For each={WEEKDAYS}>
          {(weekday) => <div class={`${props.prefixCls}-weekday`}>{weekday}</div>}
        </For>
      </div>
      <div
        class={
          picker() === 'week'
            ? `${props.prefixCls}-grid ${props.prefixCls}-week-grid`
            : `${props.prefixCls}-grid`
        }
      >
        <Show
          when={picker() === 'week'}
          fallback={<For each={dates()}>{(date) => renderDateCell(date)}</For>}
        >
          <For each={weekRows()}>
            {(row) => (
              <>
                {renderWeekButton(row)}
                <For each={row}>{(date) => renderDateCell(date)}</For>
              </>
            )}
          </For>
        </Show>
      </div>
    </>
  )
}
