import { createEffect, createMemo, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { callHandler } from '../shared/events'
import { callRef, useRadioGroupContext } from './context'
import { useRadioStyle } from './radio.style'
import type { RadioProps, RadioSemanticClassNames, RadioSemanticStyles } from './interface'

function resolveClassNames(
  props: RadioProps,
): Partial<Record<'root' | 'icon' | 'label' | 'wrapper' | 'input', string>> {
  if (typeof props.classNames === 'function') return props.classNames({ props })
  return props.classNames ?? {}
}

function resolveStyles(
  props: RadioProps,
): Partial<Record<'root' | 'icon' | 'label' | 'wrapper' | 'input', JSX.CSSProperties>> {
  if (typeof props.styles === 'function') return props.styles({ props })
  return props.styles ?? {}
}

export function RadioRoot(props: RadioProps) {
  const [local, rest] = splitProps(props, [
    'checked',
    'defaultChecked',
    'disabled',
    'value',
    'prefixCls',
    'rootClass',
    'children',
    'title',
    'class',
    'style',
    'classNames',
    'styles',
    'ref',
    'skipGroup',
    'onChange',
  ])
  const config = useConfig()
  const group = useRadioGroupContext()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-radio`
  const [, hashId] = useRadioStyle(prefixCls())
  const [innerChecked, setInnerChecked] = createSignal(Boolean(local.defaultChecked))
  let inputRef: HTMLInputElement | undefined

  const groupContext = () => (local.skipGroup ? undefined : group)
  const disabled = () => Boolean(local.disabled ?? groupContext()?.disabled())
  const checked = () => {
    const currentGroup = groupContext()
    if (currentGroup && local.value !== undefined) {
      currentGroup.restoreTick()
      return currentGroup.value() === local.value
    }
    return local.checked !== undefined ? Boolean(local.checked) : innerChecked()
  }
  const semanticClassNames = createMemo(() => resolveClassNames(props))
  const semanticStyles = createMemo(() => resolveStyles(props))

  const radioRef = {
    focus: () => inputRef?.focus(),
    blur: () => inputRef?.blur(),
    get nativeElement() {
      return inputRef
    },
  }
  callRef(local.ref, radioRef)

  createEffect(() => {
    if (inputRef) inputRef.checked = checked()
  })

  return (
    <label
      class={classNames(
        prefixCls(),
        checked() && `${prefixCls()}-checked`,
        disabled() && `${prefixCls()}-disabled`,
        hashId(),
        local.rootClass,
        local.class,
        semanticClassNames().root,
        semanticClassNames().wrapper,
      )}
      style={{ ...local.style, ...semanticStyles().root, ...semanticStyles().wrapper }}
      title={local.title}
    >
      <input
        {...rest}
        ref={(el) => {
          inputRef = el
        }}
        type="radio"
        class={classNames(
          `${prefixCls()}-input`,
          semanticClassNames().icon,
          semanticClassNames().input,
        )}
        style={{ ...semanticStyles().icon, ...semanticStyles().input }}
        disabled={disabled()}
        checked={checked()}
        value={local.value == null ? undefined : String(local.value)}
        name={rest.name ?? groupContext()?.name()}
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
          const currentGroup = groupContext()
          if (currentGroup && local.value !== undefined)
            currentGroup.updateValue(local.value, event)
          else if (local.checked === undefined) setInnerChecked(true)
          callHandler(local.onChange, event)
          if (local.checked !== undefined || currentGroup) event.currentTarget.checked = checked()
        }}
      />
      <span class={semanticClassNames().label} style={semanticStyles().label}>
        {local.children}
      </span>
    </label>
  )
}

export function RadioButton(props: RadioProps) {
  const config = useConfig()
  const group = useRadioGroupContext()
  createEffect(() => group?.registerButton())
  const buttonPrefixCls = () => `${config.prefixCls()}-radio-button-wrapper`
  return <RadioRoot {...props} prefixCls={props.prefixCls ?? buttonPrefixCls()} />
}

export type { RadioSemanticClassNames, RadioSemanticStyles }
