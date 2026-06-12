import { createEffect, createSignal, on, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form'
import { classNames } from '../shared/class-names'
import { useSwitchStyle } from './switch.style'
import type { SwitchProps, SwitchRef } from './interface'

function assignRef(ref: SwitchProps['ref'], value: SwitchRef) {
  if (!ref) return
  if (typeof ref === 'function') {
    ref(value)
    return
  }
  ref.current = value
}

export function Switch(props: SwitchProps) {
  const [local, rest] = splitProps(props, [
    'checked',
    'value',
    'defaultChecked',
    'defaultValue',
    'disabled',
    'loading',
    'size',
    'checkedChildren',
    'unCheckedChildren',
    'prefixCls',
    'class',
    'style',
    'classNames',
    'styles',
    'ref',
    'onChange',
    'onClick',
    'onBlur',
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-switch`
  const [, hashId] = useSwitchStyle(prefixCls())
  const [innerChecked, setInnerChecked] = createSignal(
    Boolean(local.defaultChecked ?? local.defaultValue),
  )
  const [pendingBlurChecked, setPendingBlurChecked] = createSignal<boolean>()
  let buttonRef: HTMLButtonElement | undefined

  const disabled = () => Boolean(local.disabled || local.loading)
  const size = () => local.size ?? config.componentSize()
  const controlledChecked = () => local.checked ?? local.value
  const checked = () => {
    if (formItem?.valuePropName() === 'checked' && formItem.trigger() === 'onBlur')
      return pendingBlurChecked() ?? Boolean(formItem.value())
    if (formItem?.valuePropName() === 'checked') return Boolean(formItem.value())
    if (controlledChecked() !== undefined) return Boolean(controlledChecked())
    return innerChecked()
  }
  const switchRef = {
    focus: () => buttonRef?.focus(),
    blur: () => buttonRef?.blur(),
    get nativeElement() {
      return buttonRef
    },
  }
  assignRef(local.ref, switchRef)

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
    else if (controlledChecked() === undefined && formItem?.valuePropName() !== 'checked')
      setInnerChecked(nextChecked)
    local.onClick?.(nextChecked, event)
    local.onChange?.(nextChecked, event)
    if (formItem?.valuePropName() === 'checked' && formItem.trigger() === 'onChange')
      formItem.setFieldValueFromControl(nextChecked)
  }

  return (
    <button
      {...rest}
      ref={(element) => {
        buttonRef = element
      }}
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
        local.classNames?.root,
      )}
      style={{
        ...(local.style as JSX.CSSProperties | undefined),
        ...local.styles?.root,
      }}
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
      <span
        class={classNames(`${prefixCls()}-handle`, local.classNames?.indicator)}
        style={local.styles?.indicator}
      />
      <span
        class={classNames(`${prefixCls()}-inner`, local.classNames?.content)}
        style={local.styles?.content}
      >
        {checked() ? local.checkedChildren : local.unCheckedChildren}
      </span>
    </button>
  )
}
