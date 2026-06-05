import { CloseCircleFilled } from '@ant-design-solid/icons'
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
import { addDocumentPointerDown, addPositionUpdateListeners } from '../shared/overlay'
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
  const dropdownNode = () => (
    <div
      role="listbox"
      ref={(element) => {
        dropdownRef = element
      }}
      class={`${prefixCls()}-dropdown`}
      style={dropdownPosition()}
      onScroll={(event) => local.onPopupScroll?.(event)}
    >
      <Show
        when={filteredOptions().length > 0}
        fallback={<div class={`${prefixCls()}-empty`}>{local.notFoundContent}</div>}
      >
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
      </Show>
    </div>
  )

  const renderedDropdownNode = () => {
    const node = dropdownNode()
    return local.popupRender ? local.popupRender(node) : node
  }

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
    'size',
    'status',
    'variant',
    'showSearch',
    'defaultActiveFirstOption',
    'backfill',
    'notFoundContent',
    'popupMatchSelectWidth',
    'popupRender',
    'onClear',
    'onInputKeyDown',
    'onPopupScroll',
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
  let dropdownRef: HTMLDivElement | undefined

  createEffect(() => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() !== 'onChange')
      setInnerValue(String(formItem.value() ?? ''))
  })

  const disabled = () => Boolean(local.disabled)
  const allowClear = () => Boolean(local.allowClear)
  const clearIcon = () =>
    typeof local.allowClear === 'object' && local.allowClear.clearIcon
      ? local.allowClear.clearIcon
      : <CloseCircleFilled />
  const isValueControlled = () => 'value' in props
  const isOpenControlled = () => 'open' in props
  const value = () => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
      return String(formItem.value() ?? '')
    if (isValueControlled()) return local.value ?? ''
    return innerValue()
  }
  const open = () => (isOpenControlled() ? Boolean(local.open) : innerOpen())
  const showSearchConfig = () => (typeof local.showSearch === 'object' ? local.showSearch : undefined)
  const mergedFilterOption = () => showSearchConfig()?.filterOption ?? local.filterOption
  const filteredOptions = createMemo(() => {
    const options = local.options ?? []
    const filter = mergedFilterOption()
    if (open() && inputFocused() && filter === undefined) return options
    if (filter === false) return options
    if (typeof filter === 'function') return options.filter((option) => filter(value(), option))
    return options.filter((option) => defaultFilter(value(), option))
  })
  const enabledOptions = () => filteredOptions().filter((option) => !option.disabled)
  const hasNotFoundContent = () =>
    local.notFoundContent !== undefined && local.notFoundContent !== null
  const hasPopupContent = () => filteredOptions().length > 0 || hasNotFoundContent()

  function updateDropdownPosition(): void {
    if (isServer) return
    if (!canUseDom() || !selectorRef) {
      setDropdownPosition({ 'z-index': `${dropdownZIndex}` })
      return
    }
    const rect = selectorRef.getBoundingClientRect()
    const matchWidth = local.popupMatchSelectWidth ?? true
    const width =
      typeof matchWidth === 'number'
        ? `${Math.max(rect.width, matchWidth)}px`
        : matchWidth === false
          ? undefined
          : `${rect.width}px`
    setDropdownPosition({
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      ...(width ? { width } : {}),
      'z-index': `${dropdownZIndex}`,
    })
  }

  function containsPopupTarget(target: EventTarget | null): boolean {
    return Boolean(
      target instanceof Node &&
      ((selectorRef && selectorRef.contains(target)) ||
        (dropdownRef && dropdownRef.contains(target))),
    )
  }

  function setOpen(nextOpen: boolean): void {
    if (disabled() && nextOpen) return
    const normalizedOpen = nextOpen && hasPopupContent()
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

  createEffect(() => {
    if (!open()) return
    const removePointerDown = addDocumentPointerDown((event) => {
      if (!containsPopupTarget(event.target)) setOpen(false)
    })
    onCleanup(removePointerDown)
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
    local.onClear?.()
  }

  function handleInput(event: InputEvent & { currentTarget: HTMLInputElement; target: Element }) {
    const nextValue = event.currentTarget.value
    changeValue(nextValue)
    showSearchConfig()?.onSearch?.(nextValue)
    if (!disabled()) setOpen(true)
  }

  function clearValue(event: MouseEvent): void {
    event.stopPropagation()
    changeValue('')
    setOpen(false)
    local.onClear?.()
  }

  const dropdownNode = () => (
    <div
      role="listbox"
      ref={(element) => {
        dropdownRef = element
      }}
      class={`${prefixCls()}-dropdown`}
      style={dropdownPosition()}
      onScroll={(event) => local.onPopupScroll?.(event)}
    >
      <Show
        when={filteredOptions().length > 0}
        fallback={<div class={`${prefixCls()}-empty`}>{local.notFoundContent}</div>}
      >
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
      </Show>
    </div>
  )

  const renderedDropdownNode = () => {
    const node = dropdownNode()
    return local.popupRender ? local.popupRender(node) : node
  }

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        disabled() && `${prefixCls()}-disabled`,
        open() && `${prefixCls()}-open`,
        local.size && `${prefixCls()}-${local.size}`,
        local.status && `${prefixCls()}-status-${local.status}`,
        `${prefixCls()}-${local.variant ?? 'outlined'}`,
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
        <Show when={allowClear() && !disabled() && value()}>
          <button
            type="button"
            aria-label="clear autocomplete"
            class={`${prefixCls()}-clear`}
            onClick={clearValue}
          >
            {clearIcon()}
          </button>
        </Show>
      </div>
      <Show when={open()}>
        <InternalPortal
          mount={() =>
            local.getPopupContainer?.(selectorRef) ?? config.getPopupContainer?.(selectorRef)
          }
        >
          {renderedDropdownNode()}
        </InternalPortal>
      </Show>
    </div>
  )
}
