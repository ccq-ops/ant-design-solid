import { createEffect, createSignal, on, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form'
import { classNames } from '../shared/class-names'
import { useSwitchStyle } from './switch.style'
import type { SwitchProps } from './interface'

export function Switch(props: SwitchProps) {
  const [local, rest] = splitProps(props, [
    'checked',
    'defaultChecked',
    'disabled',
    'loading',
    'size',
    'checkedChildren',
    'unCheckedChildren',
    'prefixCls',
    'class',
    'style',
    'onChange',
    'onBlur',
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-switch`
  const [, hashId] = useSwitchStyle(prefixCls())
  const [innerChecked, setInnerChecked] = createSignal(Boolean(local.defaultChecked))
  const [pendingBlurChecked, setPendingBlurChecked] = createSignal<boolean>()

  const disabled = () => Boolean(local.disabled || local.loading)
  const size = () => local.size ?? config.componentSize()
  const checked = () => {
    if (formItem?.valuePropName() === 'checked' && formItem.trigger() === 'onBlur')
      return pendingBlurChecked() ?? Boolean(formItem.value())
    if (formItem?.valuePropName() === 'checked') return Boolean(formItem.value())
    if (local.checked !== undefined) return Boolean(local.checked)
    return innerChecked()
  }

  createEffect(
    on(
      () => formItem?.value(),
      () => {
        if (formItem?.valuePropName() === 'checked' && formItem.trigger() === 'onBlur')
          setPendingBlurChecked(undefined)
      },
      { defer: true },
    ),
  )

  function setNextChecked(nextChecked: boolean, event: MouseEvent): void {
    if (formItem?.valuePropName() === 'checked' && formItem.trigger() === 'onBlur')
      setPendingBlurChecked(nextChecked)
    else if (local.checked === undefined && formItem?.valuePropName() !== 'checked')
      setInnerChecked(nextChecked)
    local.onChange?.(nextChecked, event)
    if (formItem?.valuePropName() === 'checked' && formItem.trigger() === 'onChange')
      formItem.setFieldValueFromControl(nextChecked)
  }

  return (
    <button
      {...rest}
      type="button"
      role="switch"
      aria-checked={checked()}
      disabled={disabled()}
      class={classNames(
        prefixCls(),
        checked() && `${prefixCls()}-checked`,
        disabled() && `${prefixCls()}-disabled`,
        local.loading && `${prefixCls()}-loading`,
        size() === 'small' && `${prefixCls()}-sm`,
        hashId(),
        local.class,
      )}
      style={local.style}
      onClick={(event) => {
        if (disabled()) return
        setNextChecked(!checked(), event)
      }}
      onBlur={(event) => {
        ;(local.onBlur as JSX.EventHandler<HTMLButtonElement, FocusEvent> | undefined)?.(event)
        if (formItem?.valuePropName() === 'checked' && formItem.trigger() === 'onBlur')
          formItem.setFieldValueFromControl(checked())
      }}
    >
      <span class={`${prefixCls()}-inner`}>
        {checked() ? local.checkedChildren : local.unCheckedChildren}
      </span>
    </button>
  )
}
