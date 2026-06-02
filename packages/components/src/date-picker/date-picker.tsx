import { For, Show, createEffect, createMemo, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { DatePickerProps, DatePickerValue } from './interface'
import { useDatePickerStyle } from './date-picker.style'

const DEFAULT_FORMAT = 'YYYY-MM-DD'
const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function isValidDate(value: Date): boolean {
  return !Number.isNaN(value.getTime())
}

function startOfDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
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

function parseDate(value: DatePickerValue | undefined): Date | undefined {
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

function formatDate(value: Date, format: string): string {
  const replacements: Record<string, string> = {
    YYYY: String(value.getFullYear()),
    MM: pad(value.getMonth() + 1),
    DD: pad(value.getDate()),
  }

  return format.replace(/YYYY|MM|DD/g, (token) => replacements[token] ?? token)
}

function monthLabel(value: Date): string {
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}`
}

function addMonths(value: Date, offset: number): Date {
  return new Date(value.getFullYear(), value.getMonth() + offset, 1)
}

function daysInMonth(value: Date): number {
  return new Date(value.getFullYear(), value.getMonth() + 1, 0).getDate()
}

function monthDates(value: Date): Array<Date | undefined> {
  const firstDate = new Date(value.getFullYear(), value.getMonth(), 1)
  const blanks = firstDate.getDay()
  const dates: Array<Date | undefined> = Array.from({ length: blanks }, () => undefined)

  for (let day = 1; day <= daysInMonth(value); day += 1) {
    dates.push(new Date(value.getFullYear(), value.getMonth(), day))
  }

  return dates
}

export function DatePicker(props: DatePickerProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'format',
    'placeholder',
    'disabled',
    'allowClear',
    'open',
    'defaultOpen',
    'disabledDate',
    'prefixCls',
    'class',
    'style',
    'onChange',
    'onOpenChange',
    'onKeyDown',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-date-picker`
  const [, hashId] = useDatePickerStyle(prefixCls())
  const defaultSelectedDate = parseDate(local.defaultValue)
  const initialViewDate = defaultSelectedDate ?? new Date()
  const [innerValue, setInnerValue] = createSignal<Date | undefined>(defaultSelectedDate)
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [viewMonth, setViewMonth] = createSignal(
    new Date(initialViewDate.getFullYear(), initialViewDate.getMonth(), 1),
  )

  const isValueControlled = () => 'value' in props
  const isOpenControlled = () => 'open' in props
  const format = () => local.format ?? DEFAULT_FORMAT
  const disabled = () => Boolean(local.disabled)
  const selectedDate = createMemo(() =>
    isValueControlled() ? parseDate(local.value) : innerValue(),
  )
  const displayValue = () => {
    const selected = selectedDate()
    return selected ? formatDate(selected, format()) : undefined
  }
  const open = () => (isOpenControlled() ? Boolean(local.open) : innerOpen())
  const dates = createMemo(() => monthDates(viewMonth()))
  const today = () => startOfDay(new Date())

  createEffect(() => {
    const selected = selectedDate()
    if (selected) setViewMonth(new Date(selected.getFullYear(), selected.getMonth(), 1))
  })

  function setOpen(nextOpen: boolean): void {
    if (disabled()) return
    if (!isOpenControlled()) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
  }

  function changeValue(nextDate: Date | undefined): void {
    if (!isValueControlled()) setInnerValue(nextDate)
    local.onChange?.(nextDate, nextDate ? formatDate(nextDate, format()) : '')
  }

  function selectDate(date: Date): void {
    if (local.disabledDate?.(date)) return
    changeValue(date)
    setOpen(false)
  }

  function clearValue(event: MouseEvent): void {
    event.stopPropagation()
    changeValue(undefined)
  }

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        disabled() && `${prefixCls()}-disabled`,
        open() && `${prefixCls()}-open`,
        hashId(),
        local.class,
      )}
      style={local.style}
    >
      <div
        role="combobox"
        tabindex={disabled() ? undefined : 0}
        aria-expanded={open()}
        aria-disabled={disabled()}
        class={`${prefixCls()}-selector`}
        onClick={() => setOpen(!open())}
        onKeyDown={(event) => {
          ;(local.onKeyDown as JSX.EventHandler<HTMLDivElement, KeyboardEvent> | undefined)?.(event)
          if (event.key === 'Escape') setOpen(false)
        }}
      >
        <span
          class={displayValue() ? `${prefixCls()}-selection-item` : `${prefixCls()}-placeholder`}
        >
          {displayValue() ?? local.placeholder ?? 'Select date'}
        </span>
        <Show when={local.allowClear && !disabled() && displayValue() !== undefined}>
          <button
            type="button"
            aria-label="Clear date"
            class={`${prefixCls()}-clear`}
            onClick={clearValue}
          >
            ×
          </button>
        </Show>
      </div>
      <Show when={open()}>
        <div class={`${prefixCls()}-dropdown`}>
          <div class={`${prefixCls()}-header`}>
            <button
              type="button"
              aria-label="Previous month"
              class={`${prefixCls()}-month-button`}
              onClick={() => setViewMonth(addMonths(viewMonth(), -1))}
            >
              ‹
            </button>
            <div class={`${prefixCls()}-month-label`}>{monthLabel(viewMonth())}</div>
            <button
              type="button"
              aria-label="Next month"
              class={`${prefixCls()}-month-button`}
              onClick={() => setViewMonth(addMonths(viewMonth(), 1))}
            >
              ›
            </button>
          </div>
          <div class={`${prefixCls()}-weekdays`}>
            <For each={WEEKDAYS}>
              {(weekday) => <div class={`${prefixCls()}-weekday`}>{weekday}</div>}
            </For>
          </div>
          <div class={`${prefixCls()}-grid`}>
            <For each={dates()}>
              {(date) => (
                <Show when={date} fallback={<div class={`${prefixCls()}-empty-cell`} />}>
                  {(currentDate) => {
                    const cellDate = currentDate()
                    const dateString = () => formatDate(cellDate, DEFAULT_FORMAT)
                    const cellDisabled = () => Boolean(local.disabledDate?.(cellDate))
                    const selected = () => sameDate(selectedDate(), cellDate)
                    return (
                      <button
                        type="button"
                        aria-label={dateString()}
                        aria-pressed={selected()}
                        aria-disabled={cellDisabled()}
                        class={classNames(
                          `${prefixCls()}-cell`,
                          sameDate(today(), cellDate) && `${prefixCls()}-cell-today`,
                          selected() && `${prefixCls()}-cell-selected`,
                          cellDisabled() && `${prefixCls()}-cell-disabled`,
                        )}
                        onClick={() => selectDate(cellDate)}
                      >
                        {cellDate.getDate()}
                      </button>
                    )
                  }}
                </Show>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  )
}
