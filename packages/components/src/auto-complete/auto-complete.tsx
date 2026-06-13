import { CloseCircleFilled } from '@ant-design-solid/icons'
import {
  For,
  Show,
  children,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  onCleanup,
  splitProps,
} from 'solid-js'
import type { JSX } from 'solid-js'
import { Dynamic, isServer } from 'solid-js/web'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form'
import { classNames } from '../shared/class-names'
import { addDocumentPointerDown, addPositionUpdateListeners } from '../shared/overlay'
import { InternalPortal, canUseDom } from '../shared/portal'
import { useZIndex } from '../shared/z-index'
import { useAutoCompleteStyle } from './auto-complete.style'
import type {
  AutoCompleteDataSourceItemObject,
  AutoCompleteOption,
  AutoCompleteProps,
  AutoCompleteRef,
  AutoCompleteSize,
  AutoCompleteSemanticClassNames,
  AutoCompleteSemanticStyles,
} from './interface'

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

function assignRef<T>(ref: ((value: T) => void) | { current?: T } | T | undefined, value: T) {
  if (!ref) return
  if (typeof ref === 'function') {
    ;(ref as (value: T) => void)(value)
    return
  }
  if (!('focus' in (ref as object))) {
    ;(ref as { current?: T }).current = value
    return
  }
  Object.assign(ref as object, value)
}

function mergeStyle(
  ...styles: Array<JSX.CSSProperties | string | undefined>
): JSX.CSSProperties | string | undefined {
  const stringStyle = styles.find((style): style is string => typeof style === 'string')
  if (stringStyle) return stringStyle
  const merged: JSX.CSSProperties = {}
  styles.filter(Boolean).forEach((style) => {
    Object.entries(style as JSX.CSSProperties).forEach(([key, value]) => {
      const normalizedKey = key.startsWith('--')
        ? key
        : key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
      ;(merged as Record<string, unknown>)[normalizedKey] = value
    })
  })
  return merged
}

function resolveClassNames(
  classNamesConfig: AutoCompleteProps['classNames'],
  props: AutoCompleteProps,
): AutoCompleteSemanticClassNames {
  return typeof classNamesConfig === 'function'
    ? classNamesConfig({ props })
    : (classNamesConfig ?? {})
}

function resolveStyles(
  stylesConfig: AutoCompleteProps['styles'],
  props: AutoCompleteProps,
): AutoCompleteSemanticStyles {
  return typeof stylesConfig === 'function' ? stylesConfig({ props }) : (stylesConfig ?? {})
}

function normalizeDataSourceItem(
  item: string | AutoCompleteDataSourceItemObject | JSX.Element,
): AutoCompleteOption | undefined {
  if (typeof item === 'string') return { value: item, label: item }
  if (!item || typeof item !== 'object') return undefined
  const record = item as AutoCompleteDataSourceItemObject
  if (typeof record.value !== 'string') return undefined
  return {
    ...record,
    label: record.label ?? record.text ?? record.value,
    value: record.value,
    title: typeof record.title === 'string' ? record.title : record.value,
  }
}

function inputChild(
  childrenValue: JSX.Element,
): HTMLInputElement | HTMLTextAreaElement | undefined {
  const resolved = children(() => childrenValue)
  const nodes = resolved.toArray()
  const first = nodes[0]
  if (first instanceof HTMLInputElement || first instanceof HTMLTextAreaElement) return first
  if (first instanceof HTMLElement) {
    const innerInput = first.querySelector('input, textarea')
    if (innerInput instanceof HTMLInputElement || innerInput instanceof HTMLTextAreaElement) {
      return innerInput
    }
  }
  return undefined
}

