import { For, Show, createEffect, createMemo, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form'
import { classNames } from '../shared/class-names'
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
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-cascader`
  const [, hashId] = useCascaderStyle(prefixCls())
  const [innerValue, setInnerValue] = createSignal<OptionValue[]>(local.defaultValue ?? [])
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [activeValuePath, setActiveValuePath] = createSignal<OptionValue[]>(
    local.defaultValue ?? [],
  )

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

  function setOpen(nextOpen: boolean): void {
    if (disabled()) return
    if (nextOpen) setActiveValuePath(value())
    if (!isOpenControlled()) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
  }

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
        <div class={`${prefixCls()}-dropdown`}>
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
      </Show>
    </div>
  )
}
