import { CloseCircleFilled } from '@ant-design-solid/icons'
import {
  For,
  Show,
  children as resolveChildren,
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
import { Empty } from '../empty'
import { Spin } from '../spin'
import {
  applyExceedFormatter,
  formatCount,
  getAllowClearConfig,
  getCount,
  getMaxLength,
  shouldShowCount,
} from '../input/utils'
import { classNames } from '../shared/class-names'
import { addDocumentPointerDown, addPositionUpdateListeners } from '../shared/overlay'
import { InternalPortal, canUseDom } from '../shared/portal'
import { useZIndex } from '../shared/z-index'
import type {
  MentionsConfig,
  MentionsEntity,
  MentionsOption,
  MentionsOptionProps,
  MentionsProps,
} from './interface'
import { useMentionsStyle } from './mentions.style'

const OPTION_MARK = '__ANT_DESIGN_SOLID_MENTIONS_OPTION__'
const textareaLineHeight = 24
const popupTriggerOffset = 2

function mergeStyle(
  ...styles: Array<JSX.CSSProperties | undefined>
): JSX.CSSProperties | undefined {
  return Object.assign({}, ...styles.filter(Boolean))
}

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

function getAutoSizeConfig(autoSize: MentionsProps['autoSize']) {
  if (!autoSize) return undefined
  return typeof autoSize === 'object' ? autoSize : {}
}

function getWindowHeight(): number {
  if (typeof window === 'undefined') return 0
  return window.innerHeight || document.documentElement.clientHeight || 0
}

function copyTextareaStyles(textarea: HTMLTextAreaElement, mirror: HTMLDivElement): void {
  const style = window.getComputedStyle(textarea)
  const properties = [
    'box-sizing',
    'width',
    'height',
    'overflow-x',
    'overflow-y',
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'letter-spacing',
    'line-height',
    'text-transform',
    'text-align',
    'white-space',
    'word-break',
    'word-wrap',
    'tab-size',
  ]

  for (const property of properties) {
    mirror.style.setProperty(property, style.getPropertyValue(property))
  }
}

function measureTextAreaPosition(
  textarea: HTMLTextAreaElement,
  index: number,
): { left: number; top: number; bottom: number } | undefined {
  if (!canUseDom()) return undefined
  const rect = textarea.getBoundingClientRect()
  const mirror = document.createElement('div')
  mirror.setAttribute('data-mentions-measure', 'true')
  copyTextareaStyles(textarea, mirror)
  mirror.style.position = 'fixed'
  mirror.style.visibility = 'hidden'
  mirror.style.pointerEvents = 'none'
  mirror.style.left = `${rect.left}px`
  mirror.style.top = `${rect.top}px`
  mirror.style.zIndex = '-1'
  mirror.style.whiteSpace = 'pre-wrap'
  mirror.style.overflowWrap = 'break-word'
  mirror.textContent = textarea.value.slice(0, index)

  const marker = document.createElement('span')
  marker.setAttribute('data-mentions-caret', 'true')
  marker.textContent = '\u200b'
  mirror.appendChild(marker)
  document.body.appendChild(mirror)
  mirror.scrollTop = textarea.scrollTop
  mirror.scrollLeft = textarea.scrollLeft

  const markerRect = marker.getBoundingClientRect()
  const position = {
    left: markerRect.left,
    top: markerRect.top,
    bottom: markerRect.bottom,
  }
  document.body.removeChild(mirror)
  return position
}

function normalizeOptionMarker(node: unknown): MentionsOption | undefined {
  if (!node || typeof node !== 'object') return undefined
  const record = node as Record<string, unknown>
  if (!record[OPTION_MARK]) return undefined
  const props = record.props as MentionsOptionProps | undefined
  if (!props) return undefined
  return {
    ...props,
    label: props.label ?? props.children,
  } as MentionsOption
}

function optionsFromChildren(childrenValue: JSX.Element | undefined): MentionsOption[] {
  const resolved = resolveChildren(() => childrenValue)
  return resolved.toArray().map(normalizeOptionMarker).filter(Boolean) as MentionsOption[]
}

function mergedOptions(
  options: MentionsOption[] | undefined,
  childrenValue: JSX.Element | undefined,
) {
  const childOptions = optionsFromChildren(childrenValue)
  return options ?? childOptions
}

function isRecordRef(
  ref: MentionsProps['ref'],
): ref is { current?: import('./interface').MentionsRef } {
  return Boolean(ref && typeof ref === 'object')
}

export function Option(props: MentionsOptionProps): JSX.Element {
  return { [OPTION_MARK]: true, props } as unknown as JSX.Element
}

export function getMentions(value = '', config: MentionsConfig = {}): MentionsEntity[] {
  const prefix = config.prefix ?? '@'
  const split = config.split ?? ' '
  const prefixList = Array.isArray(prefix) ? prefix : [prefix]
  return value.split(split).reduce<MentionsEntity[]>((list, part = '') => {
    const hitPrefix = prefixList.find((prefixItem) => part.startsWith(prefixItem))
    if (!hitPrefix) return list
    const entityValue = part.slice(hitPrefix.length)
    if (entityValue) list.push({ prefix: hitPrefix, value: entityValue })
    return list
  }, [])
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

function MentionsRoot(props: MentionsProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'open',
    'defaultOpen',
    'options',
    'children',
    'prefix',
    'split',
    'placeholder',
    'disabled',
    'size',
    'status',
    'variant',
    'allowClear',
    'loading',
    'notFoundContent',
    'placement',
    'rootClass',
    'popupClass',
    'showCount',
    'count',
    'autoSize',
    'classNames',
    'styles',
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
    'onBlur',
    'onKeyDown',
    'onPressEnter',
    'onClear',
    'onResize',
    'onPopupScroll',
    'zIndex',
    'getPopupContainer',
    'ref',
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-mentions`
  const [, hashId] = useMentionsStyle(prefixCls())
  const [dropdownZIndex] = useZIndex('SelectLike', local.zIndex)
  const [innerValue, setInnerValue] = createSignal(local.defaultValue ?? '')
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [cursor, setCursor] = createSignal((local.defaultValue ?? '').length)
  const [activeValue, setActiveValue] = createSignal<string | undefined>()
  const [dropdownPosition, setDropdownPosition] = createSignal<JSX.CSSProperties>({})
  const [textareaSize, setTextareaSize] = createSignal({ width: 0, height: 0 })
  let rootRef: HTMLDivElement | undefined
  let textareaRef: HTMLTextAreaElement | undefined
  let dropdownRef: HTMLDivElement | undefined

  const mentionsRef = {
    focus: () => textareaRef?.focus(),
    blur: () => textareaRef?.blur(),
    get textarea() {
      return textareaRef
    },
    get nativeElement() {
      return rootRef
    },
  }

  createEffect(() => {
    if (typeof local.ref === 'function') local.ref(mentionsRef)
    else if (isRecordRef(local.ref)) {
      Object.assign(local.ref, mentionsRef)
      local.ref.current = mentionsRef
    }
  })

  createEffect(() => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() !== 'onChange')
      setInnerValue(String(formItem.value() ?? ''))
  })

  createEffect(() => {
    if (textareaRef) textareaRef.value = value()
  })

  const disabled = () => local.disabled ?? formItem?.disabled?.() ?? false
  const size = () => local.size ?? formItem?.size?.()
  const split = () => local.split ?? ' '
  const placement = () => local.placement ?? 'bottom'
  const variant = () => local.variant ?? formItem?.variant?.() ?? 'outlined'
  const allowClearConfig = () => getAllowClearConfig(local.allowClear)
  const showClear = () => Boolean(allowClearConfig() && !allowClearConfig()?.disabled && value())
  const autoSizeConfig = () => getAutoSizeConfig(local.autoSize)
  const rows = () => autoSizeConfig()?.minRows ?? rest.rows
  const isValueControlled = () => 'value' in props
  const isOpenControlled = () => 'open' in props
  const value = () => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
      return String(formItem.value() ?? '')
    if (isValueControlled()) return local.value ?? ''
    return innerValue()
  }
  const maxLength = () => getMaxLength(rest.maxLength, local.count)
  const characterCount = () => getCount(value(), local.count)
  const countInfo = () => ({ value: value(), count: characterCount(), maxLength: maxLength() })
  const allOptions = createMemo(() => mergedOptions(local.options, local.children))
  const validateSearch = (search: string) =>
    local.validateSearch ? local.validateSearch(search, props) : defaultValidateSearch(search)
  const activeMention = createMemo(() =>
    findActiveMention(value(), cursor(), normalizePrefixes(local.prefix), validateSearch),
  )
  function filterOptions(active: ActiveMention | undefined): MentionsOption[] {
    const options = allOptions()
    if (!active) return []
    if (local.loading)
      return [
        {
          label: (
            <span>
              <Spin size="small" /> Loading
            </span>
          ),
          value: 'ANTD_SEARCHING',
          disabled: true,
        },
      ]
    const filter = local.filterOption
    if (filter === false) return options
    if (typeof filter === 'function')
      return options.filter((option) => filter(active.search, option))
    return options.filter((option) => defaultFilter(active.search, option))
  }

  const filteredOptions = createMemo(() => filterOptions(activeMention()))
  const hasNotFoundContent = () =>
    local.notFoundContent !== undefined && local.notFoundContent !== null
  const hasPopupContent = () =>
    Boolean(activeMention()) && (filteredOptions().length > 0 || hasNotFoundContent())
  const popupOpen = () => {
    const nextOpen = isOpenControlled() ? Boolean(local.open) : innerOpen()
    return nextOpen && hasPopupContent()
  }
  const enabledOptions = () => filteredOptions().filter((option) => !option.disabled)
  const activeOption = createMemo(() =>
    enabledOptions().find((option) => option.value === activeValue()),
  )

  function setDefaultActiveOption(): void {
    const first = enabledOptions()[0]
    setActiveValue(first?.value)
  }

  function moveActiveOption(offset: 1 | -1): void {
    const options = enabledOptions()
    if (options.length === 0) {
      setActiveValue(undefined)
      return
    }
    const currentIndex = options.findIndex((option) => option.value === activeValue())
    const nextIndex =
      currentIndex === -1
        ? offset === 1
          ? 0
          : options.length - 1
        : (currentIndex + offset + options.length) % options.length
    setActiveValue(options[nextIndex].value)
  }

  function updateDropdownPosition(): void {
    if (isServer) return
    if (!canUseDom() || !textareaRef) {
      setDropdownPosition({ 'z-index': `${dropdownZIndex}` })
      return
    }
    const rect = textareaRef.getBoundingClientRect()
    const mention = activeMention()
    const mentionPosition = mention
      ? measureTextAreaPosition(textareaRef, mention.start)
      : undefined
    const basePosition =
      placement() === 'top'
        ? {
            bottom: `${Math.max(
              0,
              getWindowHeight() - (mentionPosition?.top ?? rect.top) + popupTriggerOffset,
            )}px`,
          }
        : { top: `${(mentionPosition?.bottom ?? rect.bottom) + popupTriggerOffset}px` }
    setDropdownPosition({
      position: 'fixed',
      ...basePosition,
      left: `${mentionPosition?.left ?? rect.left}px`,
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
    const normalizedOpen = nextOpen && hasPopupContent()
    if (normalizedOpen) {
      updateDropdownPosition()
      setDefaultActiveOption()
    } else {
      setActiveValue(undefined)
    }
    if (!isOpenControlled()) setInnerOpen(normalizedOpen)
    local.onOpenChange?.(normalizedOpen)
  }

  function setOpenForActive(nextOpen: boolean, active: ActiveMention | undefined): void {
    if (disabled() && nextOpen) return
    const activeOptions = filterOptions(active)
    const normalizedOpen =
      nextOpen && Boolean(active) && (activeOptions.length > 0 || hasNotFoundContent())
    if (normalizedOpen) setDefaultActiveOption()
    else setActiveValue(undefined)
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
    const formattedValue = applyExceedFormatter(nextValue, local.count)
    if (
      !isValueControlled() &&
      !(formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
    ) {
      setInnerValue(formattedValue)
    }
    local.onChange?.(formattedValue)
    if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
      formItem.setFieldValueFromControl(formattedValue)
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
    if (textareaRef) textareaRef.value = ''
    setCursor(0)
    setOpen(false)
    local.onClear?.()
  }

  function syncTextareaSize(): void {
    if (!textareaRef) return
    const nextSize = {
      width: textareaRef.offsetWidth,
      height: textareaRef.offsetHeight,
    }
    const previous = textareaSize()
    if (nextSize.width !== previous.width || nextSize.height !== previous.height) {
      setTextareaSize(nextSize)
      local.onResize?.(nextSize)
    }
  }

  createEffect(syncTextareaSize)

  createEffect(() => {
    if (!textareaRef || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(syncTextareaSize)
    observer.observe(textareaRef)
    onCleanup(() => observer.disconnect())
  })

  return (
    <div
      ref={(element) => {
        rootRef = element
      }}
      class={classNames(
        prefixCls(),
        disabled() && `${prefixCls()}-disabled`,
        popupOpen() && `${prefixCls()}-open`,
        size() && `${prefixCls()}-${size()}`,
        local.status && `${prefixCls()}-status-${local.status}`,
        `${prefixCls()}-${variant()}`,
        maxLength() !== undefined &&
          characterCount() > maxLength()! &&
          `${prefixCls()}-count-exceed`,
        hashId(),
        local.rootClass,
        local.classNames?.root,
        local.class,
      )}
      style={mergeStyle(local.styles?.root, local.style as JSX.CSSProperties | undefined)}
    >
      <textarea
        {...rest}
        ref={(el) => {
          textareaRef = el
        }}
        rows={rows()}
        class={classNames(`${prefixCls()}-textarea`, local.classNames?.textarea)}
        style={mergeStyle(
          local.styles?.textarea,
          autoSizeConfig()?.maxRows
            ? {
                'max-height': `${autoSizeConfig()!.maxRows! * textareaLineHeight}px`,
                'overflow-y': 'auto',
              }
            : undefined,
          local.autoSize ? { resize: 'none' } : undefined,
        )}
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
          syncTextareaSize()
        }}
        onClick={syncCursorFromTextarea}
        onKeyUp={syncCursorFromTextarea}
        onKeyDown={(event) => {
          ;(local.onKeyDown as JSX.EventHandler<HTMLTextAreaElement, KeyboardEvent> | undefined)?.(
            event,
          )
          if (event.key === 'Enter') {
            ;(
              local.onPressEnter as JSX.EventHandler<HTMLTextAreaElement, KeyboardEvent> | undefined
            )?.(event)
          }
          if (event.key === 'Escape') {
            setOpen(false)
            return
          }
          if (event.key === 'ArrowDown' && popupOpen()) {
            event.preventDefault()
            moveActiveOption(1)
            return
          }
          if (event.key === 'ArrowUp' && popupOpen()) {
            event.preventDefault()
            moveActiveOption(-1)
            return
          }
          if (event.key === 'Enter' && popupOpen()) {
            const option = activeOption() ?? enabledOptions()[0]
            if (option) {
              event.preventDefault()
              selectOption(option)
            }
          }
        }}
        onBlur={(event) => {
          ;(local.onBlur as JSX.EventHandler<HTMLTextAreaElement, FocusEvent> | undefined)?.(event)
        }}
      />
      <Show when={showClear()}>
        <button
          type="button"
          aria-label="clear mentions"
          class={classNames(`${prefixCls()}-clear`, local.classNames?.clear)}
          style={local.styles?.clear}
          onClick={clearValue}
        >
          {allowClearConfig()?.clearIcon ?? <CloseCircleFilled />}
        </button>
      </Show>
      <Show when={shouldShowCount(local.showCount, local.count)}>
        <span
          class={classNames(`${prefixCls()}-count`, local.classNames?.count)}
          style={local.styles?.count}
        >
          {formatCount(local.showCount, local.count, countInfo())}
        </span>
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
            class={classNames(`${prefixCls()}-dropdown`, local.popupClass, local.classNames?.popup)}
            style={mergeStyle(dropdownPosition(), local.styles?.popup)}
            onScroll={(event) => local.onPopupScroll?.(event as unknown as UIEvent)}
          >
            <Show
              when={filteredOptions().length > 0}
              fallback={
                <div
                  class={classNames(`${prefixCls()}-empty`, local.classNames?.notFound)}
                  style={local.styles?.notFound}
                >
                  {local.notFoundContent ?? <Empty />}
                </div>
              }
            >
              <For each={filteredOptions()}>
                {(option) => (
                  <div
                    role="option"
                    aria-disabled={Boolean(option.disabled)}
                    aria-selected={option.value === activeValue()}
                    class={classNames(
                      `${prefixCls()}-item`,
                      option.disabled && `${prefixCls()}-item-disabled`,
                      option.value === activeValue() && `${prefixCls()}-item-active`,
                      local.classNames?.option,
                      option.class,
                    )}
                    style={mergeStyle(local.styles?.option, option.style)}
                    title={option.title}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectOption(option)}
                  >
                    {option.label ?? option.value}
                  </div>
                )}
              </For>
            </Show>
          </div>
        </InternalPortal>
      </Show>
    </div>
  )
}

export const Mentions = Object.assign(MentionsRoot, { Option, getMentions })
