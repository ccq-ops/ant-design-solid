import { For, Show, createEffect, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form'
import { classNames } from '../shared/classNames'
import { normalizeOptions, type LabeledOption, type OptionValue } from '../shared/options'
import { useSelectStyle } from './select.style'
import type { SelectProps } from './interface'

function findOption(options: LabeledOption[], value: OptionValue | undefined): LabeledOption | undefined {
  return options.find((option) => option.value === value)
}

export function Select(props: SelectProps) {
  const [local, rest] = splitProps(props, ['value', 'defaultValue', 'open', 'defaultOpen', 'options', 'placeholder', 'disabled', 'allowClear', 'prefixCls', 'class', 'style', 'onChange', 'onOpenChange', 'onKeyDown'])
  const config = useConfig()
  const formItem = useFormItemControl()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-select`
  const [, hashId] = useSelectStyle(prefixCls())
  const [innerValue, setInnerValue] = createSignal<OptionValue | undefined>(local.defaultValue)
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))

  createEffect(() => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() !== 'onChange') setInnerValue(formItem.value() as OptionValue | undefined)
  })

  const disabled = () => Boolean(local.disabled)
  const options = () => normalizeOptions(local.options)
  const value = () => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange') return formItem.value() as OptionValue | undefined
    if (local.value !== undefined) return local.value
    return innerValue()
  }
  const open = () => (local.open !== undefined ? Boolean(local.open) : innerOpen())
  const selectedOption = () => findOption(options(), value())

  function setOpen(nextOpen: boolean): void {
    if (disabled()) return
    if (local.open === undefined) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
  }

  function changeValue(nextValue: OptionValue | undefined, option: LabeledOption | undefined): void {
    if (local.value === undefined && !(formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')) setInnerValue(nextValue)
    local.onChange?.(nextValue, option)
    if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange') formItem.setFieldValueFromControl(nextValue)
  }

  function selectOption(option: LabeledOption): void {
    if (option.disabled) return
    changeValue(option.value, option)
    setOpen(false)
  }

  function selectFirstEnabled(): void {
    const first = options().find((option) => !option.disabled)
    if (first) selectOption(first)
  }

  return (
    <div {...rest} class={classNames(prefixCls(), disabled() && `${prefixCls()}-disabled`, open() && `${prefixCls()}-open`, hashId(), local.class)} style={local.style}>
      <div
        role="combobox"
        tabindex={disabled() ? undefined : 0}
        aria-expanded={open()}
        aria-disabled={disabled()}
        class={`${prefixCls()}-selector`}
        onClick={() => setOpen(!open())}
        onFocusOut={(event) => {
          const nextFocused = event.relatedTarget
          if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onBlur' && !(nextFocused instanceof Node && event.currentTarget.contains(nextFocused))) {
            formItem.setFieldValueFromControl(value())
          }
        }}
        onKeyDown={(event) => {
          ;(local.onKeyDown as JSX.EventHandler<HTMLDivElement, KeyboardEvent> | undefined)?.(event)
          if (event.key === 'Escape') setOpen(false)
          if (event.key === 'Enter' && open()) selectFirstEnabled()
        }}
      >
        <span class={selectedOption() ? `${prefixCls()}-selection-item` : `${prefixCls()}-placeholder`}>{selectedOption()?.label ?? local.placeholder}</span>
        <Show when={local.allowClear && !disabled() && value() !== undefined}>
          <button
            type="button"
            aria-label="clear selection"
            class={`${prefixCls()}-clear`}
            onClick={(event) => {
              event.stopPropagation()
              changeValue(undefined, undefined)
            }}
          >
            ×
          </button>
        </Show>
      </div>
      <Show when={open()}>
        <div role="listbox" class={`${prefixCls()}-dropdown`}>
          <For each={options()}>
            {(option) => (
              <div
                role="option"
                aria-selected={value() === option.value}
                aria-disabled={Boolean(option.disabled)}
                class={classNames(
                  `${prefixCls()}-item`,
                  value() === option.value && `${prefixCls()}-item-option-selected`,
                  option.disabled && `${prefixCls()}-item-option-disabled`,
                )}
                onClick={() => selectOption(option)}
              >
                {option.label}
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