export function AutoComplete(props: AutoCompleteProps) {
  const [local, rest] = splitProps(props, [
    'ref',
    'value',
    'defaultValue',
    'open',
    'defaultOpen',
    'options',
    'dataSource',
    'children',
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
    'dropdownRender',
    'dropdownMatchSelectWidth',
    'popupClass',
    'dropdownClass',
    'popupClassName',
    'dropdownClassName',
    'popupStyle',
    'dropdownStyle',
    'virtual',
    'classNames',
    'styles',
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
    'onDropdownVisibleChange',
    'onKeyDown',
    'onFocus',
    'onBlur',
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
  const [activeValue, setActiveValue] = createSignal<string | undefined>()
  const [dropdownPosition, setDropdownPosition] = createSignal<JSX.CSSProperties>({})
  let selectorRef: HTMLDivElement | undefined
  let rootRef: HTMLDivElement | undefined
  let inputRef: HTMLInputElement | HTMLTextAreaElement | undefined
  let dropdownRef: HTMLDivElement | undefined

  const api: AutoCompleteRef = {
    focus: () => inputRef?.focus(),
    blur: () => inputRef?.blur(),
    get input() {
      return inputRef
    },
    get nativeElement() {
      return rootRef
    },
  }
  assignRef(local.ref, api)

  createEffect(() => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() !== 'onChange')
      setInnerValue(String(formItem.value() ?? ''))
  })

  const disabled = () => local.disabled ?? formItem?.disabled?.() ?? false
  const size = (): AutoCompleteSize | undefined => {
    const mergedSize = local.size ?? formItem?.size?.()
    return mergedSize === 'medium' ? 'middle' : mergedSize
  }
  const variant = () => local.variant ?? formItem?.variant?.() ?? 'outlined'
  const allowClear = () => Boolean(local.allowClear)
  const clearIcon = () =>
    typeof local.allowClear === 'object' && local.allowClear.clearIcon ? (
      local.allowClear.clearIcon
    ) : (
      <CloseCircleFilled />
    )
  const isValueControlled = () => 'value' in props
  const isOpenControlled = () => 'open' in props
  const value = () => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
      return String(formItem.value() ?? '')
    if (isValueControlled()) return local.value ?? ''
    return innerValue()
  }
  const open = () => (isOpenControlled() ? Boolean(local.open) : innerOpen())
  const semanticProps = (): AutoCompleteProps => ({
    ...props,
    value: value(),
    open: open(),
    disabled: disabled(),
    size: size(),
    variant: variant(),
  })
  const semanticClassNames = createMemo(() => resolveClassNames(local.classNames, semanticProps()))
  const semanticStyles = createMemo(() => resolveStyles(local.styles, semanticProps()))
  const showSearchConfig = () =>
    typeof local.showSearch === 'object' ? local.showSearch : undefined
  const mergedFilterOption = () => showSearchConfig()?.filterOption ?? local.filterOption
  const mergedOptions = createMemo(() => {
    if (local.options) return local.options
    return (local.dataSource ?? [])
      .map(normalizeDataSourceItem)
      .filter(Boolean) as AutoCompleteOption[]
  })
  const hasCustomInput = createMemo(() => Boolean(local.children && inputChild(local.children)))
  const filteredOptions = createMemo(() => {
    const options = mergedOptions()
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
  const defaultActiveFirstOption = () => local.defaultActiveFirstOption ?? true
  const mergedPopupRender = () => local.popupRender ?? local.dropdownRender
  const mergedPopupMatchSelectWidth = () =>
    local.popupMatchSelectWidth ?? local.dropdownMatchSelectWidth ?? true
  const callOpenChange = (nextOpen: boolean) => {
    local.onOpenChange?.(nextOpen)
    local.onDropdownVisibleChange?.(nextOpen)
  }
  let activeOptionCache: AutoCompleteOption | undefined
  const activeOption = () => {
    activeOptionCache = enabledOptions().find((option) => option.value === activeValue())
    return activeOptionCache
  }
  const getActiveOption = () => activeOptionCache ?? activeOption()
  let ignoreNextDefaultActive = false

  function setDefaultActiveOption(): void {
    if (!defaultActiveFirstOption()) {
      activeOptionCache = undefined
      setActiveValue(undefined)
      return
    }
    const option = enabledOptions()[0]
    activeOptionCache = option
    setActiveValue(option?.value)
  }

  function moveActiveOption(offset: 1 | -1): void {
    const options = enabledOptions()
    if (options.length === 0) {
      activeOptionCache = undefined
      setActiveValue(undefined)
      return
    }
    const currentValue = activeOptionCache?.value ?? activeValue()
    const currentIndex = options.findIndex((option) => option.value === currentValue)
    const nextIndex =
      currentIndex === -1
        ? offset === 1
          ? 0
          : options.length - 1
        : (currentIndex + offset + options.length) % options.length
    const nextOption = options[nextIndex]
    activeOptionCache = nextOption
    setActiveValue(nextOption.value)
    if (local.backfill) {
      ignoreNextDefaultActive = true
      changeValue(nextOption.value)
    }
  }

  function updateDropdownPosition(): void {
    if (isServer) return
    if (!canUseDom() || !selectorRef) {
      setDropdownPosition({ 'z-index': `${dropdownZIndex}` })
      return
    }
    const rect = selectorRef.getBoundingClientRect()
    const matchWidth = mergedPopupMatchSelectWidth()
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
    if (normalizedOpen) {
      updateDropdownPosition()
      setDefaultActiveOption()
    } else {
      activeOptionCache = undefined
      setActiveValue(undefined)
    }
    if (!isOpenControlled()) setInnerOpen(normalizedOpen)
    callOpenChange(normalizedOpen)
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

  createEffect(() => {
    if (!open()) return
    if (inputFocused() && mergedFilterOption() === false) return
    if (ignoreNextDefaultActive) {
      ignoreNextDefaultActive = false
      return
    }
    if (activeOption()) return
    setDefaultActiveOption()
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
    const nextValue = event.currentTarget.value
    changeValue(nextValue)
    showSearchConfig()?.onSearch?.(nextValue)
    if (!disabled()) setOpen(true)
  }

  function handleTextInput(
    event: InputEvent & {
      currentTarget: HTMLInputElement | HTMLTextAreaElement
      target: Element
    },
  ) {
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
      class={classNames(
        `${prefixCls()}-dropdown`,
        local.popupClass,
        local.dropdownClass,
        local.popupClassName,
        local.dropdownClassName,
        semanticClassNames().popup,
        semanticClassNames().list,
      )}
      style={
        mergeStyle(
          dropdownPosition(),
          local.popupStyle,
          local.dropdownStyle,
          semanticStyles().popup,
          semanticStyles().list,
        ) as JSX.CSSProperties
      }
      onScroll={(event) => local.onPopupScroll?.(event as unknown as UIEvent)}
    >
      <Show
        when={filteredOptions().length > 0}
        fallback={
          <div
            class={classNames(`${prefixCls()}-empty`, semanticClassNames().empty)}
            style={semanticStyles().empty}
          >
            {local.notFoundContent}
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
                option.class ?? option.className,
                semanticClassNames().option,
              )}
              style={mergeStyle(option.style, semanticStyles().option) as JSX.CSSProperties}
              title={option.title ?? option.value}
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
    return mergedPopupRender() ? mergedPopupRender()!(node) : node
  }

  function handleKeyDown(
    event: KeyboardEvent & { currentTarget: HTMLInputElement | HTMLTextAreaElement },
  ) {
    ;(local.onKeyDown as unknown as ((event: KeyboardEvent) => void) | undefined)?.(event)
    local.onInputKeyDown?.(event)
    if (event.key === 'Escape') {
      setOpen(false)
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const wasOpen = open()
      if (!wasOpen) setOpen(true)
      moveActiveOption(1)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const wasOpen = open()
      if (!wasOpen) setOpen(true)
      moveActiveOption(-1)
      return
    }
    if (event.key === 'Enter' && open()) {
      const option = getActiveOption()
      if (option) selectOption(option)
    }
  }

  const defaultInputNode = () => (
    <input
      role="combobox"
      aria-expanded={open()}
      aria-disabled={disabled()}
      disabled={disabled()}
      class={classNames(`${prefixCls()}-input`, semanticClassNames().input)}
      style={semanticStyles().input}
      placeholder={local.placeholder}
      value={value()}
      ref={(element) => {
        inputRef = element
      }}
      onFocus={(event) => {
        ;(local.onFocus as unknown as ((event: FocusEvent) => void) | undefined)?.(event)
        setInputFocused(true)
        setOpen(true)
      }}
      onBlur={(event) => {
        ;(local.onBlur as unknown as ((event: FocusEvent) => void) | undefined)?.(event)
      }}
      onInput={(event) => {
        setInputFocused(false)
        handleInput(event)
      }}
      onKeyDown={(event) => handleKeyDown(event)}
    />
  )

  const customInputNode = () => {
    if (!local.children) return undefined
    const node = inputChild(local.children)
    if (!node) return undefined
    const tagName = node.tagName.toLowerCase() as 'input' | 'textarea'
    const existingClass = node.getAttribute('class') ?? undefined
    const existingStyle = node.getAttribute('style') ?? undefined
    return (
      <Dynamic
        component={tagName}
        role="combobox"
        aria-expanded={open()}
        aria-disabled={disabled()}
        disabled={disabled()}
        class={classNames(existingClass, `${prefixCls()}-input`, semanticClassNames().input)}
        style={mergeStyle(existingStyle, semanticStyles().input) as JSX.CSSProperties}
        placeholder={local.placeholder ?? node.getAttribute('placeholder') ?? undefined}
        value={value()}
        ref={(element: HTMLInputElement | HTMLTextAreaElement) => {
          inputRef = element
        }}
        onFocus={(
          event: FocusEvent & { currentTarget: HTMLInputElement | HTMLTextAreaElement },
        ) => {
          ;(local.onFocus as unknown as ((event: FocusEvent) => void) | undefined)?.(event)
          setInputFocused(true)
          setOpen(true)
        }}
        onBlur={(event: FocusEvent & { currentTarget: HTMLInputElement | HTMLTextAreaElement }) => {
          ;(local.onBlur as unknown as ((event: FocusEvent) => void) | undefined)?.(event)
        }}
        onInput={(
          event: InputEvent & {
            currentTarget: HTMLInputElement | HTMLTextAreaElement
            target: Element
          },
        ) => {
          setInputFocused(false)
          handleTextInput(event)
        }}
        onKeyDown={(
          event: KeyboardEvent & { currentTarget: HTMLInputElement | HTMLTextAreaElement },
        ) => handleKeyDown(event)}
      />
    )
  }

  return (
    <div
      {...rest}
      ref={(element) => {
        rootRef = element
      }}
      class={classNames(
        prefixCls(),
        hasCustomInput() && `${prefixCls()}-customize-input`,
        disabled() && `${prefixCls()}-disabled`,
        open() && `${prefixCls()}-open`,
        size() && `${prefixCls()}-${size()}`,
        local.status && `${prefixCls()}-status-${local.status}`,
        `${prefixCls()}-${variant()}`,
        hashId(),
        semanticClassNames().root,
        local.class,
      )}
      style={mergeStyle(local.style as JSX.CSSProperties | undefined, semanticStyles().root)}
    >
      <div
        ref={(element) => {
          selectorRef = element
        }}
        class={classNames(`${prefixCls()}-selector`, semanticClassNames().selector)}
        style={semanticStyles().selector}
        onClick={() => !disabled() && setOpen(true)}
      >
        {customInputNode() ?? defaultInputNode()}
        <Show when={allowClear() && !disabled() && value()}>
          <button
            type="button"
            aria-label="clear autocomplete"
            class={classNames(`${prefixCls()}-clear`, semanticClassNames().clear)}
            style={semanticStyles().clear}
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
