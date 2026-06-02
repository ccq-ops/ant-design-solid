import { For, Show, createEffect, createMemo, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { TimePickerFormat, TimePickerProps } from './interface'
import { useTimePickerStyle } from './time-picker.style'

type TimeParts = {
  hour: number
  minute: number
  second: number
}

type ColumnType = 'hour' | 'minute' | 'second'

const DEFAULT_FORMAT: TimePickerFormat = 'HH:mm:ss'

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

function readSegment(segment: string | undefined, min: number, max: number): number {
  const parsed = Number.parseInt(segment ?? '', 10)
  return clamp(parsed, min, max)
}

function normalizeStep(step: number | undefined): number {
  const parsed = Math.floor(Number(step))
  if (!Number.isFinite(parsed) || parsed < 1) return 1
  return Math.min(60, parsed)
}

function parseTime(value: string | undefined): TimeParts | undefined {
  if (!value) return undefined
  const [hour, minute, second] = value.split(':')
  return {
    hour: readSegment(hour, 0, 23),
    minute: readSegment(minute, 0, 59),
    second: readSegment(second, 0, 59),
  }
}

function formatTime(parts: TimeParts, format: TimePickerFormat): string {
  const value = `${pad(parts.hour)}:${pad(parts.minute)}`
  return format === 'HH:mm' ? value : `${value}:${pad(parts.second)}`
}

function range(max: number, step = 1): number[] {
  const values: number[] = []
  for (let value = 0; value <= max; value += step) values.push(value)
  return values
}

function includes(values: number[], value: number): boolean {
  return values.includes(value)
}

export function TimePicker(props: TimePickerProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'format',
    'placeholder',
    'disabled',
    'allowClear',
    'open',
    'defaultOpen',
    'minuteStep',
    'secondStep',
    'disabledHours',
    'disabledMinutes',
    'disabledSeconds',
    'prefixCls',
    'class',
    'style',
    'onChange',
    'onOpenChange',
    'onKeyDown',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-time-picker`
  const [, hashId] = useTimePickerStyle(prefixCls())
  const [innerValue, setInnerValue] = createSignal<string | undefined>(
    parseTime(local.defaultValue)
      ? formatTime(parseTime(local.defaultValue) as TimeParts, local.format ?? DEFAULT_FORMAT)
      : undefined,
  )
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [draftParts, setDraftParts] = createSignal<Partial<TimeParts>>({})

  const isValueControlled = () => 'value' in props
  const format = () => local.format ?? DEFAULT_FORMAT
  const disabled = () => Boolean(local.disabled)
  const minuteStep = () => normalizeStep(local.minuteStep)
  const secondStep = () => normalizeStep(local.secondStep)
  const parsedValue = createMemo(() => parseTime(isValueControlled() ? local.value : innerValue()))
  const value = () => (parsedValue() ? formatTime(parsedValue() as TimeParts, format()) : undefined)
  const open = () => (local.open !== undefined ? Boolean(local.open) : innerOpen())

  createEffect(() => {
    const parts = parsedValue()
    setDraftParts(parts ?? {})
  })

  function setOpen(nextOpen: boolean): void {
    if (disabled()) return
    if (local.open === undefined) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
  }

  function changeValue(nextValue: string | undefined): void {
    if (!isValueControlled()) setInnerValue(nextValue)
    local.onChange?.(nextValue)
  }

  function disabledValues(type: ColumnType, parts: Partial<TimeParts>): number[] {
    if (type === 'hour') return local.disabledHours?.() ?? []
    if (type === 'minute') return local.disabledMinutes?.(parts.hour) ?? []
    return local.disabledSeconds?.(parts.hour, parts.minute) ?? []
  }

  function isDisabled(type: ColumnType, optionValue: number, parts = draftParts()): boolean {
    return includes(disabledValues(type, parts), optionValue)
  }

  function isComplete(parts: Partial<TimeParts>): parts is TimeParts {
    return (
      parts.hour !== undefined &&
      parts.minute !== undefined &&
      (format() === 'HH:mm' || parts.second !== undefined)
    )
  }

  function selectValue(type: ColumnType, optionValue: number): void {
    const current = draftParts()
    if (isDisabled(type, optionValue, current)) return

    const nextParts = { ...current, [type]: optionValue }
    setDraftParts(nextParts)

    if (!isComplete(nextParts)) return

    const completeParts: TimeParts = {
      hour: nextParts.hour,
      minute: nextParts.minute,
      second: format() === 'HH:mm' ? 0 : nextParts.second,
    }

    if (
      isDisabled('hour', completeParts.hour, completeParts) ||
      isDisabled('minute', completeParts.minute, completeParts) ||
      (format() !== 'HH:mm' && isDisabled('second', completeParts.second, completeParts))
    ) {
      return
    }

    changeValue(formatTime(completeParts, format()))
  }

  function clearValue(event: MouseEvent): void {
    event.stopPropagation()
    setDraftParts({})
    changeValue(undefined)
  }

  function renderColumn(type: ColumnType, max: number, step = 1) {
    const label = type === 'hour' ? 'hours' : type === 'minute' ? 'minutes' : 'seconds'
    const selected = () => draftParts()[type]

    return (
      <div class={`${prefixCls()}-column`}>
        <div class={`${prefixCls()}-column-title`}>{label}</div>
        <div role="listbox" aria-label={label} class={`${prefixCls()}-column-list`}>
          <For each={range(max, step)}>
            {(optionValue) => {
              const optionDisabled = () => isDisabled(type, optionValue)
              return (
                <div
                  role="option"
                  aria-label={`${pad(optionValue)} ${label}`}
                  aria-selected={selected() === optionValue}
                  aria-disabled={optionDisabled()}
                  class={classNames(
                    `${prefixCls()}-cell`,
                    selected() === optionValue && `${prefixCls()}-cell-selected`,
                    optionDisabled() && `${prefixCls()}-cell-disabled`,
                  )}
                  onClick={() => selectValue(type, optionValue)}
                >
                  {pad(optionValue)}
                </div>
              )
            }}
          </For>
        </div>
      </div>
    )
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
        <span class={value() ? `${prefixCls()}-selection-item` : `${prefixCls()}-placeholder`}>
          {value() ?? local.placeholder ?? 'Select time'}
        </span>
        <Show when={local.allowClear && !disabled() && value() !== undefined}>
          <button
            type="button"
            aria-label="Clear time"
            class={`${prefixCls()}-clear`}
            onClick={clearValue}
          >
            ×
          </button>
        </Show>
      </div>
      <Show when={open()}>
        <div class={`${prefixCls()}-dropdown`}>
          <div role="group" aria-label="Time selection" class={`${prefixCls()}-panel`}>
            {renderColumn('hour', 23)}
            {renderColumn('minute', 59, minuteStep())}
            <Show when={format() === 'HH:mm:ss'}>{renderColumn('second', 59, secondStep())}</Show>
          </div>
        </div>
      </Show>
    </div>
  )
}
