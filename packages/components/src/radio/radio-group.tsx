import { For, createEffect, createMemo, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form'
import { classNames } from '../shared/class-names'
import { normalizeOptions, type OptionValue } from '../shared/options'
import { RadioGroupContext } from './context'
import { RadioRoot } from './radio'
import { useRadioStyle } from './radio.style'
import type {
  RadioGroupProps,
  RadioGroupSemanticClassNames,
  RadioGroupSemanticStyles,
} from './interface'

let groupNameSeed = 0

function nextGroupName() {
  groupNameSeed += 1
  return `radio-group-${groupNameSeed}`
}

function resolveClassNames(props: RadioGroupProps): Partial<Record<'wrapper', string>> {
  if (typeof props.classNames === 'function') return props.classNames({ props })
  return props.classNames ?? {}
}

function resolveStyles(props: RadioGroupProps): Partial<Record<'wrapper', JSX.CSSProperties>> {
  if (typeof props.styles === 'function') return props.styles({ props })
  return props.styles ?? {}
}

export function RadioGroup(props: RadioGroupProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'options',
    'disabled',
    'optionType',
    'buttonStyle',
    'block',
    'name',
    'orientation',
    'vertical',
    'size',
    'prefixCls',
    'children',
    'class',
    'style',
    'classNames',
    'styles',
    'onChange',
    'onBlur',
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
  const fallbackName = nextGroupName()
  const radioPrefixCls = () => local.prefixCls ?? `${config.prefixCls()}-radio`
  const groupPrefixCls = () => `${radioPrefixCls()}-group`
  const [, hashId] = useRadioStyle(radioPrefixCls())
  const [innerValue, setInnerValue] = createSignal<OptionValue | undefined>(local.defaultValue)
  const [restoreTick, setRestoreTick] = createSignal(0)
  const [buttonChildCount, setButtonChildCount] = createSignal(0)
  const disabled = () => local.disabled ?? formItem?.disabled?.() ?? false
  const size = () => local.size ?? formItem?.size?.()
  const isButton = () => local.optionType === 'button'
  const hasButtonChildren = () => buttonChildCount() > 0
  const isButtonCompact = () => isButton() || hasButtonChildren()
  const buttonStyle = () => local.buttonStyle ?? 'outline'
  const orientation = () => local.orientation ?? (local.vertical ? 'vertical' : 'horizontal')
  const semanticClassNames = createMemo(() => resolveClassNames(props))
  const semanticStyles = createMemo(() => resolveStyles(props))

  createEffect(() => {
    const formValue = formItem?.value()
    if (formItem && formItem.trigger() !== 'onChange')
      setInnerValue(formValue as OptionValue | undefined)
  })

  const value = () => {
    const formValue = formItem?.value()
    if (formItem && formItem.trigger() === 'onChange') return formValue as OptionValue | undefined
    if (local.value !== undefined) return local.value
    return innerValue()
  }

  function updateValue(
    nextValue: OptionValue,
    event?: Event & { currentTarget: HTMLInputElement; target: Element },
  ): void {
    if (local.value === undefined && formItem?.trigger() !== 'onChange') setInnerValue(nextValue)
    else setRestoreTick((tick) => tick + 1)
    local.onChange?.(nextValue)
    if (event) event.currentTarget.checked = value() === nextValue
    if (formItem?.trigger() === 'onChange') formItem.setFieldValueFromControl(nextValue)
  }

  function handleBlur(
    event: FocusEvent & { currentTarget: HTMLDivElement; target: Element },
  ): void {
    ;(local.onBlur as JSX.EventHandler<HTMLDivElement, FocusEvent> | undefined)?.(event)
    const nextFocused = event.relatedTarget
    if (
      formItem?.trigger() === 'onBlur' &&
      !(nextFocused instanceof Node && event.currentTarget.contains(nextFocused))
    )
      formItem.setFieldValueFromControl(value())
  }

  const context = {
    value,
    disabled,
    name: () => local.name ?? fallbackName,
    isButton,
    registerButton: () => setButtonChildCount((count) => count + 1),
    restoreTick,
    updateValue,
  }

  return (
    <div
      {...rest}
      class={classNames(
        groupPrefixCls(),
        isButtonCompact() && `${groupPrefixCls()}-button`,
        isButtonCompact() && `${groupPrefixCls()}-button-compact`,
        local.block && `${groupPrefixCls()}-block`,
        `${groupPrefixCls()}-${orientation()}`,
        size() && `${groupPrefixCls()}-${size()}`,
        isButtonCompact() && `${groupPrefixCls()}-${buttonStyle()}`,
        hashId(),
        local.class,
        semanticClassNames().wrapper,
      )}
      style={{ ...(local.style as JSX.CSSProperties | undefined), ...semanticStyles().wrapper }}
      onFocusOut={handleBlur}
    >
      <RadioGroupContext.Provider value={context}>
        <For each={normalizeOptions(local.options)}>
          {(option) => (
            <RadioRoot
              checked={value() === option.value}
              disabled={disabled() || Boolean(option.disabled)}
              value={option.value}
              id={option.id}
              required={option.required}
              title={option.title}
              class={option.class}
              style={option.style}
              prefixCls={isButton() ? `${radioPrefixCls()}-button-wrapper` : radioPrefixCls()}
              onChange={option.onChange}
            >
              {option.label}
            </RadioRoot>
          )}
        </For>
        {local.children}
      </RadioGroupContext.Provider>
    </div>
  )
}

export type { RadioGroupSemanticClassNames, RadioGroupSemanticStyles }
