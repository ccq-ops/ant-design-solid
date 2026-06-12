import { For, createMemo, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { Tooltip } from '../tooltip'
import type {
  SegmentedOption,
  SegmentedOrientation,
  SegmentedProps,
  SegmentedSemanticClassNames,
  SegmentedSemanticStyles,
  SegmentedTooltip,
  SegmentedValue,
} from './interface'
import { useSegmentedStyle } from './segmented.style'

interface NormalizedOption {
  label?: JSX.Element
  value: SegmentedValue
  disabled?: boolean
  icon?: JSX.Element
  class?: string
  tooltip?: SegmentedTooltip
}

function normalizeOption(option: SegmentedOption): NormalizedOption {
  if (typeof option === 'string' || typeof option === 'number') {
    return { label: String(option), value: option }
  }
  return option
}

function valuesEqual(a: SegmentedValue | undefined, b: SegmentedValue | undefined): boolean {
  return a === b
}

function resolveOrientation(props: { orientation?: SegmentedOrientation; vertical?: boolean }) {
  return props.orientation ?? (props.vertical ? 'vertical' : 'horizontal')
}

function resolveSemanticClassNames(
  value: SegmentedProps['classNames'],
  props: SegmentedProps,
): SegmentedSemanticClassNames {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function resolveSemanticStyles(
  value: SegmentedProps['styles'],
  props: SegmentedProps,
): SegmentedSemanticStyles {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function tooltipProps(tooltip: SegmentedTooltip) {
  return typeof tooltip === 'string' ? { title: tooltip } : tooltip
}

export function Segmented(props: SegmentedProps) {
  const [local, rest] = splitProps(props, [
    'options',
    'value',
    'defaultValue',
    'disabled',
    'block',
    'size',
    'orientation',
    'vertical',
    'shape',
    'name',
    'prefixCls',
    'rootClass',
    'classNames',
    'styles',
    'onChange',
    'class',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-segmented`
  const [, hashId] = useSegmentedStyle(prefixCls())
  const options = createMemo(() => (local.options ?? []).map(normalizeOption))
  const firstEnabledValue = () => options().find((option) => !option.disabled)?.value
  const validDefaultValue = () => {
    const defaultValue = local.defaultValue
    if (options().some((option) => valuesEqual(option.value, defaultValue) && !option.disabled))
      return defaultValue
    return firstEnabledValue()
  }
  const [innerValue, setInnerValue] = createSignal<SegmentedValue | undefined>(validDefaultValue())
  const selectedValue = () => (local.value !== undefined ? local.value : innerValue())
  const size = () => local.size ?? config.componentSize()
  const orientation = () => resolveOrientation(local)
  const shape = () => local.shape ?? 'default'
  const semanticProps = (): SegmentedProps => ({
    ...props,
    options: local.options ?? [],
    orientation: orientation(),
    vertical: orientation() === 'vertical',
    shape: shape(),
    size: size(),
  })
  const semanticClassNames = createMemo(() =>
    resolveSemanticClassNames(local.classNames, semanticProps()),
  )
  const semanticStyles = createMemo(() => resolveSemanticStyles(local.styles, semanticProps()))

  function selectValue(nextValue: SegmentedValue): void {
    const option = options().find((item) => valuesEqual(item.value, nextValue))
    if (!option || local.disabled || option.disabled || valuesEqual(selectedValue(), nextValue))
      return
    if (local.value === undefined) setInnerValue(nextValue)
    local.onChange?.(nextValue)
  }

  function enabledOptions(): NormalizedOption[] {
    return options().filter((option) => !option.disabled)
  }

  function selectByOffset(currentValue: SegmentedValue, offset: number): void {
    const enabled = enabledOptions()
    if (!enabled.length) return
    const currentIndex = Math.max(
      enabled.findIndex((option) => valuesEqual(option.value, currentValue)),
      enabled.findIndex((option) => valuesEqual(option.value, selectedValue())),
      0,
    )
    selectValue(enabled[(currentIndex + offset + enabled.length) % enabled.length].value)
  }

  function handleKeyDown(event: KeyboardEvent, option: NormalizedOption): void {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      selectByOffset(option.value, 1)
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      selectByOffset(option.value, -1)
    }
    if (event.key === 'Home') {
      event.preventDefault()
      const first = enabledOptions()[0]
      if (first) selectValue(first.value)
    }
    if (event.key === 'End') {
      event.preventDefault()
      const enabled = enabledOptions()
      const last = enabled[enabled.length - 1]
      if (last) selectValue(last.value)
    }
  }

  return (
    <div
      {...rest}
      role="radiogroup"
      class={classNames(
        prefixCls(),
        local.block && `${prefixCls()}-block`,
        local.disabled && `${prefixCls()}-disabled`,
        size() === 'small' && `${prefixCls()}-sm`,
        size() === 'large' && `${prefixCls()}-lg`,
        orientation() === 'vertical' && `${prefixCls()}-vertical`,
        shape() === 'round' && `${prefixCls()}-shape-round`,
        hashId(),
        local.rootClass,
        local.class,
        semanticClassNames().root,
      )}
      style={{ ...(local.style as JSX.CSSProperties | undefined), ...semanticStyles().root }}
    >
      <For each={options()}>
        {(option) => {
          const selected = () => valuesEqual(option.value, selectedValue())
          const disabled = () => Boolean(local.disabled || option.disabled)
          const item = (
            <button
              type="button"
              role="radio"
              aria-checked={selected() ? 'true' : 'false'}
              name={local.name}
              disabled={disabled()}
              class={classNames(
                `${prefixCls()}-item`,
                selected() && `${prefixCls()}-item-selected`,
                disabled() && `${prefixCls()}-item-disabled`,
                option.class,
                semanticClassNames().item,
              )}
              style={semanticStyles().item}
              onClick={() => selectValue(option.value)}
              onKeyDown={(event) => handleKeyDown(event, option)}
            >
              {option.icon ? (
                <span
                  class={classNames(`${prefixCls()}-item-icon`, semanticClassNames().icon)}
                  style={semanticStyles().icon}
                  aria-hidden="true"
                >
                  {option.icon}
                </span>
              ) : null}
              {option.label ? (
                <span
                  class={classNames(`${prefixCls()}-item-label`, semanticClassNames().label)}
                  style={semanticStyles().label}
                >
                  {option.label}
                </span>
              ) : null}
            </button>
          )
          if (!option.tooltip) return item
          return <Tooltip {...tooltipProps(option.tooltip)}>{item}</Tooltip>
        }}
      </For>
    </div>
  )
}
