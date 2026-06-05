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
import type { MentionsOption, MentionsProps } from './interface'
import { useMentionsStyle } from './mentions.style'

interface ActiveMention {
  prefix: string
  start: number
  end: number
  search: string
}

function optionText(option: MentionsOption): string {
  if (typeof option.label === 'string' || typeof option.label === 'number')
    return String(option.label)
  return option.value
}

function defaultFilter(inputValue: string, option: MentionsOption): boolean {
  const search = inputValue.toLowerCase()
  return (
    option.value.toLowerCase().includes(search) || optionText(option).toLowerCase().includes(search)
  )
}

function normalizePrefixes(prefix: string | string[] | undefined): string[] {
  const prefixes = Array.isArray(prefix) ? prefix : [prefix ?? '@']
  return prefixes.filter((item) => item.length > 0).sort((a, b) => b.length - a.length)
}

function defaultValidateSearch(search: string): boolean {
  return !/\s/.test(search)
}

function findActiveMention(
  text: string,
  cursor: number,
  prefixes: string[],
  validateSearch: (search: string) => boolean,
): ActiveMention | undefined {
  const beforeCursor = text.slice(0, cursor)
  let found: ActiveMention | undefined

  for (const prefix of prefixes) {
    const start = beforeCursor.lastIndexOf(prefix)
    if (start < 0) continue

    const previous = start === 0 ? '' : beforeCursor[start - 1]
    if (previous && !/\s/.test(previous)) continue

    const search = beforeCursor.slice(start + prefix.length)
    if (!validateSearch(search)) continue

    if (!found || start > found.start) {
      found = { prefix, start, end: cursor, search }
    }
  }

  return found
}

