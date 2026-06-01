import { For, createEffect, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form'
import { classNames } from '../shared/classNames'
import { normalizeOptions, type OptionValue } from '../shared/options'
import { RadioRoot } from './Radio'
import { useRadioStyle } from './radio.style'
import type { RadioGroupProps } from './interface'

export function RadioGroup(props: RadioGroupProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'options',
    'disabled',
    'optionType',
    'prefixCls',
    'children',
    'class',
    'style',
    'onChange',
    'onBlur',
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
  const radioPrefixCls = () => local.prefixCls ?? `${config.prefixCls()}-radio`
  const groupPrefixCls = () => `${radioPrefixCls()}-group`
  const [, hashId] = useRadioStyle(radioPrefixCls())
  const [innerValue, setInnerValue] = createSignal<OptionValue | undefined>(local.defaultValue)
  const disabled = () => Boolean(local.disabled)
  const isButton = () => local.optionType === 'button'

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

  function updateValue(nextValue: OptionValue): void {
    if (local.value === undefined && formItem?.trigger() !== 'onChange') setInnerValue(nextValue)
    local.onChange?.(nextValue)
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

  return (
    <div
      {...rest}
      class={classNames(
        groupPrefixCls(),
        isButton() && `${groupPrefixCls()}-button`,
        hashId(),
        local.class,
      )}
      style={local.style}
      onFocusOut={handleBlur}
    >
      <For each={normalizeOptions(local.options)}>
        {(option) => (
          <RadioRoot
            checked={value() === option.value}
            disabled={disabled() || Boolean(option.disabled)}
            value={option.value}
            prefixCls={isButton() ? `${radioPrefixCls()}-button-wrapper` : radioPrefixCls()}
            onChange={() => updateValue(option.value)}
          >
            {option.label}
          </RadioRoot>
        )}
      </For>
      {local.children}
    </div>
  )
}
