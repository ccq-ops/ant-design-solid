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
import type { OptionValue } from '../shared/options'
import type { CascaderOption, CascaderProps } from './interface'
import { useCascaderStyle } from './cascader.style'

function findOptionPath(
  options: CascaderOption[],
  valuePath: OptionValue[] = [],
): CascaderOption[] {
  const selectedOptions: CascaderOption[] = []
  let currentOptions = options

  for (const value of valuePath) {
    const option = currentOptions.find((item) => item.value === value)
    if (!option) break
    selectedOptions.push(option)
    currentOptions = option.children ?? []
  }

  return selectedOptions.length === valuePath.length ? selectedOptions : []
}

function valuePathFromOptions(options: CascaderOption[]): OptionValue[] {
  return options.map((option) => option.value)
}

function valuesEqual(a: OptionValue[], b: OptionValue[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index])
}

function buildColumns(
  options: CascaderOption[],
  activeValuePath: OptionValue[],
): CascaderOption[][] {
  const columns: CascaderOption[][] = [options]
  let currentOptions = options

  for (const value of activeValuePath) {
    const option = currentOptions.find((item) => item.value === value)
    if (!option || option.disabled || !option.children?.length) break
    columns.push(option.children)
    currentOptions = option.children
  }

  return columns
}

export function Cascader(props: CascaderProps) {
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
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-cascader`
  const [, hashId] = useCascaderStyle(prefixCls())
  const [dropdownZIndex] = useZIndex('SelectLike', local.zIndex)
  const [innerValue, setInnerValue] = createSignal<OptionValue[]>(local.defaultValue ?? [])
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [activeValuePath, setActiveValuePath] = createSignal<OptionValue[]>(
    local.defaultValue ?? [],
  )
  const [lastSyncedValuePath, setLastSyncedValuePath] = createSignal<OptionValue[]>()
  const [dropdownPosition, setDropdownPosition] = createSignal<JSX.CSSProperties>({})
  let selectorRef: HTMLDivElement | undefined

  createEffect(() => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() !== 'onChange')
      setInnerValue((formItem.value() as OptionValue[] | undefined) ?? [])
  })

  const options = () => local.options ?? []
  const disabled = () => Boolean(local.disabled)
  const isValueControlled = () => 'value' in props
  const isOpenControlled = () => 'open' in props
  const value = () => {
    if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
      return (formItem.value() as OptionValue[] | undefined) ?? []
    if (isValueControlled()) return local.value ?? []
    return innerValue()
  }
  const open = () => (isOpenControlled() ? Boolean(local.open) : innerOpen())
  const selectedOptions = createMemo(() => findOptionPath(options(), value()))
  const displayValue = createMemo<JSX.Element>(() => {
    const selected = selectedOptions()
    if (!selected.length) return local.placeholder

    const labels = selected.map((option) => option.label)
    return local.displayRender ? local.displayRender(labels, selected) : labels.join(' / ')
  })
  const columns = createMemo(() => buildColumns(options(), activeValuePath()))

  createEffect(() => {
    const currentOpen = open()
    const currentValue = value()
    options()

    if (!currentOpen) {
      setLastSyncedValuePath(undefined)
      return
    }

    const lastSynced = lastSyncedValuePath()
    if (lastSynced === undefined || !valuesEqual(lastSynced, currentValue)) {
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
    })
  }

  function setOpen(nextOpen: boolean): void {
    if (disabled()) return
    if (nextOpen) {
      updateDropdownPosition()
      const currentValue = value()
      setActiveValuePath(currentValue)
      setLastSyncedValuePath([...currentValue])
    }
    if (!isOpenControlled()) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
  }

  createRenderEffect(() => {
    if (open()) updateDropdownPosition()
  })

  createEffect(() => {
    if (!open()) return
    const removeListeners = addPositionUpdateListeners(updateDropdownPosition)
    onCleanup(removeListeners)
  })

  function changeValue(nextValue: OptionValue[], nextOptions: CascaderOption[]): void {
    if (
      !isValueControlled() &&
      !(formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
    )
      setInnerValue(nextValue)
    local.onChange?.(nextValue, nextOptions)
    if (formItem?.valuePropName() === 'value' && formItem.trigger() === 'onChange')
      formItem.setFieldValueFromControl(nextValue)
  }

  function selectPath(nextOptions: CascaderOption[]): void {
    changeValue(valuePathFromOptions(nextOptions), nextOptions)
  }

  function handleOptionActivate(
    option: CascaderOption,
    depth: number,
    commitSelection = true,
  ): void {
    if (disabled() || option.disabled) return

    const currentPath = activeValuePath().slice(0, depth)
    const nextPath = [...currentPath, option.value]
    const nextSelectedOptions = findOptionPath(options(), nextPath)
    const isLeaf = !option.children?.length

    setActiveValuePath(nextPath)

    if (commitSelection && (local.changeOnSelect || isLeaf)) selectPath(nextSelectedOptions)
    if (commitSelection && isLeaf) setOpen(false)
  }

  function selectFirstEnabledInCurrentColumn(): void {
    const currentColumn = columns()[columns().length - 1] ?? []
    const firstEnabled = currentColumn.find((option) => !option.disabled)
    if (firstEnabled) handleOptionActivate(firstEnabled, columns().length - 1)
  }

  function clearValue(event: MouseEvent): void {
    event.stopPropagation()
    changeValue([], [])
    setActiveValuePath([])
    setLastSyncedValuePath([])
  }

  function isSelected(option: CascaderOption, depth: number): boolean {
    return selectedOptions()[depth]?.value === option.value
  }

  function isActive(option: CascaderOption, depth: number): boolean {
    return activeValuePath()[depth] === option.value
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
        role="combobox"
        tabindex={disabled() ? undefined : 0}
        aria-expanded={open()}
        aria-disabled={disabled()}
        ref={(element) => {
          selectorRef = element
        }}
        class={`${prefixCls()}-selector`}
        onClick={() => setOpen(!open())}
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
          if (event.defaultPrevented) return
          if (event.key === 'Escape') setOpen(false)
          if (event.key === 'Enter' && open()) selectFirstEnabledInCurrentColumn()
        }}
      >
        <span
          class={
            selectedOptions().length
              ? `${prefixCls()}-selection-item`
              : `${prefixCls()}-placeholder`
          }
        >
          {displayValue()}
        </span>
        <Show when={local.allowClear && !disabled() && selectedOptions().length > 0}>
          <button
            type="button"
            aria-label="clear selection"
            class={`${prefixCls()}-clear`}
            onClick={clearValue}
          >
            ×
          </button>
        </Show>
      </div>
      <Show when={open()}>
        <InternalPortal
          mount={() =>
            local.getPopupContainer?.(selectorRef) ?? config.getPopupContainer?.(selectorRef)
          }
        >
          <div class={`${prefixCls()}-dropdown`} style={dropdownPosition()}>
            <For each={columns()}>
              {(column, columnIndex) => (
                <ul role="menu" class={`${prefixCls()}-menu`}>
                  <For each={column}>
                    {(option) => (
                      <li
                        role="menuitem"
                        aria-selected={isSelected(option, columnIndex())}
                        aria-disabled={Boolean(option.disabled)}
                        class={classNames(
                          `${prefixCls()}-menu-item`,
                          isSelected(option, columnIndex()) && `${prefixCls()}-menu-item-selected`,
                          isActive(option, columnIndex()) && `${prefixCls()}-menu-item-active`,
                          option.disabled && `${prefixCls()}-menu-item-disabled`,
                        )}
                        onClick={() => handleOptionActivate(option, columnIndex())}
                        onPointerEnter={() => {
                          if (local.expandTrigger === 'hover')
                            handleOptionActivate(option, columnIndex(), false)
                        }}
                      >
                        <span>{option.label}</span>
                        <Show when={option.children?.length}>
                          <span aria-hidden="true" class={`${prefixCls()}-menu-item-expand-icon`}>
                            ›
                          </span>
                        </Show>
                      </li>
                    )}
                  </For>
                </ul>
              )}
            </For>
          </div>
        </InternalPortal>
      </Show>
    </div>
  )
}
