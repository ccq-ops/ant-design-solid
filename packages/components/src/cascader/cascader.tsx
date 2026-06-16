import {
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
import { DownOutlined } from '@solid-ant-design/icons'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form'
import { callRef } from '../radio/context'
import { classNames } from '../shared/class-names'
import { addDocumentPointerDown, addPositionUpdateListeners } from '../shared/overlay'
import type { OptionValue } from '../shared/options'
import { InternalPortal, canUseDom } from '../shared/portal'
import { useZIndex } from '../shared/z-index'
import { CascaderDropdown } from './cascader-dropdown'
import { CascaderSelector } from './cascader-selector'
import type { CascaderDisplayPath } from './cascader-selector'
import { useCascaderStyle } from './cascader.style'
import type { CascaderOption, CascaderProps, CascaderRef, CascaderSemanticSlot } from './interface'
import {
  SHOW_CHILD,
  SHOW_PARENT,
  buildColumns,
  filterDisplayedPaths,
  findOptionPath,
  normalizeOptions,
  optionCanLoad,
  pathKey,
  valuePathFromOptions,
  valuesEqual,
} from './path-utils'
import { getSearchResults, normalizeShowSearch, pathLabel } from './search-utils'
import {
  getPathCheckState,
  normalizeMultipleValue,
  normalizeSingleValue,
  removePathFromMultipleValue,
  selectedOptionPaths,
  togglePathInMultipleValue,
} from './selection-utils'

function isPromiseLike(value: unknown): value is Promise<unknown> {
  return Boolean(value && typeof (value as Promise<unknown>).then === 'function')
}

function isAllowClearEnabled(allowClear: CascaderProps['allowClear']): boolean {
  return allowClear !== false
}

function clearIcon(
  allowClear: CascaderProps['allowClear'],
  clearIconProp?: JSX.Element,
): JSX.Element | undefined {
  return typeof allowClear === 'object' ? allowClear.clearIcon : clearIconProp
}

function toDisplayPath(
  path: CascaderOption[],
  displayRender?: CascaderProps['displayRender'],
): CascaderDisplayPath {
  const labels = path.map((option) => option.label)
  const value = valuePathFromOptions(path)
  const text = pathLabel(path)
  return {
    value,
    options: path,
    label: displayRender ? displayRender(labels, path) : text,
    text,
  }
}

export interface CascaderComponent {
  (props: CascaderProps): JSX.Element
  SHOW_PARENT: typeof SHOW_PARENT
  SHOW_CHILD: typeof SHOW_CHILD
  Panel: (props: CascaderPanelProps) => JSX.Element
}

export interface CascaderPanelProps extends Pick<
  CascaderProps,
  | 'options'
  | 'fieldNames'
  | 'value'
  | 'defaultValue'
  | 'multiple'
  | 'changeOnSelect'
  | 'expandTrigger'
  | 'loadData'
  | 'loadingIcon'
  | 'expandIcon'
  | 'notFoundContent'
  | 'optionRender'
  | 'classNames'
  | 'styles'
  | 'prefixCls'
  | 'class'
  | 'style'
  | 'onChange'
> {}

type SemanticClasses = Partial<Record<CascaderSemanticSlot, string>>
type SemanticStyles = Partial<Record<CascaderSemanticSlot, JSX.CSSProperties>>

function resolveSemanticClassNames(props: CascaderProps): SemanticClasses {
  return typeof props.classNames === 'function'
    ? props.classNames({ props })
    : (props.classNames ?? {})
}

function resolveSemanticStyles(props: CascaderProps): SemanticStyles {
  return typeof props.styles === 'function' ? props.styles({ props }) : (props.styles ?? {})
}

function mergeStyle(...styles: Array<JSX.CSSProperties | undefined>): JSX.CSSProperties {
  return Object.assign({}, ...styles.filter(Boolean))
}

function placementClass(prefixCls: string, placement: NonNullable<CascaderProps['placement']>) {
  return `${prefixCls}-dropdown-${placement.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}`
}

function useCascaderPanelState(props: CascaderPanelProps) {
  const options = createMemo(() => normalizeOptions(props.options, props.fieldNames))
  const [innerSingleValue, setInnerSingleValue] = createSignal<OptionValue[]>(
    normalizeSingleValue(props.defaultValue),
  )
  const [innerMultipleValue, setInnerMultipleValue] = createSignal<OptionValue[][]>(
    normalizeMultipleValue(props.defaultValue),
  )
  const [activeValuePath, setActiveValuePath] = createSignal<OptionValue[]>(
    normalizeSingleValue(props.defaultValue),
  )
  const [loadingKeys, setLoadingKeys] = createSignal<Set<string>>(new Set())
  const multiple = () => Boolean(props.multiple)
  const isValueControlled = () => 'value' in props
  const singleValue = () =>
    isValueControlled() ? normalizeSingleValue(props.value) : innerSingleValue()
  const multipleValue = () =>
    isValueControlled() ? normalizeMultipleValue(props.value) : innerMultipleValue()
  const columns = createMemo(() => buildColumns(options(), activeValuePath()))
  const selectedOptions = createMemo(() => findOptionPath(options(), singleValue()))

  function changeSingleValue(nextValue: OptionValue[], nextOptions: CascaderOption[]): void {
    if (!isValueControlled()) setInnerSingleValue(nextValue)
    props.onChange?.(nextValue, nextOptions)
  }

  function changeMultipleValue(nextValue: OptionValue[][]): void {
    const nextOptions = selectedOptionPaths(options(), nextValue)
    if (!isValueControlled()) setInnerMultipleValue(nextValue)
    props.onChange?.(nextValue, nextOptions)
  }

  function setPathLoading(key: string, loading: boolean): void {
    setLoadingKeys((previous) => {
      const next = new Set(previous)
      if (loading) next.add(key)
      else next.delete(key)
      return next
    })
  }

  function maybeLoadPath(path: CascaderOption[]): boolean {
    const option = path[path.length - 1]
    if (!option || !props.loadData || !optionCanLoad(option)) return false
    const key = pathKey(valuePathFromOptions(path))
    const result = props.loadData(path)
    if (isPromiseLike(result)) {
      setPathLoading(key, true)
      result.finally(() => setPathLoading(key, false))
    }
    return true
  }

  function handleOptionActivate(
    option: CascaderOption,
    depth: number,
    commitSelection = true,
  ): void {
    if (option.disabled) return
    if (!commitSelection && props.expandTrigger !== 'hover') return

    const currentPath = activeValuePath().slice(0, depth)
    const nextPath = [...currentPath, option.value]
    const nextSelectedOptions = findOptionPath(options(), nextPath)
    if (!nextSelectedOptions.length) return
    const isLeaf = !option.children?.length && option.isLeaf !== false

    setActiveValuePath(nextPath)
    if (commitSelection && maybeLoadPath(nextSelectedOptions)) return

    if (multiple()) {
      if (commitSelection)
        changeMultipleValue(
          togglePathInMultipleValue(
            multipleValue(),
            nextSelectedOptions,
            Boolean(props.changeOnSelect),
          ),
        )
      return
    }

    if (commitSelection && (props.changeOnSelect || isLeaf))
      changeSingleValue(valuePathFromOptions(nextSelectedOptions), nextSelectedOptions)
  }

  function optionPathAt(option: CascaderOption, depth: number): CascaderOption[] {
    const valuePath = [...activeValuePath().slice(0, depth), option.value]
    return findOptionPath(options(), valuePath)
  }

  return {
    columns,
    multiple,
    selectedOptions,
    multipleValue,
    activeValuePath,
    handleOptionActivate,
    isSelected: (option: CascaderOption, depth: number) =>
      selectedOptions()[depth]?.value === option.value,
    isActive: (option: CascaderOption, depth: number) => activeValuePath()[depth] === option.value,
    isChecked: (option: CascaderOption, depth: number) => {
      const path = optionPathAt(option, depth)
      return path.length > 0 && getPathCheckState(multipleValue(), path).checked
    },
    isIndeterminate: (option: CascaderOption, depth: number) => {
      const path = optionPathAt(option, depth)
      return path.length > 0 && getPathCheckState(multipleValue(), path).indeterminate
    },
    isLoading: (option: CascaderOption, depth: number) => {
      const path = optionPathAt(option, depth)
      return Boolean(
        option.loading || (path.length && loadingKeys().has(pathKey(valuePathFromOptions(path)))),
      )
    },
  }
}

const CascaderBase = (props: CascaderProps) => {
  const [local, rest] = splitProps(props, [
    'ref',
    'options',
    'fieldNames',
    'value',
    'defaultValue',
    'open',
    'defaultOpen',
    'placeholder',
    'disabled',
    'allowClear',
    'changeOnSelect',
    'expandTrigger',
    'expandIcon',
    'displayRender',
    'prefixCls',
    'class',
    'style',
    'classNames',
    'styles',
    'onChange',
    'onOpenChange',
    'onClear',
    'onKeyDown',
    'zIndex',
    'getPopupContainer',
    'showSearch',
    'searchValue',
    'onSearch',
    'loadData',
    'loadingIcon',
    'notFoundContent',
    'optionRender',
    'popupRender',
    'placement',
    'multiple',
    'showCheckedStrategy',
    'tagRender',
    'removeIcon',
    'maxTagCount',
    'maxTagPlaceholder',
    'maxTagTextLength',
    'autoClearSearchValue',
    'size',
    'status',
    'variant',
    'prefix',
    'suffixIcon',
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
  const cascaderConfig = config.cascader()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-cascader`
  const [, hashId] = useCascaderStyle(prefixCls())
  const [dropdownZIndex] = useZIndex('SelectLike', local.zIndex)
  const [innerSingleValue, setInnerSingleValue] = createSignal<OptionValue[]>(
    normalizeSingleValue(local.defaultValue),
  )
  const [innerMultipleValue, setInnerMultipleValue] = createSignal<OptionValue[][]>(
    normalizeMultipleValue(local.defaultValue),
  )
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [activeValuePath, setActiveValuePath] = createSignal<OptionValue[]>(
    normalizeSingleValue(local.defaultValue),
  )
  const [lastSyncedValuePath, setLastSyncedValuePath] = createSignal<OptionValue[]>()
  const [dropdownPosition, setDropdownPosition] = createSignal<JSX.CSSProperties>({})
  const [innerSearchValue, setInnerSearchValue] = createSignal('')
  const [loadingKeys, setLoadingKeys] = createSignal<Set<string>>(new Set())
  let selectorRef: HTMLDivElement | undefined
  let rootRef: HTMLDivElement | undefined
  let dropdownRef: HTMLDivElement | undefined

  const api: CascaderRef = {
    focus: () => selectorRef?.focus(),
    blur: () => selectorRef?.blur(),
    get nativeElement() {
      return rootRef
    },
  }
  callRef(local.ref as { current?: CascaderRef } | ((ref: CascaderRef) => void) | undefined, api)

  createEffect(() => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() !== 'onChange') {
      if (local.multiple)
        setInnerMultipleValue(
          normalizeMultipleValue(formItem.value() as OptionValue[][] | undefined),
        )
      else setInnerSingleValue(normalizeSingleValue(formItem.value() as OptionValue[] | undefined))
    }
  })

  const cascaderProps = () => ({ ...cascaderConfig, ...local }) as CascaderProps
  const resolvedClassNames = () => resolveSemanticClassNames(cascaderProps())
  const resolvedStyles = () => resolveSemanticStyles(cascaderProps())
  const options = createMemo(() => normalizeOptions(local.options, local.fieldNames))
  const disabled = () => local.disabled ?? formItem?.disabled?.() ?? false
  const size = () => local.size ?? formItem?.size?.() ?? 'middle'
  const variant = () =>
    local.variant ?? cascaderConfig.variant ?? formItem?.variant?.() ?? 'outlined'
  const placement = () => local.placement ?? 'bottomLeft'
  const clearIconNode = () =>
    local.allowClear === false ? undefined : clearIcon(local.allowClear, cascaderConfig.clearIcon)
  const loadingIconNode = () => local.loadingIcon ?? cascaderConfig.loadingIcon
  const removeIconNode = () => local.removeIcon ?? cascaderConfig.removeIcon
  const expandIconNode = () => local.expandIcon ?? cascaderConfig.expandIcon
  const searchIconNode = () => normalizedSearch().searchIcon ?? cascaderConfig.searchIcon
  const suffixIconNode = () =>
    'suffixIcon' in local ? local.suffixIcon : <DownOutlined width="0.8em" height="0.8em" />
  const multiple = () => Boolean(local.multiple)
  const isValueControlled = () => 'value' in props
  const isOpenControlled = () => 'open' in props
  const normalizedSearch = createMemo(() => normalizeShowSearch(local.showSearch))
  const searchEnabled = () => normalizedSearch().enabled
  const isSearchControlled = () =>
    'searchValue' in props || normalizedSearch().searchValue !== undefined
  const searchValue = () => {
    if ('searchValue' in props) return local.searchValue ?? ''
    return normalizedSearch().searchValue ?? innerSearchValue()
  }
  const searchActive = () => open() && searchEnabled() && searchValue().length > 0
  const singleValue = () => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange' && !multiple())
      return normalizeSingleValue(formItem.value() as OptionValue[] | undefined)
    if (isValueControlled()) return normalizeSingleValue(local.value)
    return innerSingleValue()
  }
  const multipleValue = () => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange' && multiple())
      return normalizeMultipleValue(formItem.value() as OptionValue[][] | undefined)
    if (isValueControlled()) return normalizeMultipleValue(local.value)
    return innerMultipleValue()
  }
  const open = () => (isOpenControlled() ? Boolean(local.open) : innerOpen())
  const selectedOptions = createMemo(() => findOptionPath(options(), singleValue()))
  const multipleSelectedOptions = createMemo(() => selectedOptionPaths(options(), multipleValue()))
  const displayValue = createMemo<JSX.Element>(() => {
    const selected = selectedOptions()
    if (!selected.length) return local.placeholder

    const labels = selected.map((option) => option.label)
    return local.displayRender ? local.displayRender(labels, selected) : labels.join(' / ')
  })
  const displayedMultiplePaths = createMemo(() => {
    const selectedPaths = multipleSelectedOptions()
    const strategy = local.showCheckedStrategy ?? SHOW_PARENT
    const paths = filterDisplayedPaths(selectedPaths, strategy, options())
    return paths.map((path) => toDisplayPath(path, local.displayRender))
  })
  const visibleTags = createMemo(() => {
    const tags = displayedMultiplePaths()
    if (typeof local.maxTagCount === 'number') return tags.slice(0, local.maxTagCount)
    return tags
  })
  const omittedTags = createMemo(() => {
    const tags = displayedMultiplePaths()
    if (typeof local.maxTagCount === 'number') return tags.slice(local.maxTagCount)
    return []
  })
  const columns = createMemo(() => buildColumns(options(), activeValuePath()))
  const searchResults = createMemo(() =>
    getSearchResults(options(), searchValue(), normalizedSearch()),
  )

  createEffect(() => {
    const currentOpen = open()
    const currentValue = singleValue()
    options()

    if (!currentOpen) {
      setLastSyncedValuePath(undefined)
      return
    }

    const lastSynced = lastSyncedValuePath()
    if (!multiple() && (lastSynced === undefined || !valuesEqual(lastSynced, currentValue))) {
      setActiveValuePath(currentValue)
      setLastSyncedValuePath([...currentValue])
    }
  })

  function updateDropdownPosition(): void {
    if (isServer) return
    if (!canUseDom() || !selectorRef) {
      setDropdownPosition({ 'z-index': `${dropdownZIndex}`, ...resolvedStyles().popup })
      return
    }
    const rect = selectorRef.getBoundingClientRect()
    const top = placement().startsWith('top') ? rect.top - 4 : rect.bottom + 4
    const width = normalizedSearch().matchInputWidth ? rect.width : undefined
    const left = placement().endsWith('Right') ? rect.right - (width ?? rect.width) : rect.left
    setDropdownPosition({
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      'z-index': `${dropdownZIndex}`,
      'min-width': width ? `${width}px` : undefined,
      ...resolvedStyles().popup,
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
    if (nextOpen) {
      updateDropdownPosition()
      const currentValue = singleValue()
      if (!multiple()) setActiveValuePath(currentValue)
      setLastSyncedValuePath([...currentValue])
    }
    if (!isOpenControlled()) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
  }

  function updateSearchValue(nextValue: string): void {
    if (!isSearchControlled()) setInnerSearchValue(nextValue)
    local.onSearch?.(nextValue)
    normalizedSearch().onSearch?.(nextValue)
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

  function changeSingleValue(nextValue: OptionValue[], nextOptions: CascaderOption[]): void {
    if (
      !isValueControlled() &&
      !(formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
    )
      setInnerSingleValue(nextValue)
    local.onChange?.(nextValue, nextOptions)
    if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
      formItem.setFieldValueFromControl(nextValue)
  }

  function changeMultipleValue(nextValue: OptionValue[][]): void {
    const nextOptions = selectedOptionPaths(options(), nextValue)
    if (
      !isValueControlled() &&
      !(formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
    )
      setInnerMultipleValue(nextValue)
    local.onChange?.(nextValue, nextOptions)
    if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
      formItem.setFieldValueFromControl(nextValue)
  }

  function selectPath(nextOptions: CascaderOption[]): void {
    changeSingleValue(valuePathFromOptions(nextOptions), nextOptions)
  }

  function setPathLoading(key: string, loading: boolean): void {
    setLoadingKeys((previous) => {
      const next = new Set(previous)
      if (loading) next.add(key)
      else next.delete(key)
      return next
    })
  }

  function maybeLoadPath(path: CascaderOption[]): boolean {
    const option = path[path.length - 1]
    if (!option || !local.loadData || !optionCanLoad(option)) return false
    const key = pathKey(valuePathFromOptions(path))
    const result = local.loadData(path)
    if (isPromiseLike(result)) {
      setPathLoading(key, true)
      result.finally(() => setPathLoading(key, false))
    }
    return true
  }

  function handleOptionActivate(
    option: CascaderOption,
    depth: number,
    commitSelection = true,
  ): void {
    if (disabled() || option.disabled) return
    if (!commitSelection && local.expandTrigger !== 'hover') return

    const currentPath = activeValuePath().slice(0, depth)
    const nextPath = [...currentPath, option.value]
    const nextSelectedOptions = findOptionPath(options(), nextPath)
    if (!nextSelectedOptions.length) return
    const isLeaf = !option.children?.length && option.isLeaf !== false

    setActiveValuePath(nextPath)

    if (commitSelection && maybeLoadPath(nextSelectedOptions)) return

    if (multiple()) {
      if (commitSelection)
        changeMultipleValue(
          togglePathInMultipleValue(
            multipleValue(),
            nextSelectedOptions,
            Boolean(local.changeOnSelect),
          ),
        )
      return
    }

    if (commitSelection && (local.changeOnSelect || isLeaf)) selectPath(nextSelectedOptions)
    if (commitSelection && isLeaf) setOpen(false)
  }

  function handleSearchSelect(path: CascaderOption[]): void {
    if (multiple()) {
      changeMultipleValue(togglePathInMultipleValue(multipleValue(), path, true))
      const shouldClear =
        local.autoClearSearchValue ?? normalizedSearch().autoClearSearchValue ?? true
      if (shouldClear) updateSearchValue('')
      return
    }
    selectPath(path)
    setOpen(false)
  }

  function selectFirstEnabledInCurrentColumn(): void {
    const currentColumn = columns()[columns().length - 1] ?? []
    const firstEnabled = currentColumn.find((option) => !option.disabled)
    if (firstEnabled) handleOptionActivate(firstEnabled, columns().length - 1)
  }

  function clearValue(event: MouseEvent): void {
    event.stopPropagation()
    if (multiple()) changeMultipleValue([])
    else changeSingleValue([], [])
    setActiveValuePath([])
    setLastSyncedValuePath([])
    local.onClear?.()
  }

  function removeMultiplePath(valuePath: OptionValue[]): void {
    changeMultipleValue(removePathFromMultipleValue(multipleValue(), valuePath))
  }

  function isSelected(option: CascaderOption, depth: number): boolean {
    return selectedOptions()[depth]?.value === option.value
  }

  function isActive(option: CascaderOption, depth: number): boolean {
    return activeValuePath()[depth] === option.value
  }

  function optionPathAt(option: CascaderOption, depth: number): CascaderOption[] {
    const valuePath = [...activeValuePath().slice(0, depth), option.value]
    return findOptionPath(options(), valuePath)
  }

  function isChecked(option: CascaderOption, depth: number): boolean {
    const path = optionPathAt(option, depth)
    return path.length > 0 && getPathCheckState(multipleValue(), path).checked
  }

  function isIndeterminate(option: CascaderOption, depth: number): boolean {
    const path = optionPathAt(option, depth)
    return path.length > 0 && getPathCheckState(multipleValue(), path).indeterminate
  }

  function isLoading(option: CascaderOption, depth: number): boolean {
    const path = optionPathAt(option, depth)
    return Boolean(
      option.loading || (path.length && loadingKeys().has(pathKey(valuePathFromOptions(path)))),
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
        `${prefixCls()}-${size()}`,
        `${prefixCls()}-${variant()}`,
        local.status && `${prefixCls()}-status-${local.status}`,
        multiple() && `${prefixCls()}-multiple`,
        disabled() && `${prefixCls()}-disabled`,
        open() && `${prefixCls()}-open`,
        hashId(),
        local.class,
        resolvedClassNames().root,
      )}
      style={mergeStyle(local.style as JSX.CSSProperties | undefined, resolvedStyles().root)}
    >
      <CascaderSelector
        prefixCls={prefixCls()}
        disabled={disabled()}
        open={open()}
        selected={multiple() ? multipleValue().length > 0 : selectedOptions().length > 0}
        displayValue={displayValue()}
        placeholder={local.placeholder}
        allowClear={isAllowClearEnabled(local.allowClear)}
        clearIcon={clearIconNode()}
        multiple={multiple()}
        tags={visibleTags()}
        omittedTags={omittedTags()}
        maxTagPlaceholder={local.maxTagPlaceholder}
        maxTagTextLength={local.maxTagTextLength}
        tagRender={local.tagRender}
        removeIcon={removeIconNode()}
        prefix={local.prefix}
        suffixIcon={suffixIconNode()}
        searchIcon={searchIconNode()}
        classNames={resolvedClassNames()}
        styles={resolvedStyles()}
        searchEnabled={searchEnabled()}
        searchValue={searchValue()}
        selectorRef={(element) => {
          selectorRef = element
        }}
        onToggleOpen={() => setOpen(!open())}
        onClear={clearValue}
        onSearchInput={updateSearchValue}
        onTagClose={removeMultiplePath}
        onFocusOut={(event) => {
          const nextFocused = event.relatedTarget
          if (
            formItem?.valuePropName() === 'value' &&
            formItem.trigger() === 'onBlur' &&
            !(nextFocused instanceof Node && event.currentTarget.contains(nextFocused))
          ) {
            formItem.setFieldValueFromControl(multiple() ? multipleValue() : singleValue())
          }
        }}
        onKeyDown={(event) => {
          ;(local.onKeyDown as JSX.EventHandler<HTMLDivElement, KeyboardEvent> | undefined)?.(event)
          if (event.defaultPrevented) return
          if (event.key === 'Escape') setOpen(false)
          if (event.key === 'Enter' && open() && !searchActive())
            selectFirstEnabledInCurrentColumn()
        }}
      />
      <Show when={open()}>
        <InternalPortal
          mount={() =>
            local.getPopupContainer?.(selectorRef) ?? config.getPopupContainer?.(selectorRef)
          }
        >
          {(() => {
            const origin = (
              <CascaderDropdown
                prefixCls={prefixCls()}
                columns={columns()}
                searchActive={searchActive()}
                searchResults={searchResults()}
                dropdownPosition={dropdownPosition()}
                placementClass={placementClass(prefixCls(), placement())}
                dropdownRef={(element) => {
                  dropdownRef = element
                }}
                multiple={multiple()}
                loadingIcon={loadingIconNode()}
                expandIcon={expandIconNode()}
                notFoundContent={local.notFoundContent}
                optionRender={local.optionRender}
                classNames={resolvedClassNames()}
                styles={resolvedStyles()}
                isSelected={isSelected}
                isActive={isActive}
                isChecked={isChecked}
                isIndeterminate={isIndeterminate}
                isLoading={isLoading}
                onOptionActivate={handleOptionActivate}
                onSearchSelect={handleSearchSelect}
              />
            )
            return local.popupRender ? local.popupRender(origin) : origin
          })()}
        </InternalPortal>
      </Show>
    </div>
  )
}

function CascaderPanel(props: CascaderPanelProps) {
  const config = useConfig()
  const prefixCls = () => props.prefixCls ?? `${config.prefixCls()}-cascader`
  const [, hashId] = useCascaderStyle(prefixCls())
  const classNamesMap = () => resolveSemanticClassNames(props as CascaderProps)
  const stylesMap = () => resolveSemanticStyles(props as CascaderProps)
  const state = useCascaderPanelState(props)

  return (
    <CascaderDropdown
      prefixCls={prefixCls()}
      rootClass={classNames(`${prefixCls()}-panel`, hashId(), props.class)}
      columns={state.columns()}
      searchActive={false}
      searchResults={[]}
      dropdownPosition={mergeStyle(props.style as JSX.CSSProperties | undefined, stylesMap().popup)}
      dropdownRef={() => undefined}
      multiple={state.multiple()}
      loadingIcon={props.loadingIcon}
      expandIcon={props.expandIcon}
      notFoundContent={props.notFoundContent}
      optionRender={props.optionRender}
      classNames={classNamesMap()}
      styles={stylesMap()}
      isSelected={state.isSelected}
      isActive={state.isActive}
      isChecked={state.isChecked}
      isIndeterminate={state.isIndeterminate}
      isLoading={state.isLoading}
      onOptionActivate={state.handleOptionActivate}
      onSearchSelect={() => undefined}
    />
  )
}

export const Cascader = CascaderBase as CascaderComponent
Cascader.SHOW_PARENT = SHOW_PARENT
Cascader.SHOW_CHILD = SHOW_CHILD
Cascader.Panel = CascaderPanel
