import { Show, createEffect, createMemo, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form'
import { classNames } from '../shared/class-names'
import type { InputNumberProps } from './interface'
import { useInputNumberStyle } from './input-number.style'

function isFiniteNumber(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function clamp(value: number, min: number | undefined, max: number | undefined): number {
  let next = value
  if (min !== undefined) next = Math.max(min, next)
  if (max !== undefined) next = Math.min(max, next)
  return next
}

function roundByPrecision(value: number, precision: number | undefined): number {
  if (precision === undefined || precision < 0) return value
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

function defaultParser(displayValue: string): number | undefined {
  if (displayValue.trim() === '') return undefined
  const parsed = Number(displayValue)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function InputNumber(props: InputNumberProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'min',
    'max',
    'step',
    'precision',
    'placeholder',
    'disabled',
    'size',
    'status',
    'controls',
    'formatter',
    'parser',
    'onChange',
    'onInput',
    'onBlur',
    'onFocus',
    'onKeyDown',
    'class',
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
  const prefixCls = () => `${config.prefixCls()}-input-number`
  const [, hashId] = useInputNumberStyle(prefixCls())
  const [innerValue, setInnerValue] = createSignal<number | undefined>(local.defaultValue)
  const [displayValue, setDisplayValue] = createSignal('')
  const [focused, setFocused] = createSignal(false)
  const step = () => local.step ?? 1
  const controls = () => local.controls !== false
  const disabled = () => Boolean(local.disabled)
  const size = () => local.size ?? config.componentSize()
  const isValueControlled = () => 'value' in props
  const isFormValueControlled = () =>
    formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange'

  const mergedValue = createMemo<number | undefined>(() => {
    if (isFormValueControlled()) return formItem?.value() as number | undefined
    if (isValueControlled()) return local.value
    return innerValue()
  })

  function formatValue(value: number | undefined): string {
    if (local.formatter) return local.formatter(value)
    return value === undefined ? '' : String(value)
  }

  createEffect(() => {
    if (!focused()) setDisplayValue(formatValue(mergedValue()))
  })

  function parseDisplay(value: string): number | undefined {
    return local.parser ? local.parser(value) : defaultParser(value)
  }

  function normalize(value: number | undefined): number | undefined {
    if (!isFiniteNumber(value)) return undefined
    return roundByPrecision(clamp(value, local.min, local.max), local.precision)
  }

  function updateValue(nextValue: number | undefined): void {
    const normalized = normalize(nextValue)
    if (!isValueControlled() && !isFormValueControlled()) setInnerValue(normalized)
    setDisplayValue(formatValue(isValueControlled() ? mergedValue() : normalized))
    local.onChange?.(normalized)
    if (isFormValueControlled()) formItem?.setFieldValueFromControl(normalized)
  }

  function stepValue(direction: 1 | -1): void {
    if (disabled()) return
    const base = mergedValue() ?? 0
    updateValue(base + step() * direction)
  }

  return (
    <span
      class={classNames(
        prefixCls(),
        focused() && `${prefixCls()}-focused`,
        disabled() && `${prefixCls()}-disabled`,
        size() === 'small' && `${prefixCls()}-sm`,
        size() === 'large' && `${prefixCls()}-lg`,
        local.status && `${prefixCls()}-status-${local.status}`,
        hashId(),
        local.class,
      )}
    >
      <input
        {...rest}
        role="spinbutton"
        type="text"
        class={`${prefixCls()}-input`}
        value={displayValue()}
        placeholder={local.placeholder}
        disabled={disabled()}
        aria-disabled={disabled() ? 'true' : undefined}
        aria-valuemin={local.min}
        aria-valuemax={local.max}
        aria-valuenow={mergedValue()}
        onInput={(event) => {
          if (disabled()) return
          setDisplayValue(event.currentTarget.value)
          ;(local.onInput as JSX.EventHandler<HTMLInputElement, InputEvent> | undefined)?.(event)
        }}
        onFocus={(event) => {
          setFocused(true)
          ;(local.onFocus as JSX.EventHandler<HTMLInputElement, FocusEvent> | undefined)?.(event)
        }}
        onBlur={(event) => {
          setFocused(false)
          updateValue(parseDisplay(event.currentTarget.value))
          ;(local.onBlur as JSX.EventHandler<HTMLInputElement, FocusEvent> | undefined)?.(event)
        }}
        onKeyDown={(event) => {
          ;(local.onKeyDown as JSX.EventHandler<HTMLInputElement, KeyboardEvent> | undefined)?.(
            event,
          )
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            stepValue(1)
          }
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            stepValue(-1)
          }
        }}
      />
      <Show when={controls()}>
        <span class={`${prefixCls()}-controls`} aria-disabled={disabled() ? 'true' : undefined}>
          <button
            type="button"
            aria-label="increase value"
            class={classNames(`${prefixCls()}-handler`, `${prefixCls()}-handler-up`)}
            disabled={disabled()}
            onClick={() => stepValue(1)}
          >
            ▲
          </button>
          <button
            type="button"
            aria-label="decrease value"
            class={classNames(`${prefixCls()}-handler`, `${prefixCls()}-handler-down`)}
            disabled={disabled()}
            onClick={() => stepValue(-1)}
          >
            ▼
          </button>
        </span>
      </Show>
    </span>
  )
}
