import { For, Show, createMemo } from 'solid-js'
import type { DisabledTimeConfig, RangeShowTimeOptions, ShowTimeOptions } from './interface'
import type { dayjs } from './date-utils'

export interface TimePanelProps {
  prefixCls: string
  value: dayjs.Dayjs | null
  showTime?: boolean | ShowTimeOptions | RangeShowTimeOptions
  disabledTime?: DisabledTimeConfig
  onSelectTime?: (unit: 'hour' | 'minute' | 'second', value: number) => void
}

function range(length: number): number[] {
  return Array.from({ length }, (_, index) => index)
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function showTimeOptions(
  showTime: boolean | ShowTimeOptions | RangeShowTimeOptions | undefined,
): ShowTimeOptions | RangeShowTimeOptions {
  return typeof showTime === 'object' ? showTime : {}
}

function includesValue(values: number[] | undefined, value: number): boolean {
  return Boolean(values?.includes(value))
}

export function TimePanel(props: TimePanelProps) {
  const options = createMemo(() => showTimeOptions(props.showTime))
  const hour = () => props.value?.hour() ?? 0
  const minute = () => props.value?.minute() ?? 0
  const second = () => props.value?.second() ?? 0
  const showHour = () => options().showHour !== false
  const showMinute = () => options().showMinute !== false
  const showSecond = () => options().showSecond !== false
  const hiddenDisabled = () => Boolean(options().hideDisabledOptions)
  const disabledHours = () =>
    props.disabledTime?.disabledHours?.() ?? options().disabledHours?.() ?? []
  const disabledMinutes = () =>
    props.disabledTime?.disabledMinutes?.(hour()) ?? options().disabledMinutes?.(hour()) ?? []
  const disabledSeconds = () =>
    props.disabledTime?.disabledSeconds?.(hour(), minute()) ??
    options().disabledSeconds?.(hour(), minute()) ??
    []

  function renderColumn(
    title: string,
    unit: 'hour' | 'minute' | 'second',
    values: number[],
    selectedValue: number,
    disabledValues: number[],
  ) {
    const visibleValues = () =>
      hiddenDisabled() ? values.filter((value) => !includesValue(disabledValues, value)) : values
    return (
      <div class={`${props.prefixCls}-time-column`}>
        <div class={`${props.prefixCls}-time-column-title`}>{title}</div>
        <For each={visibleValues()}>
          {(value) => {
            const disabled = () => includesValue(disabledValues, value)
            const selected = () => selectedValue === value
            const label = () => `${title} ${pad(value)}`
            return (
              <button
                type="button"
                aria-label={label()}
                aria-disabled={disabled()}
                aria-pressed={selected()}
                class={`${props.prefixCls}-time-cell${selected() ? ` ${props.prefixCls}-time-cell-selected` : ''}${
                  disabled() ? ` ${props.prefixCls}-time-cell-disabled` : ''
                }`}
                onClick={() => {
                  if (!disabled()) props.onSelectTime?.(unit, value)
                }}
              >
                {pad(value)}
              </button>
            )
          }}
        </For>
      </div>
    )
  }

  return (
    <div class={`${props.prefixCls}-time-panel`}>
      <Show when={showHour()}>
        {renderColumn('Hour', 'hour', range(24), hour(), disabledHours())}
      </Show>
      <Show when={showMinute()}>
        {renderColumn('Minute', 'minute', range(60), minute(), disabledMinutes())}
      </Show>
      <Show when={showSecond()}>
        {renderColumn('Second', 'second', range(60), second(), disabledSeconds())}
      </Show>
    </div>
  )
}
