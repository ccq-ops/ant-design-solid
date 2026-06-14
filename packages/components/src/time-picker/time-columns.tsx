import dayjs from 'dayjs'
import { For, Show, createEffect } from 'solid-js'
import type { JSX } from 'solid-js'
import { classNames } from '../shared/class-names'
import type {
  DisabledTimeConfig,
  TimePickerCellRenderInfo,
  TimePickerSemanticSlot,
} from './interface'

export type TimeColumnType = 'hour' | 'minute' | 'second'
export type TimeColumnRangeSide = 'start' | 'end'

export type TimeColumnParts = Partial<Record<TimeColumnType, number>>

export interface TimeColumnsProps {
  prefixCls: string
  parts: TimeColumnParts
  hourStep: number
  minuteStep: number
  secondStep: number
  showHour?: boolean
  showMinute?: boolean
  showSecond?: boolean
  hourLabel?: string
  minuteLabel?: string
  secondLabel?: string
  hideDisabledOptions?: boolean
  changeOnScroll?: boolean
  classNames?: Partial<Record<TimePickerSemanticSlot, string>>
  styles?: Partial<Record<TimePickerSemanticSlot, JSX.CSSProperties>>
  cellRender?: (current: number, info: TimePickerCellRenderInfo) => JSX.Element
  range?: TimeColumnRangeSide
  disabledConfig?: DisabledTimeConfig
  onSelect: (type: TimeColumnType, optionValue: number) => void
}

const TIME_CELL_HEIGHT = 32

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function range(max: number, step = 1): number[] {
  const values: number[] = []
  for (let value = 0; value <= max; value += step) values.push(value)
  return values
}

function includes(values: number[], value: number): boolean {
  return values.includes(value)
}

function semanticClass(
  slot: TimePickerSemanticSlot,
  classes: Partial<Record<TimePickerSemanticSlot, string>> | undefined,
  ...values: Array<string | false | null | undefined>
): string {
  return classNames(...values, classes?.[slot])
}

function semanticStyle(
  slot: TimePickerSemanticSlot,
  styles: Partial<Record<TimePickerSemanticSlot, JSX.CSSProperties>> | undefined,
): JSX.CSSProperties | undefined {
  return styles?.[slot]
}

export function normalizeTimeStep(step: number | undefined): number {
  const parsed = Math.floor(Number(step))
  if (!Number.isFinite(parsed) || parsed < 1) return 1
  return Math.min(60, parsed)
}

