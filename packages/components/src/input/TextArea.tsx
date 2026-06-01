import { createEffect, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/classNames'
import { useInputStyle } from './input.style'
import type { TextAreaProps } from './interface'

export function TextArea(props: TextAreaProps) {
  const [local, rest] = splitProps(props, ['value', 'defaultValue', 'showCount', 'status', 'class', 'disabled', 'onInput', 'onChange'])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-input`
  const [, hashId] = useInputStyle(prefixCls())
  const [innerValue, setInnerValue] = createSignal(String(local.defaultValue ?? ''))
  let textAreaRef: HTMLTextAreaElement | undefined

  const value = () => String(local.value ?? innerValue())

  createEffect(() => {
    if (textAreaRef) textAreaRef.value = value()
  })

  function resetDisabledValue() {
    if (textAreaRef) textAreaRef.value = value()
  }

  return (
    <span class={classNames(`${prefixCls()}-textarea-wrapper`, local.status && `${prefixCls()}-status-${local.status}`, local.disabled && `${prefixCls()}-disabled`, hashId())}>
      <textarea
        {...rest}
        ref={(el) => {
          textAreaRef = el
        }}
        class={classNames(`${prefixCls()}-textarea`, local.class)}
        disabled={local.disabled}
        value={value()}
        onInput={(event) => {
          if (local.disabled) {
            resetDisabledValue()
            return
          }
          setInnerValue(event.currentTarget.value)
          ;(local.onInput as JSX.EventHandler<HTMLTextAreaElement, InputEvent> | undefined)?.(event)
        }}
        onChange={(event) => {
          if (local.disabled) {
            resetDisabledValue()
            return
          }
          setInnerValue(event.currentTarget.value)
          ;(local.onChange as JSX.EventHandler<HTMLTextAreaElement, Event> | undefined)?.(event)
        }}
      />
      {local.showCount && <span class={`${prefixCls()}-textarea-count`}>{`${value().length}${rest.maxLength !== undefined ? ` / ${rest.maxLength}` : ''}`}</span>}
    </span>
  )
}
