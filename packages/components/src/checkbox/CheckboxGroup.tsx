import { For, createEffect, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form'
import { classNames } from '../shared/classNames'
import { normalizeOptions, type OptionValue } from '../shared/options'
import { CheckboxRoot } from './Checkbox'
import { useCheckboxStyle } from './checkbox.style'
import type { CheckboxGroupProps } from './interface'

function includesValue(values: OptionValue[], value: OptionValue): boolean {
  return values.some((item) => item === value)
}

export function CheckboxGroup(props: CheckboxGroupProps) {
  const [local, rest] = splitProps(props, ['value', 'defaultValue', 'options', 'disabled', 'prefixCls', 'children', 'class', 'style', 'onChange', 'onBlur'])
  const config = useConfig()
  const formItem = useFormItemControl()
  const checkboxPrefixCls = () => local.prefixCls ?? `${config.prefixCls()}-checkbox`
  const groupPrefixCls = () => `${checkboxPrefixCls()}-group`
  const [, hashId] = useCheckboxStyle(checkboxPrefixCls())
  const [innerValue, setInnerValue] = createSignal<OptionValue[]>(local.defaultValue ?? [])
  const disabled = () => Boolean(local.disabled)

  createEffect(() => {
    const formValue = formItem?.value()
    if (formItem && formItem.trigger() !== 'onChange') setInnerValue(Array.isArray(formValue) ? (formValue as OptionValue[]) : [])
  })

  const value = () => {
    const formValue = formItem?.value()
    if (formItem && formItem.trigger() === 'onChange') return Array.isArray(formValue) ? (formValue as OptionValue[]) : []
    if (local.value !== undefined) return local.value
    return innerValue()
  }

  function updateValue(optionValue: OptionValue, nextChecked: boolean): void {
    const current = value()
    const withoutValue = current.filter((item) => item !== optionValue)
    const nextValue = nextChecked ? [...withoutValue, optionValue] : withoutValue
    if (local.value === undefined && formItem?.trigger() !== 'onChange') setInnerValue(nextValue)
    local.onChange?.(nextValue)
    if (formItem?.trigger() === 'onChange') formItem.setFieldValueFromControl(nextValue)
  }

  function handleBlur(event: FocusEvent & { currentTarget: HTMLDivElement; target: Element }): void {
    ;(local.onBlur as JSX.EventHandler<HTMLDivElement, FocusEvent> | undefined)?.(event)
    const nextFocused = event.relatedTarget
    if (formItem?.trigger() === 'onBlur' && !(nextFocused instanceof Node && event.currentTarget.contains(nextFocused))) formItem.setFieldValueFromControl(value())
  }

  return (
    <div {...rest} class={classNames(groupPrefixCls(), hashId(), local.class)} style={local.style} onFocusOut={handleBlur}>
      <For each={normalizeOptions(local.options)}>
        {(option) => (
          <CheckboxRoot
            checked={includesValue(value(), option.value)}
            disabled={disabled() || Boolean(option.disabled)}
            prefixCls={checkboxPrefixCls()}
            onChange={(event) => updateValue(option.value, event.currentTarget.checked)}
          >
            {option.label}
          </CheckboxRoot>
        )}
      </For>
      {local.children}
    </div>
  )
}
