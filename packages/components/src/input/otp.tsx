import { For, createSignal } from 'solid-js'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form/context'
import { classNames } from '../shared/class-names'
import { useInputStyle } from './input.style'
import type { OTPProps } from './interface'

function splitValue(value: string, length: number) {
  return Array.from({ length }, (_, index) => value[index] ?? '')
}

function getDisplayValue(value: string, mask: OTPProps['mask'], formatter: OTPProps['formatter']) {
  const formatted = formatter ? formatter(value) : value
  if (!formatted) return ''
  if (mask === true) return '*'
  if (typeof mask === 'string') return mask
  return formatted
}

export function OTP(props: OTPProps) {
  const config = useConfig()
  const formItem = useFormItemControl()
  const prefixCls = () => `${config.prefixCls()}-input`
  const [, hashId] = useInputStyle(prefixCls())
  const [innerValue, setInnerValue] = createSignal(props.defaultValue ?? '')
  const length = () => props.length ?? 6
  const values = () => splitValue(props.value ?? innerValue(), length())
  const disabled = () => props.disabled ?? formItem?.disabled?.() ?? false
  const size = () => props.size ?? formItem?.size?.() ?? config.componentSize()
  const variant = () => props.variant ?? formItem?.variant?.() ?? 'outlined'
  const indexes = () => Array.from({ length: length() }, (_, index) => index)
  const inputRefs: HTMLInputElement[] = []

  function emit(nextValues: string[]) {
    const nextValue = nextValues.join('')
    if (props.value === undefined) setInnerValue(nextValue)
    props.onInput?.(nextValues)
    if (nextValues.every(Boolean)) props.onChange?.(nextValue)
  }

  function handleInput(index: number, event: InputEvent & { currentTarget: HTMLInputElement }) {
    const rawValue = event.currentTarget.value
    const nextChar = rawValue.slice(-1)
    const nextValues = values()
    nextValues[index] = nextChar
    event.currentTarget.value = getDisplayValue(nextChar, props.mask, props.formatter)
    emit(nextValues)
    if (nextChar && index < length() - 1) inputRefs[index + 1]?.focus()
  }

  function renderSeparator(index: number) {
    if (!props.separator || index >= length() - 1) return null
    return typeof props.separator === 'function' ? props.separator(index) : props.separator
  }

  return (
    <div
      class={classNames(
        `${prefixCls()}-otp`,
        size() === 'small' && `${prefixCls()}-otp-sm`,
        size() === 'large' && `${prefixCls()}-otp-lg`,
        props.status && `${prefixCls()}-status-${props.status}`,
        disabled() && `${prefixCls()}-disabled`,
        `${prefixCls()}-variant-${variant()}`,
        hashId(),
        props.class,
        props.classNames?.wrapper,
      )}
      style={{ ...props.styles?.wrapper, ...(props.style as Record<string, string> | undefined) }}
    >
      <For each={indexes()}>
        {(index) => (
          <>
            <input
              ref={(el) => {
                inputRefs[index] = el
              }}
              class={classNames(`${prefixCls()}-otp-input`, props.classNames?.input)}
              style={props.styles?.input}
              value={getDisplayValue(values()[index], props.mask, props.formatter)}
              disabled={disabled()}
              autocomplete={props.autoComplete}
              inputMode="numeric"
              maxLength={1}
              onInput={(event) => handleInput(index, event)}
            />
            {renderSeparator(index) && (
              <span
                class={classNames(`${prefixCls()}-otp-separator`, props.classNames?.separator)}
                style={props.styles?.separator}
              >
                {renderSeparator(index)}
              </span>
            )}
          </>
        )}
      </For>
    </div>
  )
}
