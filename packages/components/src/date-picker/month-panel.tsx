import { For, createMemo } from 'solid-js'
import type { JSX } from 'solid-js'
import { dayjs, samePickerValue } from './date-utils'
import type {
  CellRenderInfo,
  DatePickerLocale,
  DatePickerSemanticSlot,
  PickerType,
} from './interface'
import { semanticClass, semanticStyle } from './semantic'

export interface MonthPanelProps {
  prefixCls: string
  viewDate: dayjs.Dayjs
  picker?: Extract<PickerType, 'month' | 'quarter'>
  selectedValue?: dayjs.Dayjs | dayjs.Dayjs[] | null
  disabledDate?: (current: dayjs.Dayjs, info: { type: PickerType }) => boolean
  cellRender?: (current: dayjs.Dayjs, info: CellRenderInfo) => JSX.Element
  locale?: DatePickerLocale
  classNames?: Partial<Record<DatePickerSemanticSlot, string>>
  styles?: Partial<Record<DatePickerSemanticSlot, JSX.CSSProperties>>
  onSelect?: (date: dayjs.Dayjs) => void
}

function quarterStart(value: dayjs.Dayjs, quarter: number): dayjs.Dayjs {
  return value.month((quarter - 1) * 3).startOf('month')
}

export function MonthPanel(props: MonthPanelProps) {
  const picker = () => props.picker ?? 'month'
  const today = () => dayjs()
  const cells = createMemo(() => {
    const yearStart = props.viewDate.startOf('year')
    if (picker() === 'quarter') {
      return [1, 2, 3, 4].map((quarter) => quarterStart(yearStart, quarter))
    }
    return Array.from({ length: 12 }, (_, month) => yearStart.month(month).startOf('month'))
  })

  function cellLabel(cellDate: dayjs.Dayjs): string {
    return picker() === 'quarter'
      ? `${cellDate.format('YYYY')}-Q${cellDate.quarter()}`
      : cellDate.format('YYYY-MM')
  }

  function renderCellContent(cellDate: dayjs.Dayjs, originNode: JSX.Element): JSX.Element {
    if (!props.cellRender) return originNode
    return props.cellRender(cellDate, {
      originNode,
      today: today(),
      type: picker(),
      locale: props.locale,
    })
  }

  return (
    <div class={`${props.prefixCls}-${picker()}-grid ${props.prefixCls}-variant-grid`} role="grid">
      <For each={cells()}>
        {(cellDate) => {
          const label = () => cellLabel(cellDate)
          const cellDisabled = () => Boolean(props.disabledDate?.(cellDate, { type: picker() }))
          const selected = () =>
            Array.isArray(props.selectedValue)
              ? props.selectedValue.some((value) => samePickerValue(value, cellDate, picker()))
              : samePickerValue(props.selectedValue, cellDate, picker())
          return (
            <button
              type="button"
              aria-label={label()}
              aria-pressed={selected()}
              aria-disabled={cellDisabled()}
              disabled={cellDisabled()}
              class={semanticClass(
                'cell',
                props.classNames,
                `${props.prefixCls}-cell`,
                `${props.prefixCls}-variant-cell`,
                selected() && `${props.prefixCls}-cell-selected`,
                cellDisabled() && `${props.prefixCls}-cell-disabled`,
              )}
              style={semanticStyle('cell', props.styles)}
              onClick={() => {
                if (!cellDisabled()) props.onSelect?.(cellDate)
              }}
            >
              <span class={`${props.prefixCls}-cell-inner`}>
                {renderCellContent(cellDate, label())}
              </span>
            </button>
          )
        }}
      </For>
    </div>
  )
}
