import { createEffect, createSignal, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/classNames'
import { callHandler } from '../shared/events'
import { useRadioStyle } from './radio.style'
import type { RadioProps } from './interface'

export function RadioRoot(props: RadioProps) {
  const [local, rest] = splitProps(props, ['checked', 'defaultChecked', 'disabled', 'value', 'prefixCls', 'children', 'class', 'style', 'onChange'])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-radio`
  const [, hashId] = useRadioStyle(prefixCls())
  const [innerChecked, setInnerChecked] = createSignal(Boolean(local.defaultChecked))
  let inputRef: HTMLInputElement | undefined

  const disabled = () => Boolean(local.disabled)
  const checked = () => (local.checked !== undefined ? Boolean(local.checked) : innerChecked())

  createEffect(() => {
    if (inputRef) inputRef.checked = checked()
  })

  return (
    <label class={classNames(prefixCls(), checked() && `${prefixCls()}-checked`, disabled() && `${prefixCls()}-disabled`, hashId(), local.class)} style={local.style}>
      <input
        {...rest}
        ref={(el) => {
          inputRef = el
        }}
        type="radio"
        class={`${prefixCls()}-input`}
        disabled={disabled()}
        checked={checked()}
        value={local.value == null ? undefined : String(local.value)}
        onClick={(event) => {
          if (!disabled()) return
          setTimeout(() => {
            event.currentTarget.checked = checked()
          }, 0)
        }}
        onChange={(event) => {
          if (disabled()) {
            event.currentTarget.checked = checked()
            return
          }
          if (local.checked === undefined) setInnerChecked(true)
          callHandler(local.onChange, event)
          if (local.checked !== undefined) event.currentTarget.checked = checked()
        }}
      />
      {local.children}
    </label>
  )
}
