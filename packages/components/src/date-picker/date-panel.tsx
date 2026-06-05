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

export interface DatePanelProps {
  prefixCls: string
  viewDate: dayjs.Dayjs
  picker?: PickerType
  selectedValue?: dayjs.Dayjs | null
  disabledDate?: (current: dayjs.Dayjs, info: { type: PickerType }) => boolean
  showWeek?: boolean
  cellRender?: (current: dayjs.Dayjs, info: CellRenderInfo) => JSX.Element
  dateRender?: (current: dayjs.Dayjs, today: dayjs.Dayjs) => JSX.Element
  locale?: DatePickerLocale
  classNames?: Partial<Record<DatePickerSemanticSlot, string>>
  styles?: Partial<Record<DatePickerSemanticSlot, JSX.CSSProperties>>
  onSelect?: (date: dayjs.Dayjs) => void
}

export function DatePanel(props: DatePanelProps) {
  const picker = () => props.picker ?? 'date'
  const today = () => dayjs()
  const dates = createMemo(() => monthDates(props.viewDate))

  function renderCellContent(cellDate: dayjs.Dayjs, originNode: JSX.Element): JSX.Element {
    if (props.cellRender) {
      return props.cellRender(cellDate, {
        originNode,
        today: today(),
        type: picker(),
        locale: props.locale,
      })
    }
    if (props.dateRender) return props.dateRender(cellDate, today())
    return cellDate.date()
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
        <For each={dates()}>
          {(date, index) => (
            <>
              <Show when={picker() === 'week' && index() % 7 === 0}>
                <Show
                  when={date}
                  fallback={
                    <div class={`${props.prefixCls}-empty-cell ${props.prefixCls}-week-cell`} />
                  }
                >
                  {(currentDate) => {
                    const weekStart = () => currentDate().startOf('week')
                    const weekLabel = () =>
                      `${weekStart().format('YYYY')}-week-${weekStart().week()}`
                    const weekDisabled = () =>
                      Boolean(props.disabledDate?.(weekStart(), { type: 'week' }))
                    const weekSelected = () =>
                      samePickerValue(props.selectedValue, weekStart(), 'week')
                    return (
                      <button
                        type="button"
                        aria-label={weekLabel()}
                        aria-pressed={weekSelected()}
                        aria-disabled={weekDisabled()}
                        class={semanticClass(
                          'cell',
                          props.classNames,
                          `${props.prefixCls}-cell`,
                          `${props.prefixCls}-week-cell`,
                          weekSelected() && `${props.prefixCls}-cell-selected`,
                          weekDisabled() && `${props.prefixCls}-cell-disabled`,
                        )}
                        style={semanticStyle('cell', props.styles)}
                        onClick={() => props.onSelect?.(weekStart())}
                      >
                        {weekStart().week()}
                      </button>
                    )
                  }}
                </Show>
              </Show>
              <Show when={date} fallback={<div class={`${props.prefixCls}-empty-cell`} />}>
                {(currentDate) => {
                  const cellDate = currentDate()
                  const dateString = () => cellDate.format('YYYY-MM-DD')
                  const cellDisabled = () =>
                    Boolean(props.disabledDate?.(cellDate, { type: picker() }))
                  const selected = () => samePickerValue(props.selectedValue, cellDate, picker())
                  const originNode = () => cellDate.date()
                  return (
                    <button
                      type="button"
                      aria-label={dateString()}
                      aria-pressed={selected()}
                      aria-disabled={cellDisabled()}
                      class={semanticClass(
                        'cell',
                        props.classNames,
                        `${props.prefixCls}-cell`,
                        samePickerValue(today(), cellDate, 'date') &&
                          `${props.prefixCls}-cell-today`,
                        selected() && `${props.prefixCls}-cell-selected`,
                        cellDisabled() && `${props.prefixCls}-cell-disabled`,
                      )}
                      style={semanticStyle('cell', props.styles)}
                      onClick={() => props.onSelect?.(cellDate)}
                    >
                      {renderCellContent(cellDate, originNode())}
                    </button>
                  )
                }}
              </Show>
            </>
          )}
        </For>
      </div>
    </>
  )
}
