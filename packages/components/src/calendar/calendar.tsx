import { For, Show, createEffect, createMemo, createSignal, splitProps, type JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type {
  CalendarCellRenderInfo,
  CalendarCellType,
  CalendarMode,
  CalendarProps,
  CalendarSemanticClassNames,
  CalendarSemanticStyles,
  CalendarValue,
} from './interface'
import { useCalendarStyle } from './calendar.style'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function isValidDate(value: Date): boolean {
  return !Number.isNaN(value.getTime())
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function firstOfMonth(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), 1)
}

function sameDate(a: Date | undefined, b: Date | undefined): boolean {
  return Boolean(
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate(),
  )
}

function parseDate(value: CalendarValue | undefined): Date | undefined {
  if (value === undefined) return undefined
  if (value instanceof Date) return isValidDate(value) ? startOfDay(value) : undefined

  const trimmed = value.trim()
  if (!trimmed) return undefined

  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s].*)?$/.exec(trimmed)
  if (match) {
    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])
    const parsed = new Date(year, month - 1, day)
    if (
      parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day
    ) {
      return parsed
    }
    return undefined
  }

  const fallback = new Date(trimmed)
  if (!isValidDate(fallback)) return undefined
  return startOfDay(fallback)
}

function formatDate(value: Date): string {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
}

