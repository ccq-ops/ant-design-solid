import {
  For,
  Show,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  onCleanup,
  splitProps,
} from 'solid-js'
import type { JSX } from 'solid-js'
import { isServer } from 'solid-js/web'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form'
import { classNames } from '../shared/class-names'
import { addPositionUpdateListeners } from '../shared/overlay'
import { InternalPortal, canUseDom } from '../shared/portal'
import { useZIndex } from '../shared/z-index'
import { useAutoCompleteStyle } from './auto-complete.style'
import type { AutoCompleteOption, AutoCompleteProps } from './interface'

function optionText(option: AutoCompleteOption): string {
  if (typeof option.label === 'string' || typeof option.label === 'number')
    return String(option.label)
  return option.value
}

function defaultFilter(inputValue: string, option: AutoCompleteOption): boolean {
  const search = inputValue.toLowerCase()
  return (
    option.value.toLowerCase().includes(search) || optionText(option).toLowerCase().includes(search)
  )
}

export function AutoComplete(props: AutoCompleteProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'open',
    'defaultOpen',
    'options',
    'placeholder',
    'disabled',
    'allowClear',
    'filterOption',
    'prefixCls',
    'class',
    'style',
    'onChange',
    'onSelect',
    'onOpenChange',
    'onKeyDown',
    'zIndex',
    'getPopupContainer',
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-auto-complete`
  const [, hashId] = useAutoCompleteStyle(prefixCls())
  const [dropdownZIndex] = useZIndex('SelectLike', local.zIndex)
  const [innerValue, setInnerValue] = createSignal(local.defaultValue ?? '')
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [inputFocused, setInputFocused] = createSignal(Boolean(local.defaultOpen))
  const [dropdownPosition, setDropdownPosition] = createSignal<JSX.CSSProperties>({})
  let selectorRef: HTMLDivElement | undefined

  createEffect(() => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() !== 'onChange')
      setInnerValue(String(formItem.value() ?? ''))
  })

  const disabled = () => Boolean(local.disabled)
  const isValueControlled = () => 'value' in props
  const isOpenControlled = () => 'open' in props
  const value = () => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
      return String(formItem.value() ?? '')
    if (isValueControlled()) return local.value ?? ''
    return innerValue()
  }
  const open = () => (isOpenControlled() ? Boolean(local.open) : innerOpen())
  const filteredOptions = createMemo(() => {
    const options = local.options ?? []
    const filter = local.filterOption
    if (open() && inputFocused() && filter === undefined) return options
    if (filter === false) return options
    if (typeof filter === 'function') return options.filter((option) => filter(value(), option))
    return options.filter((option) => defaultFilter(value(), option))
  })
  const enabledOptions = () => filteredOptions().filter((option) => !option.disabled)

  function updateDropdownPosition(): void {
    if (isServer) return
    if (!canUseDom() || !selectorRef) {
      setDropdownPosition({ 'z-index': `${dropdownZIndex}` })
      return
    }
    const rect = selectorRef.getBoundingClientRect()
    setDropdownPosition({
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      'z-index': `${dropdownZIndex}`,
    })
  }

  function setOpen(nextOpen: boolean): void {
    if (disabled()) return
    const normalizedOpen = nextOpen && filteredOptions().length > 0
    if (normalizedOpen) updateDropdownPosition()
    if (!isOpenControlled()) setInnerOpen(normalizedOpen)
    local.onOpenChange?.(normalizedOpen)
  }

  createRenderEffect(() => {
    if (open()) updateDropdownPosition()
  })

  createEffect(() => {
    if (!open()) return
    const removeListeners = addPositionUpdateListeners(updateDropdownPosition)
    onCleanup(removeListeners)
  })

  function changeValue(nextValue: string): void {
    if (
      !isValueControlled() &&
      !(formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
    )
      setInnerValue(nextValue)
    local.onChange?.(nextValue)
    if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
      formItem.setFieldValueFromControl(nextValue)
  }

  function selectOption(option: AutoCompleteOption): void {
    if (disabled() || option.disabled) return
    changeValue(option.value)
    local.onSelect?.(option.value, option)
    setOpen(false)
  }

  function handleInput(event: InputEvent & { currentTarget: HTMLInputElement; target: Element }) {
    changeValue(event.currentTarget.value)
    if (!disabled()) setOpen(true)
  }

  function clearValue(event: MouseEvent): void {
    event.stopPropagation()
    changeValue('')
    setOpen(false)
  }

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        disabled() && `${prefixCls()}-disabled`,
        open() && `${prefixCls()}-open`,
        hashId(),
        local.class,
      )}
      style={local.style}
    >
      <div
        ref={(element) => {
          selectorRef = element
        }}
        class={`${prefixCls()}-selector`}
        onClick={() => !disabled() && setOpen(true)}
      >
        <input
          role="combobox"
          aria-expanded={open()}
          aria-disabled={disabled()}
          disabled={disabled()}
          class={`${prefixCls()}-input`}
          placeholder={local.placeholder}
          value={value()}
          onFocus={() => {
            setInputFocused(true)
            setOpen(true)
          }}
          onInput={(event) => {
            setInputFocused(false)
            handleInput(event)
          }}
          onKeyDown={(event) => {
            ;(local.onKeyDown as JSX.EventHandler<HTMLDivElement, KeyboardEvent> | undefined)?.(
              event,
            )
            if (event.key === 'Escape') setOpen(false)
            if (event.key === 'Enter' && open()) {
              const first = enabledOptions()[0]
              if (first) selectOption(first)
            }
          }}
        />
        <Show when={local.allowClear && !disabled() && value()}>
          <button
            type="button"
            aria-label="clear autocomplete"
            class={`${prefixCls()}-clear`}
            onClick={clearValue}
          >
            ×
          </button>
        </Show>
      </div>
      <Show when={open()}>
        <InternalPortal mount={() => local.getPopupContainer?.(selectorRef) ?? config.getPopupContainer?.(selectorRef)}>
          <div role="listbox" class={`${prefixCls()}-dropdown`} style={dropdownPosition()}>
            <For each={filteredOptions()}>
              {(option) => (
                <div
                  role="option"
                  aria-disabled={Boolean(option.disabled)}
                  class={classNames(
                    `${prefixCls()}-item`,
                    option.disabled && `${prefixCls()}-item-disabled`,
                  )}
                  onClick={() => selectOption(option)}
                >
                  {option.label ?? option.value}
                </div>
              )}
            </For>
          </div>
        </InternalPortal>
      </Show>
    </div>
  )
}
