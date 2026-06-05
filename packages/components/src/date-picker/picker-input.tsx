import { CloseCircleFilled } from '@ant-design-solid/icons'
import { Show } from 'solid-js'
import type { JSX } from 'solid-js'

export interface PickerInputProps {
  prefixCls: string
  value: string
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  allowClear?: boolean
  clearIcon?: JSX.Element
  clearAriaLabel?: string
  prefix?: JSX.Element
  suffixIcon?: JSX.Element
  id?: string
  name?: string
  ariaLabel?: string
  autoFocus?: boolean
  inputClass?: string
  inputStyle?: JSX.CSSProperties
  clearClass?: string
  clearStyle?: JSX.CSSProperties
  inputRef?: (element: HTMLInputElement) => void
  onInput?: JSX.EventHandler<HTMLInputElement, InputEvent>
  onFocus?: JSX.EventHandler<HTMLInputElement, FocusEvent>
  onBlur?: JSX.EventHandler<HTMLInputElement, FocusEvent>
  onKeyDown?: JSX.EventHandler<HTMLInputElement, KeyboardEvent>
  onClear?: (event: MouseEvent) => void
}

export function PickerInput(props: PickerInputProps) {
  return (
    <>
      <Show when={props.prefix}>
        <span class={`${props.prefixCls}-prefix`}>{props.prefix}</span>
      </Show>
      <input
        id={props.id}
        name={props.name}
        ref={props.inputRef}
        role="textbox"
        aria-label={props.ariaLabel}
        class={props.inputClass ?? `${props.prefixCls}-input`}
        style={props.inputStyle}
        value={props.value}
        placeholder={props.placeholder}
        disabled={props.disabled}
        readOnly={props.readOnly}
        autofocus={props.autoFocus}
        onInput={props.onInput}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        onKeyDown={props.onKeyDown}
      />
      <Show when={props.allowClear && !props.disabled && props.value !== ''}>
        <button
          type="button"
          aria-label={props.clearAriaLabel ?? 'Clear date'}
          class={props.clearClass ?? `${props.prefixCls}-clear`}
          style={props.clearStyle}
          onClick={props.onClear}
        >
          {props.clearIcon ?? <CloseCircleFilled />}
        </button>
      </Show>
      <Show when={props.suffixIcon}>
        <span class={`${props.prefixCls}-suffix`}>{props.suffixIcon}</span>
      </Show>
    </>
  )
}