export function Mentions(props: MentionsProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'open',
    'defaultOpen',
    'options',
    'prefix',
    'split',
    'placeholder',
    'disabled',
    'allowClear',
    'filterOption',
    'validateSearch',
    'prefixCls',
    'class',
    'style',
    'onChange',
    'onSelect',
    'onSearch',
    'onOpenChange',
    'onInput',
    'onFocus',
    'onKeyDown',
    'zIndex',
    'getPopupContainer',
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-mentions`
  const [, hashId] = useMentionsStyle(prefixCls())
  const [dropdownZIndex] = useZIndex('SelectLike', local.zIndex)
  const [innerValue, setInnerValue] = createSignal(local.defaultValue ?? '')
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [cursor, setCursor] = createSignal((local.defaultValue ?? '').length)
  const [dropdownPosition, setDropdownPosition] = createSignal<JSX.CSSProperties>({})
  let textareaRef: HTMLTextAreaElement | undefined
  let dropdownRef: HTMLDivElement | undefined

  createEffect(() => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() !== 'onChange')
      setInnerValue(String(formItem.value() ?? ''))
  })

  createEffect(() => {
    if (textareaRef) textareaRef.value = value()
  })

  const disabled = () => Boolean(local.disabled)
  const split = () => local.split ?? ' '
  const isValueControlled = () => 'value' in props
  const isOpenControlled = () => 'open' in props
  const value = () => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
      return String(formItem.value() ?? '')
    if (isValueControlled()) return local.value ?? ''
    return innerValue()
  }
  const validateSearch = (search: string) =>
    local.validateSearch ? local.validateSearch(search, props) : defaultValidateSearch(search)
  const activeMention = createMemo(() =>
    findActiveMention(value(), cursor(), normalizePrefixes(local.prefix), validateSearch),
  )
  function filterOptions(active: ActiveMention | undefined): MentionsOption[] {
    const options = local.options ?? []
    if (!active) return []
    const filter = local.filterOption
    if (filter === false) return options
    if (typeof filter === 'function')
      return options.filter((option) => filter(active.search, option))
    return options.filter((option) => defaultFilter(active.search, option))
  }

  const filteredOptions = createMemo(() => filterOptions(activeMention()))
  const popupOpen = () => {
    const nextOpen = isOpenControlled() ? Boolean(local.open) : innerOpen()
    return nextOpen && Boolean(activeMention()) && filteredOptions().length > 0
  }
  const enabledOptions = () => filteredOptions().filter((option) => !option.disabled)

  function updateDropdownPosition(): void {
    if (isServer) return
    if (!canUseDom() || !textareaRef) {
      setDropdownPosition({ 'z-index': `${dropdownZIndex}` })
      return
    }
    const rect = textareaRef.getBoundingClientRect()
    setDropdownPosition({
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      'z-index': `${dropdownZIndex}`,
    })
  }

  function containsPopupTarget(target: EventTarget | null): boolean {
    return Boolean(
      target instanceof Node &&
      ((textareaRef && textareaRef.contains(target)) ||
        (dropdownRef && dropdownRef.contains(target))),
    )
  }

  function setOpen(nextOpen: boolean): void {
    if (disabled() && nextOpen) return
    const normalizedOpen = nextOpen && Boolean(activeMention()) && filteredOptions().length > 0
    if (normalizedOpen) updateDropdownPosition()
    if (normalizedOpen) updateDropdownPosition()
    if (!isOpenControlled()) setInnerOpen(normalizedOpen)
    local.onOpenChange?.(normalizedOpen)
  }

  function setOpenForActive(nextOpen: boolean, active: ActiveMention | undefined): void {
    if (disabled() && nextOpen) return
    const normalizedOpen = nextOpen && Boolean(active) && filterOptions(active).length > 0
    if (!isOpenControlled()) setInnerOpen(normalizedOpen)
    local.onOpenChange?.(normalizedOpen)
  }

  createRenderEffect(() => {
    if (popupOpen()) updateDropdownPosition()
  })

  createEffect(() => {
    if (!popupOpen()) return
    const removeListeners = addPositionUpdateListeners(updateDropdownPosition)
    onCleanup(removeListeners)
  })

  createEffect(() => {
    if (!popupOpen()) return
    const removePointerDown = addDocumentPointerDown((event) => {
      if (!containsPopupTarget(event.target)) setOpen(false)
    })
    onCleanup(removePointerDown)
  })

  function changeValue(nextValue: string): void {
    if (
      !isValueControlled() &&
      !(formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
    ) {
      setInnerValue(nextValue)
    }
    local.onChange?.(nextValue)
    if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
      formItem.setFieldValueFromControl(nextValue)
  }

  function syncCursorFromTextarea(): void {
    if (textareaRef) setCursor(textareaRef.selectionStart ?? value().length)
  }

  function refreshSearch(nextValue: string, nextCursor: number): void {
    const active = findActiveMention(
      nextValue,
      nextCursor,
      normalizePrefixes(local.prefix),
      validateSearch,
    )
    if (active) local.onSearch?.(active.search, active.prefix)
    setOpenForActive(Boolean(active), active)
  }

  function selectOption(option: MentionsOption): void {
    const active = activeMention()
    if (disabled() || option.disabled || !active) return

    const before = value().slice(0, active.start)
    const after = value().slice(active.end)
    const nextValue = `${before}${active.prefix}${option.value}${split()}${after}`
    const nextCursor = before.length + active.prefix.length + option.value.length + split().length

    changeValue(nextValue)
    setCursor(nextCursor)
    local.onSelect?.(option, active.prefix)
    setOpen(false)
    queueMicrotask(() => {
      textareaRef?.focus()
      textareaRef?.setSelectionRange(nextCursor, nextCursor)
    })
  }

  function clearValue(event: MouseEvent): void {
    event.stopPropagation()
    changeValue('')
    setCursor(0)
    setOpen(false)
  }

  return (
    <div
      class={classNames(
        prefixCls(),
        disabled() && `${prefixCls()}-disabled`,
        popupOpen() && `${prefixCls()}-open`,
        hashId(),
        local.class,
      )}
      style={local.style}
    >
      <textarea
        {...rest}
        ref={(el) => {
          textareaRef = el
        }}
        class={`${prefixCls()}-textarea`}
        placeholder={local.placeholder}
        disabled={disabled()}
        value={value()}
        onFocus={(event) => {
          const selectionStart = textareaRef?.selectionStart ?? value().length
          const nextCursor =
            selectionStart === 0 && value().length > 0 ? value().length : selectionStart
          setCursor(nextCursor)
          refreshSearch(value(), nextCursor)
          ;(local.onFocus as JSX.EventHandler<HTMLTextAreaElement, FocusEvent> | undefined)?.(event)
        }}
        onInput={(event) => {
          if (disabled()) return
          const nextValue = event.currentTarget.value
          const selectionStart = event.currentTarget.selectionStart ?? nextValue.length
          const nextCursor =
            selectionStart === 0 && nextValue.length > 0 ? nextValue.length : selectionStart
          setCursor(nextCursor)
          changeValue(nextValue)
          refreshSearch(nextValue, nextCursor)
          ;(local.onInput as JSX.EventHandler<HTMLTextAreaElement, InputEvent> | undefined)?.(event)
        }}
        onClick={syncCursorFromTextarea}
        onKeyUp={syncCursorFromTextarea}
        onKeyDown={(event) => {
          ;(local.onKeyDown as JSX.EventHandler<HTMLTextAreaElement, KeyboardEvent> | undefined)?.(
            event,
          )
          if (event.key === 'Escape') {
            setOpen(false)
            return
          }
          if (event.key === 'Enter' && popupOpen()) {
            const first = enabledOptions()[0]
            if (first) {
              event.preventDefault()
              selectOption(first)
            }
          }
        }}
      />
      <Show when={local.allowClear && !disabled() && value()}>
        <button
          type="button"
          aria-label="clear mentions"
          class={`${prefixCls()}-clear`}
          onClick={clearValue}
        >
          ×
        </button>
      </Show>
      <Show when={popupOpen()}>
        <InternalPortal
          mount={() =>
            local.getPopupContainer?.(textareaRef) ?? config.getPopupContainer?.(textareaRef)
          }
        >
          <div
            role="listbox"
            ref={(element) => {
              dropdownRef = element
            }}
            class={`${prefixCls()}-dropdown`}
            style={dropdownPosition()}
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
                  onMouseDown={(event) => event.preventDefault()}
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
