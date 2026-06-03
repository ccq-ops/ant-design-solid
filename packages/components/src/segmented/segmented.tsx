import { For, createMemo, createSignal, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { SegmentedOption, SegmentedProps, SegmentedValue } from './interface'
import { useSegmentedStyle } from './segmented.style'

interface NormalizedOption {
  label: SegmentedOption extends infer _ ? import('solid-js').JSX.Element : never
  value: SegmentedValue
  disabled?: boolean
  icon?: import('solid-js').JSX.Element
  class?: string
}

function normalizeOption(option: SegmentedOption): NormalizedOption {
  if (typeof option === 'string' || typeof option === 'number') {
    return { label: String(option), value: option }
  }
  return option
}

function valuesEqual(a: SegmentedValue | undefined, b: SegmentedValue | undefined): boolean {
  return a === b
}

export function Segmented(props: SegmentedProps) {
  const [local, rest] = splitProps(props, [
    'options',
    'value',
    'defaultValue',
    'disabled',
    'block',
    'size',
    'prefixCls',
    'onChange',
    'class',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-segmented`
  const [, hashId] = useSegmentedStyle(prefixCls())
  const options = createMemo(() => (local.options ?? []).map(normalizeOption))
  const firstEnabledValue = () => options().find((option) => !option.disabled)?.value
  const validDefaultValue = () => {
    const defaultValue = local.defaultValue
    if (options().some((option) => valuesEqual(option.value, defaultValue) && !option.disabled))
      return defaultValue
    return firstEnabledValue()
  }
  const [innerValue, setInnerValue] = createSignal<SegmentedValue | undefined>(validDefaultValue())
  const selectedValue = () => (local.value !== undefined ? local.value : innerValue())
  const size = () => local.size ?? config.componentSize()

  function selectValue(nextValue: SegmentedValue): void {
    const option = options().find((item) => valuesEqual(item.value, nextValue))
    if (!option || local.disabled || option.disabled || valuesEqual(selectedValue(), nextValue))
      return
    if (local.value === undefined) setInnerValue(nextValue)
    local.onChange?.(nextValue)
  }

  function enabledOptions(): NormalizedOption[] {
    return options().filter((option) => !option.disabled)
  }

  function selectByOffset(currentValue: SegmentedValue, offset: number): void {
    const enabled = enabledOptions()
    if (!enabled.length) return
    const currentIndex = Math.max(
      enabled.findIndex((option) => valuesEqual(option.value, currentValue)),
      enabled.findIndex((option) => valuesEqual(option.value, selectedValue())),
      0,
    )
    selectValue(enabled[(currentIndex + offset + enabled.length) % enabled.length].value)
  }

  function handleKeyDown(event: KeyboardEvent, option: NormalizedOption): void {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      selectByOffset(option.value, 1)
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      selectByOffset(option.value, -1)
    }
    if (event.key === 'Home') {
      event.preventDefault()
      const first = enabledOptions()[0]
      if (first) selectValue(first.value)
    }
    if (event.key === 'End') {
      event.preventDefault()
      const enabled = enabledOptions()
      const last = enabled[enabled.length - 1]
      if (last) selectValue(last.value)
    }
  }

  return (
    <div
      {...rest}
      role="radiogroup"
      class={classNames(
        prefixCls(),
        local.block && `${prefixCls()}-block`,
        local.disabled && `${prefixCls()}-disabled`,
        size() === 'small' && `${prefixCls()}-sm`,
        size() === 'large' && `${prefixCls()}-lg`,
        hashId(),
        local.class,
      )}
    >
      <For each={options()}>
        {(option) => {
          const selected = () => valuesEqual(option.value, selectedValue())
          const disabled = () => Boolean(local.disabled || option.disabled)
          return (
            <button
              type="button"
              role="radio"
              aria-checked={selected() ? 'true' : 'false'}
              disabled={disabled()}
              class={classNames(
                `${prefixCls()}-item`,
                selected() && `${prefixCls()}-item-selected`,
                disabled() && `${prefixCls()}-item-disabled`,
                option.class,
              )}
              onClick={() => selectValue(option.value)}
              onKeyDown={(event) => handleKeyDown(event, option)}
            >
              {option.icon ? (
                <span class={`${prefixCls()}-item-icon`} aria-hidden="true">
                  {option.icon}
                </span>
              ) : null}
              <span class={`${prefixCls()}-item-label`}>{option.label}</span>
            </button>
          )
        }}
      </For>
    </div>
  )
}
