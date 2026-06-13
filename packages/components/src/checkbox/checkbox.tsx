import { Show, createEffect, createMemo, createSignal, on, onCleanup, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form'
import { classNames } from '../shared/class-names'
import { callHandler } from '../shared/events'
import { callRef, useCheckboxGroupContext } from './context'
import { useCheckboxStyle } from './checkbox.style'
import type { JSX } from 'solid-js'
import type { CheckboxProps } from './interface'

function resolveClassNames(
  props: CheckboxProps,
): Partial<Record<'root' | 'icon' | 'label', string>> {
  if (typeof props.classNames === 'function') return props.classNames({ props })
  return props.classNames ?? {}
}

function resolveStyles(
  props: CheckboxProps,
): Partial<Record<'root' | 'icon' | 'label', JSX.CSSProperties>> {
  if (typeof props.styles === 'function') return props.styles({ props })
  return props.styles ?? {}
}

export function CheckboxRoot(props: CheckboxProps) {
  const [local, rest] = splitProps(props, [
    'checked',
    'defaultChecked',
    'disabled',
    'indeterminate',
    'skipGroup',
    'prefixCls',
    'children',
    'title',
    'class',
    'style',
    'classNames',
    'styles',
    'ref',
    'onChange',
    'onBlur',
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
  const group = useCheckboxGroupContext()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-checkbox`
  const [, hashId] = useCheckboxStyle(prefixCls())
  const [innerChecked, setInnerChecked] = createSignal(Boolean(local.defaultChecked))
  const [pendingBlurChecked, setPendingBlurChecked] = createSignal<boolean>()
  let inputRef: HTMLInputElement | undefined

  const inGroup = () => Boolean(group && !local.skipGroup && rest.value !== undefined)
  const disabled = () => local.disabled ?? group?.disabled() ?? formItem?.disabled?.() ?? false
  const semanticClassNames = createMemo(() => resolveClassNames(props))
  const semanticStyles = createMemo(() => resolveStyles(props))

  const checked = () => {
    if (inGroup()) return group?.value().some((item) => item === rest.value) ?? false
    if (formItem?.valuePropName() === 'checked' && formItem.trigger() === 'onBlur')
      return pendingBlurChecked() ?? Boolean(formItem.value())
    if (formItem?.valuePropName() === 'checked') return Boolean(formItem.value())
    if (local.checked !== undefined) return Boolean(local.checked)
    return innerChecked()
  }

  const checkboxRef = {
    focus: () => inputRef?.focus(),
    blur: () => inputRef?.blur(),
    get nativeElement() {
      return inputRef
    },
  }
  callRef(local.ref, checkboxRef)

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

  createEffect(() => {
    if (!inGroup()) return
    group?.registerValue(rest.value as never)
    onCleanup(() => group?.cancelValue(rest.value as never))
  })

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
        semanticClassNames().root,
      )}
      style={{ ...(local.style as JSX.CSSProperties | undefined), ...semanticStyles().root }}
      title={local.title}
    >
      <input
        {...rest}
        ref={(el) => {
          inputRef = el
        }}
        type="checkbox"
        class={classNames(`${prefixCls()}-input`, semanticClassNames().icon)}
        style={semanticStyles().icon}
        disabled={disabled()}
        checked={checked()}
        value={rest.value == null ? undefined : String(rest.value)}
        name={rest.name ?? (inGroup() ? group?.name() : undefined)}
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
          if (inGroup() && rest.value !== undefined)
            group?.updateValue(rest.value as never, nextChecked, event)
          else if (formItem?.valuePropName() === 'checked' && formItem.trigger() === 'onBlur')
            setPendingBlurChecked(nextChecked)
          else if (local.checked === undefined && formItem?.valuePropName() !== 'checked')
            setInnerChecked(nextChecked)
          callHandler(local.onChange, event)
          if (formItem?.valuePropName() === 'checked' && formItem.trigger() === 'onChange')
            formItem.setFieldValueFromControl(nextChecked)
          if (
            local.checked !== undefined ||
            (formItem?.valuePropName() === 'checked' && formItem.trigger() === 'onChange')
          )
            event.currentTarget.checked = checked()
        }}
        onBlur={(event) => {
          ;(local.onBlur as JSX.EventHandler<HTMLInputElement, FocusEvent> | undefined)?.(event)
          if (formItem?.valuePropName() === 'checked' && formItem.trigger() === 'onBlur')
            formItem.setFieldValueFromControl(checked())
        }}
      />
      <Show when={local.children !== undefined && local.children !== null}>
        <span
          class={classNames(`${prefixCls()}-label`, semanticClassNames().label)}
          style={semanticStyles().label}
        >
          {local.children}
        </span>
      </Show>
    </label>
  )
}
