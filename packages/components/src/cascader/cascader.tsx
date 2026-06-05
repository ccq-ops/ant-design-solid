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
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form'
import { classNames } from '../shared/class-names'
import { addDocumentPointerDown, addPositionUpdateListeners } from '../shared/overlay'
import type { OptionValue } from '../shared/options'
import { InternalPortal, canUseDom } from '../shared/portal'
import { useZIndex } from '../shared/z-index'
import { CascaderDropdown } from './cascader-dropdown'
import { CascaderSelector } from './cascader-selector'
import type { CascaderDisplayPath } from './cascader-selector'
import { useCascaderStyle } from './cascader.style'
import type { CascaderOption, CascaderProps } from './interface'
import {
  SHOW_CHILD,
  SHOW_PARENT,
  buildColumns,
  filterDisplayedPaths,
  findOptionPath,
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
  return typeof allowClear === 'object' || Boolean(allowClear)
}

function clearIcon(allowClear: CascaderProps['allowClear']): JSX.Element | undefined {
  return typeof allowClear === 'object' ? allowClear.clearIcon : undefined
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
}

const CascaderBase = (props: CascaderProps) => {
  const [local, rest] = splitProps(props, [
    'options',
    'value',
    'defaultValue',
    'open',
    'defaultOpen',
    'placeholder',
    'disabled',
    'allowClear',
    'changeOnSelect',
    'expandTrigger',
    'displayRender',
    'prefixCls',
    'class',
    'style',
    'onChange',
    'onOpenChange',
    'onKeyDown',
    'zIndex',
    'getPopupContainer',
    'showSearch',
    'searchValue',
    'onSearch',
    'loadData',
    'loadingIcon',
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
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
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
  let dropdownRef: HTMLDivElement | undefined

  createEffect(() => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() !== 'onChange') {
      if (local.multiple)
        setInnerMultipleValue(
          normalizeMultipleValue(formItem.value() as OptionValue[][] | undefined),
        )
      else setInnerSingleValue(normalizeSingleValue(formItem.value() as OptionValue[] | undefined))
    }
  })

  const options = () => local.options ?? []
  const disabled = () => Boolean(local.disabled)
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
    const strategy = local.showCheckedStrategy
    const paths = strategy
      ? filterDisplayedPaths(selectedPaths, strategy, options())
      : selectedPaths
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
      setDropdownPosition({ 'z-index': `${dropdownZIndex}` })
      return
    }
    const rect = selectorRef.getBoundingClientRect()
    setDropdownPosition({
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      'z-index': `${dropdownZIndex}`,
      'min-width': normalizedSearch().matchInputWidth ? `${rect.width}px` : undefined,
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
    return getPathCheckState(multipleValue(), optionPathAt(option, depth)).checked
  }

  function isIndeterminate(option: CascaderOption, depth: number): boolean {
    return getPathCheckState(multipleValue(), optionPathAt(option, depth)).indeterminate
  }

  function isLoading(option: CascaderOption, depth: number): boolean {
    const path = optionPathAt(option, depth)
    return option.loading || loadingKeys().has(pathKey(valuePathFromOptions(path)))
  }

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-${local.size ?? 'middle'}`,
        `${prefixCls()}-${local.variant ?? 'outlined'}`,
        local.status && `${prefixCls()}-status-${local.status}`,
        multiple() && `${prefixCls()}-multiple`,
        disabled() && `${prefixCls()}-disabled`,
        open() && `${prefixCls()}-open`,
        hashId(),
        local.class,
      )}
      style={local.style}
    >
      <CascaderSelector
        prefixCls={prefixCls()}
        disabled={disabled()}
        open={open()}
        selected={multiple() ? multipleValue().length > 0 : selectedOptions().length > 0}
        displayValue={displayValue()}
        placeholder={local.placeholder}
        allowClear={isAllowClearEnabled(local.allowClear)}
        clearIcon={clearIcon(local.allowClear)}
        multiple={multiple()}
        tags={visibleTags()}
        omittedTags={omittedTags()}
        maxTagPlaceholder={local.maxTagPlaceholder}
        maxTagTextLength={local.maxTagTextLength}
        tagRender={local.tagRender}
        removeIcon={local.removeIcon}
        prefix={local.prefix}
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
          <CascaderDropdown
            prefixCls={prefixCls()}
            columns={columns()}
            searchActive={searchActive()}
            searchResults={searchResults()}
            dropdownPosition={dropdownPosition()}
            dropdownRef={(element) => {
              dropdownRef = element
            }}
            multiple={multiple()}
            loadingIcon={local.loadingIcon}
            isSelected={isSelected}
            isActive={isActive}
            isChecked={isChecked}
            isIndeterminate={isIndeterminate}
            isLoading={isLoading}
            onOptionActivate={handleOptionActivate}
            onSearchSelect={handleSearchSelect}
          />
        </InternalPortal>
      </Show>
    </div>
  )
}

export const Cascader = CascaderBase as CascaderComponent
Cascader.SHOW_PARENT = SHOW_PARENT
Cascader.SHOW_CHILD = SHOW_CHILD
