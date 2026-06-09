import { children } from 'solid-js'
import type { JSX } from 'solid-js'
import type {
  FlattenOptionData,
  FlattenSelectItem,
  SelectFieldNames,
  SelectOption,
  SelectOptionGroup,
  SelectOptionInput,
} from './interface'
import type { RawValue } from './interface'

const OPTION_MARK = '__ANT_DESIGN_SOLID_SELECT_OPTION__'
const GROUP_MARK = '__ANT_DESIGN_SOLID_SELECT_OPT_GROUP__'

export interface SelectOptionMarkerProps extends SelectOption {
  children?: JSX.Element
}

export interface SelectOptGroupMarkerProps extends SelectOptionGroup {
  children?: JSX.Element
}

export function Option(props: SelectOptionMarkerProps): JSX.Element {
  return { [OPTION_MARK]: true, props } as unknown as JSX.Element
}

export function OptGroup(props: SelectOptGroupMarkerProps): JSX.Element {
  return { [GROUP_MARK]: true, props } as unknown as JSX.Element
}

function fieldNames(fieldNames?: SelectFieldNames) {
  return {
    label: fieldNames?.label ?? 'label',
    value: fieldNames?.value ?? 'value',
    options: fieldNames?.options ?? 'options',
    groupLabel: fieldNames?.groupLabel ?? fieldNames?.label ?? 'label',
  }
}

function isObjectOption(option: SelectOptionInput): option is SelectOption | SelectOptionGroup {
  return typeof option === 'object' && option !== null
}

function isGroup(option: SelectOptionInput, names: ReturnType<typeof fieldNames>): boolean {
  return isObjectOption(option) && Array.isArray(option[names.options] as unknown[])
}

function toText(value: JSX.Element): string {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    return String(value)
  return ''
}

export function optionText(option: FlattenOptionData): string {
  return toText(option.label)
}

function normalizeOption(
  option: SelectOptionInput,
  names: ReturnType<typeof fieldNames>,
  groupLabel?: JSX.Element,
): FlattenOptionData {
  if (!isObjectOption(option)) {
    return {
      label: String(option),
      value: option,
      groupLabel,
      data: { label: String(option), value: option },
    }
  }

  const value = (option[names.value] ?? option.value) as RawValue
  const label = (option[names.label] ?? option.label ?? value) as JSX.Element
  return {
    label,
    value,
    disabled: Boolean(option.disabled),
    class: (option.class ?? option.className) as string | undefined,
    style: option.style as JSX.CSSProperties | undefined,
    title: option.title,
    key: option.key,
    groupLabel,
    data: option as SelectOption,
  }
}

function normalizeMarker(node: unknown): SelectOptionInput | undefined {
  if (!node || typeof node !== 'object') return undefined
  const record = node as Record<string, unknown>
  const props = record.props as Record<string, unknown> | undefined
  if (!props) return undefined
  if (record[OPTION_MARK]) {
    return {
      ...props,
      label: (props.label ?? props.children) as JSX.Element,
    } as SelectOption
  }
  if (record[GROUP_MARK]) {
    const resolved = children(() => props.children as JSX.Element)
    const groupChildren = resolved.toArray().map(normalizeMarker).filter(Boolean)
    return {
      ...props,
      label: (props.label ?? props.children) as JSX.Element,
      options: groupChildren,
    } as SelectOptionGroup
  }
  return undefined
}

export function optionsFromChildren(childrenValue: JSX.Element): SelectOptionInput[] {
  const resolved = children(() => childrenValue)
  return resolved.toArray().map(normalizeMarker).filter(Boolean) as SelectOptionInput[]
}

export function flattenOptions(
  options: SelectOptionInput[] = [],
  namesInput?: SelectFieldNames,
): FlattenSelectItem[] {
  const names = fieldNames(namesInput)
  const items: FlattenSelectItem[] = []
  options.forEach((option) => {
    if (isGroup(option, names)) {
      const group = option as SelectOptionGroup
      const label = (group[names.groupLabel] ?? group.label) as JSX.Element
      items.push({
        group: true,
        label,
        key: group.key,
        class: (group.class ?? group.className) as string | undefined,
        title: group.title,
      })
      ;((group[names.options] ?? []) as SelectOptionInput[]).forEach((childOption) => {
        items.push(normalizeOption(childOption, names, label))
      })
      return
    }
    items.push(normalizeOption(option, names))
  })
  return items
}

export function selectableOptions(items: FlattenSelectItem[]): FlattenOptionData[] {
  return items.filter((item): item is FlattenOptionData => !('group' in item))
}

export function findOption(
  items: FlattenSelectItem[],
  value: RawValue | undefined,
): FlattenOptionData | undefined {
  return selectableOptions(items).find((option) => option.value === value)
}

export function findOptionByText(
  items: FlattenSelectItem[],
  text: string,
): FlattenOptionData | undefined {
  return selectableOptions(items).find((option) => optionText(option) === text)
}

export function appendTagOptions(
  items: FlattenSelectItem[],
  values: RawValue[],
): FlattenSelectItem[] {
  const next = [...items]
  values.forEach((value) => {
    if (findOption(next, value)) return
    next.push({
      label: String(value),
      value,
      data: { label: String(value), value },
    })
  })
  return next
}

function getFilterValues(option: FlattenOptionData, prop: string | string[]): string[] {
  const props = Array.isArray(prop) ? prop : [prop]
  return props.map((key) => {
    if (key === 'label') return toText(option.label)
    if (key === 'value') return String(option.value)
    return String(option.data[key] ?? '')
  })
}

export function filterAndSortOptions(
  items: FlattenSelectItem[],
  searchValue: string,
  config: {
    filterOption?: boolean | ((inputValue: string, option: SelectOption) => boolean)
    filterSort?: (
      optionA: FlattenOptionData,
      optionB: FlattenOptionData,
      info: { searchValue: string },
    ) => number
    optionFilterProp?: string | string[]
  },
): FlattenSelectItem[] {
  if (!searchValue) {
    const copied = [...items]
    if (config.filterSort) {
      const options = selectableOptions(copied).sort(
        (a, b) => config.filterSort?.(a, b, { searchValue }) ?? 0,
      )
      return options
    }
    return copied
  }

  const lower = searchValue.toLowerCase()
  const keptGroups = new Set<JSX.Element>()
  const filtered = selectableOptions(items).filter((option) => {
    const keep =
      typeof config.filterOption === 'function'
        ? config.filterOption(searchValue, option.data)
        : config.filterOption === false
          ? true
          : getFilterValues(option, config.optionFilterProp ?? 'value').some((value) =>
              value.toLowerCase().includes(lower),
            )
    if (keep && option.groupLabel !== undefined) keptGroups.add(option.groupLabel)
    return keep
  })
  if (config.filterSort) {
    filtered.sort((a, b) => config.filterSort?.(a, b, { searchValue }) ?? 0)
  }
  const result: FlattenSelectItem[] = []
  items.forEach((item) => {
    if ('group' in item) {
      if (keptGroups.has(item.label)) result.push(item)
      return
    }
    if (filtered.includes(item)) result.push(item)
  })
  return result
}