function formatMonth(value: Date): string {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}`
}

function getWeek(value: Date): number {
  const date = new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()))
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function addMonths(value: Date, offset: number): Date {
  return new Date(value.getFullYear(), value.getMonth() + offset, 1)
}

function addYears(value: Date, offset: number): Date {
  return new Date(value.getFullYear() + offset, value.getMonth(), 1)
}

function monthDates(value: Date): Date[] {
  const firstDate = firstOfMonth(value)
  const start = new Date(firstDate)
  start.setDate(firstDate.getDate() - firstDate.getDay())

  return Array.from({ length: 42 }, (_, index) => {
    const next = new Date(start)
    next.setDate(start.getDate() + index)
    return next
  })
}

function yearMonths(value: Date): Date[] {
  return Array.from({ length: 12 }, (_, month) => new Date(value.getFullYear(), month, 1))
}

function isRenderable(value: JSX.Element): boolean {
  return value !== undefined && value !== null && value !== false
}

function mergeStyle(
  ...styles: Array<JSX.CSSProperties | undefined>
): JSX.CSSProperties | undefined {
  return Object.assign({}, ...styles.filter(Boolean))
}

function resolveSemanticClassNames(props: CalendarProps): CalendarSemanticClassNames {
  return typeof props.classNames === 'function'
    ? props.classNames({ props })
    : (props.classNames ?? {})
}

function resolveSemanticStyles(props: CalendarProps): CalendarSemanticStyles {
  return typeof props.styles === 'function' ? props.styles({ props }) : (props.styles ?? {})
}

export function Calendar(props: CalendarProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'mode',
    'defaultMode',
    'fullscreen',
    'showWeek',
    'locale',
    'validRange',
    'disabledDate',
    'dateCellRender',
    'dateFullCellRender',
    'monthCellRender',
    'monthFullCellRender',
    'cellRender',
    'fullCellRender',
    'headerRender',
    'onSelect',
    'onChange',
    'onPanelChange',
    'prefixCls',
    'rootClassName',
    'classNames',
    'styles',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-calendar`
  const [, hashId] = useCalendarStyle(prefixCls())
  const defaultSelectedDate = parseDate(local.defaultValue)
  const initialPanelDate = defaultSelectedDate ?? startOfDay(new Date())
  const [innerValue, setInnerValue] = createSignal<Date | undefined>(defaultSelectedDate)
  const [panelDate, setPanelDate] = createSignal(firstOfMonth(initialPanelDate))
  const [innerMode, setInnerMode] = createSignal<CalendarMode>(local.defaultMode ?? 'month')

  const isValueControlled = () => 'value' in props
  const isModeControlled = () => 'mode' in props
  const selectedDate = createMemo(() =>
    isValueControlled() ? parseDate(local.value) : innerValue(),
  )
  const mode = () => (isModeControlled() ? (local.mode ?? 'month') : innerMode())
  const fullscreen = () => local.fullscreen ?? true
  const today = () => startOfDay(new Date())
  const visibleDates = createMemo(() => monthDates(panelDate()))
  const visibleMonths = createMemo(() => yearMonths(panelDate()))
  const semanticProps = (): CalendarProps => ({ ...props, fullscreen: fullscreen(), mode: mode() })
  const semanticClassNames = createMemo(() => resolveSemanticClassNames(semanticProps()))
  const semanticStyles = createMemo(() => resolveSemanticStyles(semanticProps()))
  const parsedValidRange = createMemo(() => {
    if (!local.validRange) return undefined
    const start = parseDate(local.validRange[0])
    const end = parseDate(local.validRange[1])
    if (!start || !end) return undefined
    return start.getTime() <= end.getTime() ? [start, end] : [end, start]
  })

  createEffect(() => {
    const selected = selectedDate()
    if (selected) setPanelDate(firstOfMonth(selected))
  })

  function isDisabled(date: Date): boolean {
    const range = parsedValidRange()
    const normalized = startOfDay(date)
    const outsideRange = range
      ? normalized.getTime() < range[0].getTime() || normalized.getTime() > range[1].getTime()
      : false
    return outsideRange || Boolean(local.disabledDate?.(date))
  }

  function emitPanelChange(nextPanelDate: Date, nextMode = mode()): void {
    local.onPanelChange?.(nextPanelDate, nextMode)
  }

  function changePanelDate(nextDate: Date): void {
    const nextPanelDate = firstOfMonth(nextDate)
    setPanelDate(nextPanelDate)
    emitPanelChange(nextPanelDate)
  }

  function changeMode(nextMode: CalendarMode): void {
    if (!isModeControlled()) setInnerMode(nextMode)
    emitPanelChange(panelDate(), nextMode)
  }

  function changeValue(nextDate: Date, source: 'date' | 'month' | 'customize'): void {
    const normalized = startOfDay(nextDate)
    const previous = selectedDate()
    local.onSelect?.(normalized, { source })
    if (!sameDate(previous, normalized)) {
      if (!isValueControlled()) setInnerValue(normalized)
      local.onChange?.(normalized)
    }
  }

  function selectDate(date: Date): void {
    if (isDisabled(date)) return
    changeValue(date, 'date')
    if (
      date.getMonth() !== panelDate().getMonth() ||
      date.getFullYear() !== panelDate().getFullYear()
    ) {
      changePanelDate(date)
    }
  }

  function selectMonth(date: Date): void {
    if (isDisabled(date)) return
    changeValue(date, 'month')
    changePanelDate(date)
  }

  function cellInfo(type: CalendarCellType, originNode: JSX.Element): CalendarCellRenderInfo {
    return {
      prefixCls: prefixCls(),
      originNode,
      today: today(),
      type,
      locale: local.locale,
    }
  }

  function renderCellContent(date: Date, type: CalendarCellType): JSX.Element {
    const originNode = type === 'date' ? date.getDate() : MONTHS[date.getMonth()]
    const info = cellInfo(type, originNode)

    if (local.fullCellRender) return local.fullCellRender(date, info)
    if (type === 'date' && local.dateFullCellRender) return local.dateFullCellRender(date)
    if (type === 'month' && local.monthFullCellRender) return local.monthFullCellRender(date)

    const extra = local.cellRender
      ? local.cellRender(date, info)
      : type === 'date'
        ? local.dateCellRender?.(date)
        : local.monthCellRender?.(date)
    const valueClass = type === 'date' ? `${prefixCls()}-date-value` : `${prefixCls()}-month-value`

    return (
      <>
        <span class={valueClass}>{originNode}</span>
        <Show when={isRenderable(extra)}>
          <div
            class={classNames(`${prefixCls()}-cell-content`, semanticClassNames().itemContent)}
            style={semanticStyles().itemContent}
          >
            {extra}
          </div>
        </Show>
      </>
    )
  }

  function renderDefaultHeader() {
    return (
      <div
        class={classNames(`${prefixCls()}-header`, semanticClassNames().header)}
        style={semanticStyles().header}
      >
        <div class={`${prefixCls()}-title`}>
          {mode() === 'month' ? formatMonth(panelDate()) : panelDate().getFullYear()}
        </div>
        <div class={`${prefixCls()}-header-actions`}>
          <button
            type="button"
            aria-label="Previous year"
            class={`${prefixCls()}-button`}
            onClick={() => changePanelDate(addYears(panelDate(), -1))}
          >
            «
          </button>
          <Show when={mode() === 'month'}>
            <button
              type="button"
              aria-label="Previous month"
              class={`${prefixCls()}-button`}
              onClick={() => changePanelDate(addMonths(panelDate(), -1))}
            >
              ‹
            </button>
          </Show>
          <Show when={mode() === 'month'}>
            <button
              type="button"
              aria-label="Next month"
              class={`${prefixCls()}-button`}
              onClick={() => changePanelDate(addMonths(panelDate(), 1))}
            >
              ›
            </button>
          </Show>
          <button
            type="button"
            aria-label="Next year"
            class={`${prefixCls()}-button`}
            onClick={() => changePanelDate(addYears(panelDate(), 1))}
          >
            »
          </button>
          <button
            type="button"
            aria-label="Month mode"
            aria-pressed={mode() === 'month'}
            class={classNames(
              `${prefixCls()}-button`,
              mode() === 'month' && `${prefixCls()}-button-active`,
            )}
            onClick={() => changeMode('month')}
          >
            Month
          </button>
          <button
            type="button"
            aria-label="Year mode"
            aria-pressed={mode() === 'year'}
            class={classNames(
              `${prefixCls()}-button`,
              mode() === 'year' && `${prefixCls()}-button-active`,
            )}
            onClick={() => changeMode('year')}
          >
            Year
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        fullscreen() ? `${prefixCls()}-fullscreen` : `${prefixCls()}-mini`,
        hashId(),
        local.rootClassName,
        local.class,
        semanticClassNames().root,
      )}
      classList={local.classList}
      style={mergeStyle(semanticStyles().root, local.style as JSX.CSSProperties | undefined)}
    >
      <Show when={local.headerRender} fallback={renderDefaultHeader()}>
        {(headerRender) =>
          headerRender()({
            value: panelDate(),
            mode: mode(),
            type: mode(),
            onChange: changePanelDate,
            onModeChange: changeMode,
            onTypeChange: changeMode,
          })
        }
      </Show>
      <div
        class={classNames(`${prefixCls()}-body`, semanticClassNames().body)}
        style={semanticStyles().body}
      >
        <Show
          when={mode() === 'month'}
          fallback={
            <div
              class={classNames(`${prefixCls()}-year-grid`, semanticClassNames().content)}
              style={semanticStyles().content}
            >
              <For each={visibleMonths()}>
                {(monthDate) => {
                  const monthDisabled = () => isDisabled(monthDate)
                  const selected = () => {
                    const selectedValue = selectedDate()
                    return Boolean(
                      selectedValue &&
                      selectedValue.getFullYear() === monthDate.getFullYear() &&
                      selectedValue.getMonth() === monthDate.getMonth(),
                    )
                  }
                  return (
                    <button
                      type="button"
                      aria-label={formatMonth(monthDate)}
                      aria-pressed={selected()}
                      aria-disabled={monthDisabled()}
                      class={classNames(
                        `${prefixCls()}-cell`,
                        selected() && `${prefixCls()}-cell-selected`,
                        monthDisabled() && `${prefixCls()}-cell-disabled`,
                        semanticClassNames().item,
                      )}
                      style={semanticStyles().item}
                      onClick={() => selectMonth(monthDate)}
                    >
                      {renderCellContent(monthDate, 'month')}
                    </button>
                  )
                }}
              </For>
            </div>
          }
        >
          <div>
            <div
              class={classNames(
                `${prefixCls()}-weekdays`,
                local.showWeek && `${prefixCls()}-weekdays-show-week`,
              )}
            >
              <Show when={local.showWeek}>
                <div class={classNames(`${prefixCls()}-weekday`, `${prefixCls()}-week-label`)}>
                  {local.locale?.lang?.week ?? 'Week'}
                </div>
              </Show>
              <For each={WEEKDAYS}>
                {(weekday) => <div class={`${prefixCls()}-weekday`}>{weekday}</div>}
              </For>
            </div>
            <div
              class={classNames(
                `${prefixCls()}-date-grid`,
                local.showWeek && `${prefixCls()}-date-grid-show-week`,
                semanticClassNames().content,
              )}
              style={semanticStyles().content}
            >
              <For each={visibleDates()}>
                {(date, index) => {
                  const cellDisabled = () => isDisabled(date)
                  const selected = () => sameDate(selectedDate(), date)
                  const outside = () => date.getMonth() !== panelDate().getMonth()
                  return (
                    <>
                      <Show when={local.showWeek && index() % 7 === 0}>
                        <div class={`${prefixCls()}-week-number`}>{getWeek(date)}</div>
                      </Show>
                      <button
                        type="button"
                        aria-label={formatDate(date)}
                        aria-pressed={selected()}
                        aria-disabled={cellDisabled()}
                        class={classNames(
                          `${prefixCls()}-cell`,
                          sameDate(today(), date) && `${prefixCls()}-cell-today`,
                          selected() && `${prefixCls()}-cell-selected`,
                          outside() && `${prefixCls()}-cell-outside`,
                          cellDisabled() && `${prefixCls()}-cell-disabled`,
                          semanticClassNames().item,
                        )}
                        style={semanticStyles().item}
                        onClick={() => selectDate(date)}
                      >
                        {renderCellContent(date, 'date')}
                      </button>
                    </>
                  )
                }}
              </For>
            </div>
          </div>
        </Show>
      </div>
    </div>
  )
}
