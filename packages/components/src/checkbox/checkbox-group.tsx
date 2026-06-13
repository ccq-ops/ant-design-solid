import { For, createEffect, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form'
import { classNames } from '../shared/class-names'
import { normalizeOptions, type OptionValue } from '../shared/options'
import { CheckboxGroupContext, callRef } from './context'
import { CheckboxRoot } from './checkbox'
import { useCheckboxStyle } from './checkbox.style'
import type { CheckboxGroupProps } from './interface'

function includesValue(values: OptionValue[], value: OptionValue): boolean {
  return values.some((item) => item === value)
}

export function CheckboxGroup(props: CheckboxGroupProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'options',
    'disabled',
    'name',
    'prefixCls',
    'children',
    'class',
    'style',
    'ref',
    'onChange',
    'onBlur',
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
  const checkboxPrefixCls = () => local.prefixCls ?? `${config.prefixCls()}-checkbox`
  const groupPrefixCls = () => `${checkboxPrefixCls()}-group`
  const [, hashId] = useCheckboxStyle(checkboxPrefixCls())
  const [innerValue, setInnerValue] = createSignal<OptionValue[]>(local.defaultValue ?? [])
  const [registeredValues, setRegisteredValues] = createSignal<OptionValue[]>([])
  const disabled = () => local.disabled ?? formItem?.disabled?.() ?? false
  let groupRef: HTMLDivElement | undefined

  const checkboxGroupRef = {
    get nativeElement() {
      return groupRef
    },
  }
  callRef(local.ref, checkboxGroupRef)

  createEffect(() => {
    const formValue = formItem?.value()
    if (formItem && formItem.trigger() !== 'onChange')
      setInnerValue(Array.isArray(formValue) ? (formValue as OptionValue[]) : [])
  })

  const value = () => {
    const formValue = formItem?.value()
    if (formItem && formItem.trigger() === 'onChange')
      return Array.isArray(formValue) ? (formValue as OptionValue[]) : []
    if (local.value !== undefined) return local.value
    return innerValue()
  }

  function orderedRegisteredValues(nextValue: OptionValue[]): OptionValue[] {
    const registered = registeredValues()
    const normalizedOptions = normalizeOptions(local.options)
    return nextValue
      .filter((item) => registered.includes(item))
      .sort((a, b) => {
        const indexA = normalizedOptions.findIndex((option) => option.value === a)
        const indexB = normalizedOptions.findIndex((option) => option.value === b)
        if (indexA !== -1 || indexB !== -1) return indexA - indexB
        return registered.indexOf(a) - registered.indexOf(b)
      })
  }

  function updateValue(optionValue: OptionValue, nextChecked: boolean): void {
    const current = value()
    const withoutValue = current.filter((item) => item !== optionValue)
    const nextValue = nextChecked ? [...withoutValue, optionValue] : withoutValue
    const changedValue = orderedRegisteredValues(nextValue)
    if (local.value === undefined && formItem?.trigger() !== 'onChange') setInnerValue(changedValue)
    local.onChange?.(changedValue)
    if (formItem?.trigger() === 'onChange') formItem.setFieldValueFromControl(changedValue)
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

  return (
    <div
      {...rest}
      ref={(el) => {
        groupRef = el
      }}
      class={classNames(groupPrefixCls(), hashId(), local.class)}
      style={local.style}
      role={rest.role ?? 'group'}
      onFocusOut={handleBlur}
    >
      <CheckboxGroupContext.Provider
        value={{
          value,
          disabled,
          name: () => local.name,
          registerValue: (optionValue) =>
            setRegisteredValues((values) =>
              values.includes(optionValue) ? values : [...values, optionValue],
            ),
          cancelValue: (optionValue) =>
            setRegisteredValues((values) => values.filter((item) => item !== optionValue)),
          updateValue,
        }}
      >
        <For each={normalizeOptions(local.options)}>
          {(option) => (
            <CheckboxRoot
              checked={includesValue(value(), option.value)}
              disabled={disabled() || Boolean(option.disabled)}
              value={option.value}
              id={option.id}
              required={option.required}
              title={option.title}
              class={option.class}
              style={option.style}
              prefixCls={checkboxPrefixCls()}
              onChange={option.onChange}
            >
              {option.label}
            </CheckboxRoot>
          )}
        </For>
        {local.children}
      </CheckboxGroupContext.Provider>
    </div>
  )
}
