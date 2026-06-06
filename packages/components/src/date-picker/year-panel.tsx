import { For, createMemo } from 'solid-js'
import type { JSX } from 'solid-js'
import { dayjs, samePickerValue } from './date-utils'
import type { CellRenderInfo, DatePickerLocale, DatePickerSemanticSlot } from './interface'
import { semanticClass, semanticStyle } from './semantic'

export interface YearPanelProps {
  prefixCls: string
  viewDate: dayjs.Dayjs
  selectedValue?: dayjs.Dayjs | dayjs.Dayjs[] | null
  disabledDate?: (current: dayjs.Dayjs, info: { type: 'year' }) => boolean
  cellRender?: (current: dayjs.Dayjs, info: CellRenderInfo) => JSX.Element
  locale?: DatePickerLocale
  classNames?: Partial<Record<DatePickerSemanticSlot, string>>
  styles?: Partial<Record<DatePickerSemanticSlot, JSX.CSSProperties>>
  onSelect?: (date: dayjs.Dayjs) => void
}

export function yearGridStart(viewDate: dayjs.Dayjs): number {
  return viewDate.year() - 5
}

export function YearPanel(props: YearPanelProps) {
  const today = () => dayjs()
  const years = createMemo(() => {
    const start = yearGridStart(props.viewDate)
    return Array.from({ length: 12 }, (_, index) =>
      props.viewDate.year(start + index).startOf('year'),
    )
  })

  function renderCellContent(cellDate: dayjs.Dayjs, originNode: JSX.Element): JSX.Element {
    if (!props.cellRender) return originNode
    return props.cellRender(cellDate, {
      originNode,
      today: today(),
      type: 'year',
      locale: props.locale,
    })
  }

  return (
    <div class={`${props.prefixCls}-year-grid ${props.prefixCls}-variant-grid`} role="grid">
      <For each={years()}>
        {(cellDate) => {
          const label = () => cellDate.format('YYYY')
          const cellDisabled = () => Boolean(props.disabledDate?.(cellDate, { type: 'year' }))
          const selected = () =>
            Array.isArray(props.selectedValue)
              ? props.selectedValue.some((value) => samePickerValue(value, cellDate, 'year'))
              : samePickerValue(props.selectedValue, cellDate, 'year')
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
              {renderCellContent(cellDate, label())}
            </button>
          )
        }}
      </For>
    </div>
  )
}
