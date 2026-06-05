import type { OptionValue } from '../shared/options'
import type { CascaderOption } from './interface'
import {
  collectSelectableLeafPaths,
  findOptionPath,
  pathKey,
  valuePathFromOptions,
} from './path-utils'

export function isMultipleValue(
  value: OptionValue[] | OptionValue[][] | undefined,
): value is OptionValue[][] {
  return Array.isArray(value?.[0])
}

export function normalizeMultipleValue(
  value: OptionValue[] | OptionValue[][] | undefined,
): OptionValue[][] {
  if (!value) return []
  return isMultipleValue(value) ? value : []
}

export function normalizeSingleValue(
  value: OptionValue[] | OptionValue[][] | undefined,
): OptionValue[] {
  if (!value || isMultipleValue(value)) return []
  return value
}

export function selectedOptionPaths(
  options: CascaderOption[],
  valuePaths: OptionValue[][],
): CascaderOption[][] {
  return valuePaths.map((path) => findOptionPath(options, path)).filter((path) => path.length > 0)
}

export function togglePathInMultipleValue(
  current: OptionValue[][],
  optionPath: CascaderOption[],
  changeOnSelect: boolean,
): OptionValue[][] {
  const target = optionPath[optionPath.length - 1]
  if (!target || target.disabled) return current

  const targetPaths =
    target.children?.length && !changeOnSelect
      ? collectSelectableLeafPaths(target).map((path) => [...optionPath.slice(0, -1), ...path])
      : [optionPath]

  const currentMap = new Map(current.map((path) => [pathKey(path), path]))
  const targetKeys = targetPaths.map((path) => pathKey(valuePathFromOptions(path)))
  const allSelected = targetKeys.length > 0 && targetKeys.every((key) => currentMap.has(key))

  for (const targetPath of targetPaths) {
    const valuePath = valuePathFromOptions(targetPath)
    const key = pathKey(valuePath)
    if (allSelected) currentMap.delete(key)
    else currentMap.set(key, valuePath)
  }

  return Array.from(currentMap.values())
}

export function removePathFromMultipleValue(
  current: OptionValue[][],
  valuePath: OptionValue[],
): OptionValue[][] {
  const removeKey = pathKey(valuePath)
  return current.filter((path) => pathKey(path) !== removeKey)
}

export function getPathCheckState(
  selectedValuePaths: OptionValue[][],
  optionPath: CascaderOption[],
): { checked: boolean; indeterminate: boolean } {
  const selectedKeys = new Set(selectedValuePaths.map(pathKey))
  const ownKey = pathKey(valuePathFromOptions(optionPath))
  if (selectedKeys.has(ownKey)) return { checked: true, indeterminate: false }

  const target = optionPath[optionPath.length - 1]
  if (!target?.children?.length) return { checked: false, indeterminate: false }

  const leafPaths = collectSelectableLeafPaths(target).map((path) => [
    ...optionPath.slice(0, -1),
    ...path,
  ])
  const leafKeys = leafPaths.map((path) => pathKey(valuePathFromOptions(path)))
  const checkedCount = leafKeys.filter((key) => selectedKeys.has(key)).length

  return {
    checked: leafKeys.length > 0 && checkedCount === leafKeys.length,
    indeterminate: checkedCount > 0 && checkedCount < leafKeys.length,
  }
}
