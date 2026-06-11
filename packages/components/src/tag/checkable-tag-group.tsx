import { For, createSignal, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useTagStyle } from './tag.style'
import { CheckableTag } from './checkable-tag'
import type { JSX } from 'solid-js'
import type {
  CheckableTagGroupProps,
  CheckableTagOption,
  CheckableTagOptionInput,
  CheckableTagValue,
} from './interface'

function normalizeOption(option: CheckableTagOptionInput): CheckableTagOption {
  if (typeof option === 'string' || typeof option === 'number') {
    return { value: option, label: String(option) }
  }
  return option
}

function includesValue(values: CheckableTagValue[], value: CheckableTagValue): boolean {
  return values.some((item) => item === value)
}

export function CheckableTagGroup(props: CheckableTagGroupProps) {
  const [local, rest] = splitProps(props, [
    'prefixCls',
    'rootClassName',
    'options',
    'disabled',
    'multiple',
    'value',
    'defaultValue',
    'class',
    'style',
    'classNames',
    'styles',
    'onChange',
    'role',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-tag`
  const groupPrefixCls = () => `${prefixCls()}-checkable-group`
  const [, hashId] = useTagStyle(prefixCls())
  const [innerSingleValue, setInnerSingleValue] = createSignal<CheckableTagValue | null>(
    Array.isArray(local.defaultValue) ? null : (local.defaultValue ?? null),
  )
  const [innerMultipleValue, setInnerMultipleValue] = createSignal<CheckableTagValue[]>(
    Array.isArray(local.defaultValue) ? local.defaultValue : [],
  )

  const options = () => (local.options ?? []).map(normalizeOption)
  const singleValue = () =>
    !local.multiple && local.value !== undefined
      ? (local.value as CheckableTagValue | null)
      : innerSingleValue()
  const multipleValue = () =>
    local.multiple && Array.isArray(local.value)
      ? (local.value as CheckableTagValue[])
      : innerMultipleValue()

  function checked(option: CheckableTagOption): boolean {
    return local.multiple
      ? includesValue(multipleValue(), option.value)
      : singleValue() === option.value
  }

  function handleChange(nextChecked: boolean, option: CheckableTagOption): void {
    if (local.disabled) return
    if (local.multiple) {
      const current = multipleValue()
      const nextValue = nextChecked
        ? [...current.filter((item) => item !== option.value), option.value]
        : current.filter((item) => item !== option.value)
      if (local.value === undefined) setInnerMultipleValue(nextValue)
      ;(local.onChange as ((value: CheckableTagValue[]) => void) | undefined)?.(nextValue)
      return
    }

    const nextValue = nextChecked ? option.value : null
    if (local.value === undefined) setInnerSingleValue(nextValue)
    ;(local.onChange as ((value: CheckableTagValue | null) => void) | undefined)?.(nextValue)
  }

  return (
    <div
      {...rest}
      role={local.role ?? 'group'}
      class={classNames(
        groupPrefixCls(),
        local.disabled && `${groupPrefixCls()}-disabled`,
        hashId(),
        local.classNames?.root,
        local.class,
        local.rootClassName,
      )}
      style={{ ...local.styles?.root, ...(local.style as JSX.CSSProperties | undefined) }}
    >
      <For each={options()}>
        {(option) => (
          <CheckableTag
            prefixCls={prefixCls()}
            checked={checked(option)}
            disabled={local.disabled}
            class={classNames(
              `${groupPrefixCls()}-item`,
              local.classNames?.item,
              option.className,
              option.class,
            )}
            style={{ ...local.styles?.item, ...option.style }}
            onChange={(nextChecked) => handleChange(nextChecked, option)}
          >
            {option.label}
          </CheckableTag>
        )}
      </For>
    </div>
  )
}
