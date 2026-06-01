import { createEffect, createSignal, on, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form'
import { classNames } from '../shared/classNames'
import { callHandler } from '../shared/events'
import { useCheckboxStyle } from './checkbox.style'
import type { JSX } from 'solid-js'
import type { CheckboxProps } from './interface'

export function CheckboxRoot(props: CheckboxProps) {
  const [local, rest] = splitProps(props, ['checked', 'defaultChecked', 'disabled', 'indeterminate', 'prefixCls', 'children', 'class', 'style', 'onChange', 'onBlur'])
  const config = useConfig()
  const formItem = useFormItemControl()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-checkbox`
  const [, hashId] = useCheckboxStyle(prefixCls())
  const [innerChecked, setInnerChecked] = createSignal(Boolean(local.defaultChecked))
  const [pendingBlurChecked, setPendingBlurChecked] = createSignal<boolean>()
  let inputRef: HTMLInputElement | undefined

  const disabled = () => Boolean(local.disabled)

  const checked = () => {
    if (formItem?.valuePropName() === 'checked' && formItem.trigger() === 'onBlur') return pendingBlurChecked() ?? Boolean(formItem.value())
    if (formItem?.valuePropName() === 'checked') return Boolean(formItem.value())
    if (local.checked !== undefined) return Boolean(local.checked)
    return innerChecked()
  }

  createEffect(
    on(
      () => formItem?.value(),
      () => {
        if (formItem?.valuePropName() === 'checked' && formItem.trigger() === 'onBlur') setPendingBlurChecked(undefined)
      },
      { defer: true },
    ),
  )

  createEffect(() => {
    if (inputRef) {
      inputRef.indeterminate = Boolean(local.indeterminate)
      inputRef.checked = checked()
    }
  })

  return (
    <label
      class={classNames(
        prefixCls(),
        checked() && `${prefixCls()}-checked`,
        disabled() && `${prefixCls()}-disabled`,
        local.indeterminate && `${prefixCls()}-indeterminate`,
        hashId(),
        local.class,
      )}
      style={local.style}
    >
      <input
        {...rest}
        ref={(el) => {
          inputRef = el
        }}
        type="checkbox"
        class={`${prefixCls()}-input`}
        disabled={disabled()}
        checked={checked()}
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
          const nextChecked = event.currentTarget.checked
          if (formItem?.valuePropName() === 'checked' && formItem.trigger() === 'onBlur') setPendingBlurChecked(nextChecked)
          else if (local.checked === undefined && formItem?.valuePropName() !== 'checked') setInnerChecked(nextChecked)
          callHandler(local.onChange, event)
          if (formItem?.valuePropName() === 'checked' && formItem.trigger() === 'onChange') formItem.setFieldValueFromControl(nextChecked)
          if (local.checked !== undefined || (formItem?.valuePropName() === 'checked' && formItem.trigger() === 'onChange')) event.currentTarget.checked = checked()
        }}
        onBlur={(event) => {
          ;(local.onBlur as JSX.EventHandler<HTMLInputElement, FocusEvent> | undefined)?.(event)
          if (formItem?.valuePropName() === 'checked' && formItem.trigger() === 'onBlur') formItem.setFieldValueFromControl(checked())
        }}
      />
      {local.children}
    </label>
  )
}