export function TimeColumns(props: TimeColumnsProps) {
  const listRefs: Partial<Record<TimeColumnType, HTMLDivElement>> = {}
  const programmaticScrollTypes = new Set<TimeColumnType>()

  function disabledValues(type: TimeColumnType, parts: TimeColumnParts): number[] {
    if (type === 'hour') return props.disabledConfig?.disabledHours?.() ?? []
    if (type === 'minute' && parts.hour !== undefined) {
      return props.disabledConfig?.disabledMinutes?.(parts.hour) ?? []
    }
    if (type === 'second' && parts.hour !== undefined && parts.minute !== undefined) {
      return props.disabledConfig?.disabledSeconds?.(parts.hour, parts.minute) ?? []
    }
    return []
  }

  function isDisabled(type: TimeColumnType, optionValue: number): boolean {
    return includes(disabledValues(type, props.parts), optionValue)
  }

  function options(type: TimeColumnType, max: number, step: number): number[] {
    const values = range(max, step)
    if (!props.hideDisabledOptions) return values
    return values.filter((value) => !isDisabled(type, value))
  }

  function handleScroll(type: TimeColumnType, event: Event): void {
    if (programmaticScrollTypes.has(type)) {
      programmaticScrollTypes.delete(type)
      return
    }
    if (!props.changeOnScroll) return
    const target = event.currentTarget as HTMLElement
    const optionValues =
      type === 'hour'
        ? options(type, 23, props.hourStep)
        : type === 'minute'
          ? options(type, 59, props.minuteStep)
          : options(type, 59, props.secondStep)
    const nextValue = optionValues[Math.max(0, Math.round(target.scrollTop / TIME_CELL_HEIGHT))]
    if (nextValue !== undefined) props.onSelect(type, nextValue)
  }

  function scrollSelectedToTop(type: TimeColumnType, max: number, step: number): void {
    const list = listRefs[type]
    const selected = props.parts[type]
    if (!list || selected === undefined) return
    const selectedIndex = options(type, max, step).indexOf(selected)
    if (selectedIndex === -1) return
    const selectedElement = list.children.item(selectedIndex) as HTMLElement | null
    const top =
      selectedElement !== null
        ? selectedElement.offsetTop - list.offsetTop
        : selectedIndex * TIME_CELL_HEIGHT
    programmaticScrollTypes.add(type)
    if (typeof list.scrollTo === 'function') {
      list.scrollTo({ top, behavior: 'smooth' })
    } else {
      list.scrollTop = top
      queueMicrotask(() => programmaticScrollTypes.delete(type))
    }
  }

  createEffect(() => scrollSelectedToTop('hour', 23, props.hourStep))
  createEffect(() => scrollSelectedToTop('minute', 59, props.minuteStep))
  createEffect(() => scrollSelectedToTop('second', 59, props.secondStep))

  function renderCell(type: TimeColumnType, optionValue: number, originNode: JSX.Element) {
    if (!props.cellRender) return originNode
    return props.cellRender(optionValue, {
      originNode,
      today: dayjs(),
      range: props.range,
      subType: type,
    })
  }

  function label(type: TimeColumnType): string {
    if (type === 'hour') return props.hourLabel ?? 'hours'
    if (type === 'minute') return props.minuteLabel ?? 'minutes'
    return props.secondLabel ?? 'seconds'
  }

  function renderColumn(type: TimeColumnType, max: number, step = 1) {
    const columnLabel = label(type)
    const selected = () => props.parts[type]

    return (
      <div class={semanticClass('column', props.classNames, `${props.prefixCls}-column`)}>
        <div class={`${props.prefixCls}-column-title`}>{columnLabel}</div>
        <div
          role="listbox"
          aria-label={columnLabel}
          ref={(element) => {
            listRefs[type] = element
          }}
          class={`${props.prefixCls}-column-list`}
          onScroll={(event) => handleScroll(type, event)}
        >
          <For each={options(type, max, step)}>
            {(optionValue) => {
              const optionDisabled = () => isDisabled(type, optionValue)
              const originNode = <span>{pad(optionValue)}</span>
              return (
                <div
                  role="option"
                  aria-label={`${pad(optionValue)} ${columnLabel}`}
                  aria-selected={selected() === optionValue}
                  aria-disabled={optionDisabled()}
                  class={semanticClass(
                    'cell',
                    props.classNames,
                    `${props.prefixCls}-cell`,
                    selected() === optionValue && `${props.prefixCls}-cell-selected`,
                    optionDisabled() && `${props.prefixCls}-cell-disabled`,
                  )}
                  style={{
                    display: 'flex',
                    'align-items': 'center',
                    'justify-content': 'center',
                    ...semanticStyle('cell', props.styles),
                  }}
                  onClick={() => {
                    if (!optionDisabled()) props.onSelect(type, optionValue)
                  }}
                >
                  {renderCell(type, optionValue, originNode)}
                </div>
              )
            }}
          </For>
        </div>
      </div>
    )
  }

  return (
    <>
      <Show when={props.showHour !== false}>{renderColumn('hour', 23, props.hourStep)}</Show>
      <Show when={props.showMinute !== false}>{renderColumn('minute', 59, props.minuteStep)}</Show>
      <Show when={props.showSecond !== false}>{renderColumn('second', 59, props.secondStep)}</Show>
    </>
  )
}
