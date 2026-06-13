import {
  CheckOutlined,
  CloseCircleFilled,
  CloseOutlined,
  DownOutlined,
  LoadingOutlined,
} from '@ant-design-solid/icons'
import {
  For,
  Match,
  Show,
  Switch,
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
import { callRef } from '../radio/context'
import { classNames } from '../shared/class-names'
import { addDocumentPointerDown, addPositionUpdateListeners } from '../shared/overlay'
import { InternalPortal, canUseDom } from '../shared/portal'
import { useZIndex } from '../shared/z-index'
import type {
  FlattenOptionData,
  RawValue,
  SelectProps,
  SelectRef,
  SelectSearchConfig,
  SelectValue,
} from './interface'
import {
  appendTagOptions,
  filterAndSortOptions,
  findOption,
  flattenOptions,
  optionText,
  optionsFromChildren,
  selectableOptions,
} from './option-utils'
import { OptGroup, Option } from './option-utils'
import { outputValue, selectedOptions, toLabeledValue } from './value-utils'
import { useSelectStyle } from './select.style'

function clearIcon(
  allowClear: SelectProps['allowClear'],
  clearIconProp?: JSX.Element,
): JSX.Element {
  if (typeof allowClear === 'object' && allowClear.clearIcon) return allowClear.clearIcon
  return clearIconProp ?? <CloseCircleFilled />
}

function mergedSearchConfig(props: SelectProps): SelectSearchConfig {
  const objectConfig = typeof props.showSearch === 'object' ? props.showSearch : {}
  return {
    ...objectConfig,
    autoClearSearchValue: props.autoClearSearchValue ?? objectConfig.autoClearSearchValue,
    filterOption: props.filterOption ?? objectConfig.filterOption,
    filterSort: props.filterSort ?? objectConfig.filterSort,
    optionFilterProp: props.optionFilterProp ?? objectConfig.optionFilterProp,
    searchValue: props.searchValue ?? objectConfig.searchValue,
    onSearch: props.onSearch ?? objectConfig.onSearch,
  }
}

function isSearchEnabled(props: SelectProps): boolean {
  return Boolean(props.showSearch) || props.mode === 'multiple' || props.mode === 'tags'
}

function normalizeSize(size: SelectProps['size']): string | undefined {
  if (!size || size === 'middle') return undefined
  return size
}

function truncateLabel(label: JSX.Element, maxLength?: number): JSX.Element {
  if (!maxLength) return label
  const text = typeof label === 'string' || typeof label === 'number' ? String(label) : undefined
  if (!text || text.length <= maxLength) return label
  return `${text.slice(0, maxLength)}...`
}

function mergeStyle(
  ...styles: Array<JSX.CSSProperties | undefined>
): JSX.CSSProperties | undefined {
  return Object.assign({}, ...styles.filter(Boolean))
}

function splitTokens(value: string, separators: string[] | undefined): string[] {
  if (!separators?.length) return []
  const pattern = new RegExp(`[${separators.map((item) => `\\${item}`).join('')}]`)
  return value
    .split(pattern)
    .map((item) => item.trim())
    .filter(Boolean)
}

function includesSeparator(value: string, separators: string[] | undefined): boolean {
  return Boolean(separators?.some((separator) => value.includes(separator)))
}

function publicOption(option: FlattenOptionData): FlattenOptionData {
  const next = {
    ...option.data,
    label: option.label,
    value: option.value,
  } as FlattenOptionData
  if (option.disabled) next.disabled = option.disabled
  if (option.class) next.class = option.class
  if (option.style) next.style = option.style
  if (option.title) next.title = option.title
  if (option.key) next.key = option.key
  return next
}

function publicOptions(options: FlattenOptionData[]): FlattenOptionData[] {
  return options.map(publicOption)
}

function callChange(
  local: SelectProps,
  options: FlattenOptionData[],
  multiple: boolean,
): SelectValue {
  const nextValue = outputValue(options, multiple, local.labelInValue) as SelectValue
  const nextOption = publicOptions(options)
  local.onChange?.(nextValue, multiple ? nextOption : nextOption[0])
  return nextValue
}

function SelectBase(props: SelectProps) {
  const [local, rest] = splitProps(props, [
    'ref',
    'value',
    'defaultValue',
    'open',
    'defaultOpen',
    'options',
    'children',
    'placeholder',
    'disabled',
    'allowClear',
    'clearIcon',
    'prefixCls',
    'rootClassName',
    'class',
    'style',
    'onChange',
    'onOpenChange',
    'onDropdownVisibleChange',
    'onKeyDown',
    'onFocus',
    'onBlur',
    'onSelect',
    'onDeselect',
    'onClear',
    'onInputKeyDown',
    'onPopupScroll',
    'onActive',
    'zIndex',
    'getPopupContainer',
    'aria-label',
    'aria-labelledby',
    'mode',
    'labelInValue',
    'fieldNames',
    'showSearch',
    'autoClearSearchValue',
    'filterOption',
    'filterSort',
    'optionFilterProp',
    'searchValue',
    'onSearch',
    'optionLabelProp',
    'optionRender',
    'labelRender',
    'tagRender',
    'popupRender',
    'dropdownRender',
    'notFoundContent',
    'placement',
    'popupMatchSelectWidth',
    'dropdownMatchSelectWidth',
    'popupClassName',
    'dropdownClassName',
    'popupStyle',
    'dropdownStyle',
    'listHeight',
    'listItemHeight',
    'virtual',
    'size',
    'status',
    'variant',
    'bordered',
    'prefix',
    'suffixIcon',
    'showArrow',
    'removeIcon',
    'menuItemSelectedIcon',
    'loading',
    'loadingIcon',
    'maxCount',
    'maxTagCount',
    'maxTagPlaceholder',
    'maxTagTextLength',
    'tokenSeparators',
    'classNames',
    'styles',
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-select`
  const [, hashId] = useSelectStyle(prefixCls())
  const [dropdownZIndex] = useZIndex('SelectLike', local.zIndex)
  const multiple = () => local.mode === 'multiple' || local.mode === 'tags'
  const [innerValue, setInnerValue] = createSignal<SelectValue>(local.defaultValue)
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [innerSearchValue, setInnerSearchValue] = createSignal('')
  const [createdTags, setCreatedTags] = createSignal<RawValue[]>([])
  const [dropdownPosition, setDropdownPosition] = createSignal<JSX.CSSProperties>({})
  let selectorRef: HTMLDivElement | undefined
  let searchInputRef: HTMLInputElement | undefined
  let dropdownRef: HTMLDivElement | undefined

  const api: SelectRef = {
    focus: () => selectorRef?.focus(),
    blur: () => selectorRef?.blur(),
  }
  callRef(local.ref as { current?: SelectRef } | ((ref: SelectRef) => void) | undefined, api)

  createEffect(() => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() !== 'onChange')
      setInnerValue(formItem.value() as SelectValue)
  })

  const disabled = () => local.disabled ?? formItem?.disabled?.() ?? false
  const size = () => local.size ?? formItem?.size?.()
  const variant = () =>
    local.variant ??
    (local.bordered === false ? 'borderless' : (formItem?.variant?.() ?? 'outlined'))
  const searchConfig = () => mergedSearchConfig(local)
  const searchEnabled = () => isSearchEnabled(local)
  const searchValue = () =>
    searchConfig().searchValue !== undefined ? searchConfig().searchValue! : innerSearchValue()
  const baseOptions = createMemo(() => {
    const explicitOptions = local.options ?? optionsFromChildren(local.children)
    return flattenOptions(explicitOptions, local.fieldNames)
  })
  const allOptions = createMemo(() =>
    local.mode === 'tags' ? appendTagOptions(baseOptions(), createdTags()) : baseOptions(),
  )
  const filteredOptions = createMemo(() =>
    filterAndSortOptions(allOptions(), searchValue(), {
      filterOption: searchConfig().filterOption,
      filterSort: searchConfig().filterSort,
      optionFilterProp: searchConfig().optionFilterProp ?? (local.options ? 'label' : 'value'),
    }),
  )
  const value = () => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
      return formItem.value() as SelectValue
    if (local.value !== undefined) return local.value
    return innerValue()
  }
  const selected = createMemo(() => selectedOptions(allOptions(), value(), multiple()))
  const open = () => (local.open !== undefined ? Boolean(local.open) : innerOpen())
  const selectedSet = () => new Set(selected().map((option) => option.value))
  const hasValue = () => selected().length > 0
  const popupMatchSelectWidth = () => local.popupMatchSelectWidth ?? local.dropdownMatchSelectWidth

  function updateDropdownPosition(): void {
    if (isServer) return
    if (!canUseDom() || !selectorRef) {
      setDropdownPosition({ 'z-index': `${dropdownZIndex}` })
      return
    }
    const rect = selectorRef.getBoundingClientRect()
    const placement = local.placement ?? 'bottomLeft'
    const top = placement.startsWith('top') ? rect.top - 4 : rect.bottom + 4
    const left = placement.endsWith('Right') ? rect.right - rect.width : rect.left
    const widthMatch = popupMatchSelectWidth()
    const width =
      typeof widthMatch === 'number'
        ? `${widthMatch}px`
        : widthMatch === false
          ? undefined
          : `${rect.width}px`
    setDropdownPosition({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width,
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
    if (nextOpen) updateDropdownPosition()
    if (local.open === undefined) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
    local.onDropdownVisibleChange?.(nextOpen)
  }

  function setSearch(nextSearch: string): void {
    if (searchConfig().searchValue === undefined) setInnerSearchValue(nextSearch)
    searchConfig().onSearch?.(nextSearch)
    if (local.mode === 'tags' && includesSeparator(nextSearch, local.tokenSeparators)) {
      commitTags(splitTokens(nextSearch, local.tokenSeparators))
    }
  }

  function commitTags(tokens: string[]): void {
    if (!tokens.length) return
    const nextSelected = [...selected()]
    const nextCreated = [...createdTags()]
    tokens.forEach((token) => {
      const existing = findOption(allOptions(), token)
      const option =
        existing ??
        ({
          label: token,
          value: token,
          data: { label: token, value: token },
        } as FlattenOptionData)
      if (!nextSelected.some((item) => item.value === option.value)) nextSelected.push(option)
      if (!existing && !nextCreated.includes(token)) nextCreated.push(token)
    })
    setCreatedTags(nextCreated)
    commitSelection(nextSelected)
    if (searchConfig().searchValue === undefined) setInnerSearchValue('')
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
    if (open() && searchEnabled()) queueMicrotask(() => searchInputRef?.focus())
  })

  function commitSelection(nextSelected: FlattenOptionData[]): void {
    const nextValue = callChange(local, nextSelected, multiple())
    if (
      local.value === undefined &&
      !(formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
    ) {
      setInnerValue(nextValue)
    }
    if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
      formItem.setFieldValueFromControl(nextValue)
  }

  function selectOption(option: FlattenOptionData): void {
    if (option.disabled) return
    if (multiple()) {
      if (selectedSet().has(option.value)) {
        const nextSelected = selected().filter((item) => item.value !== option.value)
        commitSelection(nextSelected)
        local.onDeselect?.(
          local.labelInValue ? toLabeledValue(option) : option.value,
          publicOption(option),
        )
        return
      }
      if (local.maxCount !== undefined && selected().length >= local.maxCount) return
      const nextSelected = [...selected(), option]
      commitSelection(nextSelected)
      local.onSelect?.(
        local.labelInValue ? toLabeledValue(option) : option.value,
        publicOption(option),
      )
      if (searchConfig().autoClearSearchValue ?? true) setSearch('')
      return
    }
    commitSelection([option])
    local.onSelect?.(
      local.labelInValue ? toLabeledValue(option) : option.value,
      publicOption(option),
    )
    setOpen(false)
    if (searchConfig().autoClearSearchValue ?? true) setSearch('')
  }

  function removeOption(option: FlattenOptionData): void {
    const nextSelected = selected().filter((item) => item.value !== option.value)
    commitSelection(nextSelected)
    local.onDeselect?.(
      local.labelInValue ? toLabeledValue(option) : option.value,
      publicOption(option),
    )
  }

  function clearSelection(event?: MouseEvent): void {
    event?.stopPropagation()
    commitSelection([])
    local.onClear?.()
  }

  function selectFirstEnabled(): void {
    const first = selectableOptions(filteredOptions()).find((option) => !option.disabled)
    if (first) selectOption(first)
  }

  const handleSearchInputKeyDown: JSX.EventHandler<HTMLInputElement, KeyboardEvent> = (event) => {
    local.onInputKeyDown?.(event)
    if (event.key !== 'Enter' || local.mode !== 'tags') return
    const nextTag = searchValue().trim()
    if (!nextTag) return
    event.preventDefault()
    event.stopPropagation()
    commitTags([nextTag])
  }

  function displayLabel(option: FlattenOptionData): JSX.Element {
    if (local.labelRender) return local.labelRender(toLabeledValue(option))
    const prop = local.optionLabelProp
    return prop ? ((option.data[prop] as JSX.Element | undefined) ?? option.label) : option.label
  }

  function visibleTags() {
    const maxTagCount = local.maxTagCount === 'responsive' ? undefined : local.maxTagCount
    return maxTagCount === undefined ? selected() : selected().slice(0, maxTagCount)
  }

  function omittedTags() {
    const maxTagCount = local.maxTagCount === 'responsive' ? undefined : local.maxTagCount
    return maxTagCount === undefined ? [] : selected().slice(maxTagCount)
  }

  function omittedPlaceholder(): JSX.Element | undefined {
    const omitted = omittedTags()
    if (!omitted.length) return undefined
    if (typeof local.maxTagPlaceholder === 'function') return local.maxTagPlaceholder(omitted)
    return local.maxTagPlaceholder ?? `+ ${omitted.length} ...`
  }

  function renderOption(option: FlattenOptionData, index: number): JSX.Element {
    return local.optionRender?.(option, { index }) ?? option.label
  }

  function dropdownNode(): JSX.Element {
    return (
      <div
        role="listbox"
        ref={(element) => {
          dropdownRef = element
        }}
        class={classNames(
          `${prefixCls()}-dropdown`,
          local.popupClassName,
          local.dropdownClassName,
          local.classNames?.popup,
          local.classNames?.['popup.root'],
        )}
        style={mergeStyle(
          dropdownPosition(),
          { 'max-height': local.listHeight ? `${local.listHeight}px` : undefined },
          local.popupStyle,
          local.dropdownStyle,
          local.styles?.popup,
          local.styles?.['popup.root'],
        )}
        onScroll={(event) =>
          local.onPopupScroll?.(
            event as unknown as UIEvent & { currentTarget: HTMLDivElement; target: Element },
          )
        }
      >
        <Show
          when={selectableOptions(filteredOptions()).length > 0}
          fallback={
            <div class={`${prefixCls()}-empty`}>{local.notFoundContent ?? 'Not Found'}</div>
          }
        >
          <For each={filteredOptions()}>
            {(item, index) => (
              <Switch>
                <Match when={'group' in item}>
                  <div
                    class={classNames(`${prefixCls()}-item-group`, item.class)}
                    title={(item as { title?: string }).title}
                  >
                    {(item as { label: JSX.Element }).label}
                  </div>
                </Match>
                <Match when={!('group' in item)}>
                  {(() => {
                    const option = item as FlattenOptionData
                    const selectedOption = () => selectedSet().has(option.value)
                    return (
                      <div
                        role="option"
                        aria-selected={selectedOption()}
                        aria-disabled={Boolean(option.disabled)}
                        class={classNames(
                          `${prefixCls()}-item`,
                          selectedOption() && `${prefixCls()}-item-option-selected`,
                          option.disabled && `${prefixCls()}-item-option-disabled`,
                          option.class,
                          local.classNames?.item,
                        )}
                        style={mergeStyle(option.style, local.styles?.item)}
                        title={option.title}
                        onMouseEnter={() =>
                          local.onActive?.(
                            local.labelInValue ? toLabeledValue(option) : option.value,
                          )
                        }
                        onClick={() => selectOption(option)}
                      >
                        <span class={`${prefixCls()}-item-option-content`}>
                          {renderOption(option, index())}
                        </span>
                        <Show when={multiple() && selectedOption()}>
                          <span class={`${prefixCls()}-item-option-state`}>
                            {local.menuItemSelectedIcon ?? <CheckOutlined />}
                          </span>
                        </Show>
                      </div>
                    )
                  })()}
                </Match>
              </Switch>
            )}
          </For>
        </Show>
      </div>
    )
  }

  function popupNode(): JSX.Element {
    const origin = dropdownNode()
    return (local.popupRender ?? local.dropdownRender)?.(origin) ?? origin
  }

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        disabled() && `${prefixCls()}-disabled`,
        open() && `${prefixCls()}-open`,
        multiple() && `${prefixCls()}-multiple`,
        normalizeSize(size()) && `${prefixCls()}-${normalizeSize(size())}`,
        local.status && `${prefixCls()}-status-${local.status}`,
        local.bordered === false ? `${prefixCls()}-borderless` : `${prefixCls()}-${variant()}`,
        hashId(),
        local.rootClassName,
        local.class,
        local.classNames?.root,
      )}
      style={
        typeof local.style === 'string'
          ? local.style
          : mergeStyle(local.style as JSX.CSSProperties | undefined, local.styles?.root)
      }
    >
      <div
        role="combobox"
        tabindex={disabled() ? undefined : 0}
        aria-label={local['aria-label']}
        aria-labelledby={local['aria-labelledby']}
        aria-expanded={open()}
        aria-disabled={disabled()}
        ref={(element) => {
          selectorRef = element
        }}
        class={classNames(`${prefixCls()}-selector`, local.classNames?.selector)}
        style={local.styles?.selector}
        onClick={() => setOpen(!open())}
        onFocus={(event) =>
          (local.onFocus as JSX.EventHandler<HTMLDivElement, FocusEvent> | undefined)?.(event)
        }
        onBlur={(event) =>
          (local.onBlur as JSX.EventHandler<HTMLDivElement, FocusEvent> | undefined)?.(event)
        }
        onFocusOut={(event) => {
          const nextFocused = event.relatedTarget
          if (
            formItem?.valuePropName() === 'value' &&
            formItem.trigger() === 'onBlur' &&
            !(nextFocused instanceof Node && event.currentTarget.contains(nextFocused))
          ) {
            formItem.setFieldValueFromControl(value())
          }
        }}
        onKeyDown={(event) => {
          ;(local.onKeyDown as JSX.EventHandler<HTMLDivElement, KeyboardEvent> | undefined)?.(event)
          if (event.key === 'Escape') setOpen(false)
          if (event.key === 'Enter' && open()) selectFirstEnabled()
        }}
      >
        <Show when={local.prefix}>
          <span class={`${prefixCls()}-prefix`}>{local.prefix}</span>
        </Show>
        <Show
          when={multiple()}
          fallback={
            <Show
              when={!(searchEnabled() && open())}
              fallback={
                <span class={`${prefixCls()}-selection-search`}>
                  <input
                    ref={(element) => {
                      searchInputRef = element
                    }}
                    class={`${prefixCls()}-search-input`}
                    value={searchValue()}
                    placeholder={hasValue() ? undefined : String(local.placeholder ?? '')}
                    onClick={(event) => event.stopPropagation()}
                    onInput={(event) => setSearch(event.currentTarget.value)}
                    onKeyDown={handleSearchInputKeyDown}
                  />
                </span>
              }
            >
              <span
                class={hasValue() ? `${prefixCls()}-selection-item` : `${prefixCls()}-placeholder`}
              >
                {selected()[0] ? displayLabel(selected()[0]) : local.placeholder}
              </span>
            </Show>
          }
        >
          <span class={`${prefixCls()}-selection-overflow`}>
            <For each={visibleTags()}>
              {(option) => {
                const label = () => truncateLabel(displayLabel(option), local.maxTagTextLength)
                const close = () => removeOption(option)
                return (
                  <Show
                    when={local.tagRender}
                    fallback={
                      <span class={`${prefixCls()}-selection-item ${prefixCls()}-tag`}>
                        <span class={`${prefixCls()}-tag-label`}>{label()}</span>
                        <button
                          type="button"
                          class={`${prefixCls()}-tag-close`}
                          aria-label={`remove ${optionText(option)}`}
                          disabled={disabled()}
                          onClick={(event) => {
                            event.stopPropagation()
                            close()
                          }}
                        >
                          {local.removeIcon ?? <CloseOutlined />}
                        </button>
                      </span>
                    }
                  >
                    {local.tagRender?.({
                      label: label(),
                      value: option.value,
                      disabled: disabled(),
                      closable: !disabled(),
                      onClose: close,
                    })}
                  </Show>
                )
              }}
            </For>
            <Show when={omittedPlaceholder()}>
              <span class={`${prefixCls()}-selection-item ${prefixCls()}-tag`}>
                {omittedPlaceholder()}
              </span>
            </Show>
            <Show when={!selected().length && !(searchEnabled() && open())}>
              <span class={`${prefixCls()}-placeholder`}>{local.placeholder}</span>
            </Show>
            <Show when={searchEnabled() && open()}>
              <span
                class={`${prefixCls()}-selection-search ${prefixCls()}-selection-search-multiple`}
              >
                <input
                  ref={(element) => {
                    searchInputRef = element
                  }}
                  class={`${prefixCls()}-search-input`}
                  value={searchValue()}
                  onClick={(event) => event.stopPropagation()}
                  onInput={(event) => setSearch(event.currentTarget.value)}
                  onKeyDown={handleSearchInputKeyDown}
                />
              </span>
            </Show>
          </span>
        </Show>
        <Show when={local.allowClear && !disabled() && hasValue()}>
          <button
            type="button"
            aria-label="clear selection"
            class={`${prefixCls()}-clear`}
            onClick={clearSelection}
          >
            {clearIcon(local.allowClear, local.clearIcon)}
          </button>
        </Show>
        <Show when={local.loading || local.showArrow !== false || local.suffixIcon !== null}>
          <span
            class={classNames(
              `${prefixCls()}-arrow`,
              local.loading && `${prefixCls()}-arrow-loading`,
              open() && !local.loading && `${prefixCls()}-arrow-open`,
            )}
          >
            {local.loading
              ? (local.loadingIcon ?? <LoadingOutlined />)
              : (local.suffixIcon ?? <DownOutlined width="0.8em" height="0.8em" />)}
          </span>
        </Show>
      </div>
      <Show when={open()}>
        <InternalPortal
          mount={() =>
            local.getPopupContainer?.(selectorRef) ?? config.getPopupContainer?.(selectorRef)
          }
        >
          {popupNode()}
        </InternalPortal>
      </Show>
    </div>
  )
}

export const Select = Object.assign(SelectBase, { Option, OptGroup })
