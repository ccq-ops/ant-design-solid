import { For, Show, createEffect, createMemo, createSignal, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { CalendarMode, CalendarProps, CalendarValue } from './interface'
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

export function Calendar(props: CalendarProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'mode',
    'defaultMode',
    'fullscreen',
    'disabledDate',
    'dateCellRender',
    'dateFullCellRender',
    'monthCellRender',
    'monthFullCellRender',
    'headerRender',
    'onSelect',
    'onChange',
    'onPanelChange',
    'prefixCls',
    'class',
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

  createEffect(() => {
    const selected = selectedDate()
    if (selected) setPanelDate(firstOfMonth(selected))
  })

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

  function changeValue(nextDate: Date): void {
    const normalized = startOfDay(nextDate)
    const previous = selectedDate()
    local.onSelect?.(normalized)
    if (!sameDate(previous, normalized)) {
      if (!isValueControlled()) setInnerValue(normalized)
      local.onChange?.(normalized)
    }
  }

  function selectDate(date: Date): void {
    if (local.disabledDate?.(date)) return
    changeValue(date)
    if (
      date.getMonth() !== panelDate().getMonth() ||
      date.getFullYear() !== panelDate().getFullYear()
    ) {
      changePanelDate(date)
    }
  }

  function selectMonth(date: Date): void {
    if (local.disabledDate?.(date)) return
    changeValue(date)
    changePanelDate(date)
  }

  function renderDefaultHeader() {
    return (
      <div class={`${prefixCls()}-header`}>
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
        local.class,
      )}
      style={local.style}
    >
      <Show when={local.headerRender} fallback={renderDefaultHeader()}>
        {(headerRender) =>
          headerRender()({
            value: panelDate(),
            mode: mode(),
            onChange: changePanelDate,
            onModeChange: changeMode,
          })
        }
      </Show>
      <div class={`${prefixCls()}-body`}>
        <Show
          when={mode() === 'month'}
          fallback={
            <div class={`${prefixCls()}-year-grid`}>
              <For each={visibleMonths()}>
                {(monthDate) => {
                  const monthDisabled = () => Boolean(local.disabledDate?.(monthDate))
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
                      )}
                      onClick={() => selectMonth(monthDate)}
                    >
                      <Show
                        when={local.monthFullCellRender}
                        fallback={
                          <>
                            <span class={`${prefixCls()}-date-value`}>
                              {MONTHS[monthDate.getMonth()]}
                            </span>
                            <Show when={local.monthCellRender?.(monthDate)}>
                              {(content) => (
                                <div class={`${prefixCls()}-cell-content`}>{content()}</div>
                              )}
                            </Show>
                          </>
                        }
                      >
                        {(render) => render()(monthDate)}
                      </Show>
                    </button>
                  )
                }}
              </For>
            </div>
          }
        >
          <div>
            <div class={`${prefixCls()}-weekdays`}>
              <For each={WEEKDAYS}>
                {(weekday) => <div class={`${prefixCls()}-weekday`}>{weekday}</div>}
              </For>
            </div>
            <div class={`${prefixCls()}-date-grid`}>
              <For each={visibleDates()}>
                {(date) => {
                  const cellDisabled = () => Boolean(local.disabledDate?.(date))
                  const selected = () => sameDate(selectedDate(), date)
                  const outside = () => date.getMonth() !== panelDate().getMonth()
                  return (
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
                      )}
                      onClick={() => selectDate(date)}
                    >
                      <Show
                        when={local.dateFullCellRender}
                        fallback={
                          <>
                            <span class={`${prefixCls()}-date-value`}>{date.getDate()}</span>
                            <Show when={local.dateCellRender?.(date)}>
                              {(content) => (
                                <div class={`${prefixCls()}-cell-content`}>{content()}</div>
                              )}
                            </Show>
                          </>
                        }
                      >
                        {(render) => render()(date)}
                      </Show>
                    </button>
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
