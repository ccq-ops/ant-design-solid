import { For, createMemo } from 'solid-js'
import type { JSX } from 'solid-js'
import { dayjs } from './date-utils'
import type { DatePickerSemanticSlot } from './interface'
import { semanticClass, semanticStyle } from './semantic'

export interface DecadeRange {
  start: number
  end: number
}

export function decadeStart(year: number): number {
  return Math.floor(year / 10) * 10
}

export function decadeRange(viewDate: dayjs.Dayjs): DecadeRange {
  const start = decadeStart(viewDate.year())
  return { start, end: start + 9 }
}

export function previousDecade(viewDate: dayjs.Dayjs): dayjs.Dayjs {
  return viewDate.subtract(10, 'year')
}

export function nextDecade(viewDate: dayjs.Dayjs): dayjs.Dayjs {
  return viewDate.add(10, 'year')
}

export interface DecadePanelProps {
  prefixCls: string
  viewDate: dayjs.Dayjs
  selectedValue?: dayjs.Dayjs | null
  classNames?: Partial<Record<DatePickerSemanticSlot, string>>
  styles?: Partial<Record<DatePickerSemanticSlot, JSX.CSSProperties>>
  onSelect?: (date: dayjs.Dayjs) => void
}

export function DecadePanel(props: DecadePanelProps) {
  const decades = createMemo(() => {
    const currentStart = decadeStart(props.viewDate.year()) - 50
    return Array.from({ length: 12 }, (_, index) => currentStart + index * 10)
  })

  return (
    <div class={`${props.prefixCls}-decade-grid ${props.prefixCls}-variant-grid`} role="grid">
      <For each={decades()}>
        {(start) => {
          const cellDate = () => props.viewDate.year(start).startOf('year')
          const label = () => `${start}-${start + 9}`
          const selected = () => {
            const value = props.selectedValue
            return Boolean(value && decadeStart(value.year()) === start)
          }
          return (
            <button
              type="button"
              aria-label={label()}
              aria-pressed={selected()}
              class={semanticClass(
                'cell',
                props.classNames,
                `${props.prefixCls}-cell`,
                `${props.prefixCls}-variant-cell`,
                selected() && `${props.prefixCls}-cell-selected`,
              )}
              style={semanticStyle('cell', props.styles)}
              onClick={() => props.onSelect?.(cellDate())}
            >
              {label()}
            </button>
          )
        }}
      </For>
    </div>
  )
}
