import type {
  FlattenOptionData,
  FlattenSelectItem,
  LabeledValue,
  RawValue,
  SelectValue,
} from './interface'
import { findOption } from './option-utils'

export function isLabeledValue(value: unknown): value is LabeledValue {
  return typeof value === 'object' && value !== null && 'value' in value
}

export function rawValue(value: RawValue | LabeledValue): RawValue {
  return isLabeledValue(value) ? value.value : value
}

export function rawValues(value: SelectValue, multiple: boolean): RawValue[] {
  if (value === undefined) return []
  if (Array.isArray(value)) return value.map((item) => rawValue(item as RawValue | LabeledValue))
  return multiple ? [rawValue(value as RawValue | LabeledValue)] : [rawValue(value as RawValue)]
}

export function selectedOptions(
  items: FlattenSelectItem[],
  value: SelectValue,
  multiple: boolean,
): FlattenOptionData[] {
  return rawValues(value, multiple)
    .map((item) => findOption(items, item))
    .filter((item): item is FlattenOptionData => Boolean(item))
}

export function toLabeledValue(option: FlattenOptionData): LabeledValue {
  return { value: option.value, label: option.label, key: option.key }
}

export function outputValue(
  options: FlattenOptionData[],
  multiple: boolean,
  labelInValue?: boolean,
) {
  if (multiple)
    return labelInValue ? options.map(toLabeledValue) : options.map((option) => option.value)
  const first = options[0]
  if (!first) return undefined
  return labelInValue ? toLabeledValue(first) : first.value
}
