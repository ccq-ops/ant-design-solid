import type { JSX } from 'solid-js'
import type { OptionValue } from '../shared/options'
import type {
  CascaderFieldNames,
  CascaderOption,
  CascaderOptionInput,
  CascaderShowCheckedStrategy,
} from './interface'
import type { CascaderPathEntity, NormalizedFieldNames } from './types'

export const SHOW_PARENT = 'SHOW_PARENT' satisfies CascaderShowCheckedStrategy
export const SHOW_CHILD = 'SHOW_CHILD' satisfies CascaderShowCheckedStrategy

export function pathKey(valuePath: OptionValue[]): string {
  return valuePath.map(String).join('\u0000')
}

export function normalizeFieldNames(fieldNames?: CascaderFieldNames): NormalizedFieldNames {
  return {
    label: fieldNames?.label ?? 'label',
    value: fieldNames?.value ?? 'value',
    children: fieldNames?.children ?? 'children',
  }
}

export function normalizeOptions(
  options: CascaderOptionInput[] | undefined,
  fieldNames?: CascaderFieldNames,
): CascaderOption[] {
  const names = normalizeFieldNames(fieldNames)
  return (options ?? []).map((option) => {
    const children = option[names.children] as CascaderOptionInput[] | undefined
    const label = (option[names.label] as JSX.Element | undefined) ?? option.label
    const value = (option[names.value] as OptionValue | undefined) ?? option.value
    const normalized: CascaderOption = {
      ...(option as Record<string, unknown>),
      label: label ?? '',
      value: value ?? '',
      children: children
        ? normalizeOptions(children, fieldNames)
        : option.children
          ? normalizeOptions(option.children, fieldNames)
          : undefined,
    }
    return normalized
  })
}

export function valuePathFromOptions(options: CascaderOption[]): OptionValue[] {
  return options.map((option) => option.value).filter((value) => value !== undefined)
}

export function valuesEqual(a: OptionValue[], b: OptionValue[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index])
}

export function findOptionPath(
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

export function buildColumns(
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

export function optionHasChildren(option: CascaderOption): boolean {
  return Boolean(option.children?.length)
}

export function optionCanLoad(option: CascaderOption): boolean {
  return option.isLeaf === false && !option.children?.length
}

export function isSelectablePath(path: CascaderOption[], changeOnSelect: boolean): boolean {
  const last = path[path.length - 1]
  if (!last || last.disabled) return false
  return changeOnSelect || !last.children?.length || last.isLeaf === true
}

export function flattenOptionPaths(
  options: CascaderOption[],
  parent: CascaderOption[] = [],
): CascaderOption[][] {
  const paths: CascaderOption[][] = []
  for (const option of options) {
    const path = [...parent, option]
    paths.push(path)
    if (option.children?.length) paths.push(...flattenOptionPaths(option.children, path))
  }
  return paths
}

export function collectSelectableLeafPaths(option: CascaderOption): CascaderOption[][] {
  if (option.disabled) return []
  if (!option.children?.length) return [[option]]

  return option.children.flatMap((child) =>
    collectSelectableLeafPaths(child).map((path) => [option, ...path]),
  )
}

export function isAncestorValuePath(ancestor: OptionValue[], descendant: OptionValue[]): boolean {
  return (
    ancestor.length < descendant.length &&
    ancestor.every((value, index) => value === descendant[index])
  )
}

export function createPathEntity(path: CascaderOption[], label: JSX.Element): CascaderPathEntity {
  const value = valuePathFromOptions(path)
  return { value, options: path, key: pathKey(value), label }
}

function allSelectableLeavesSelected(
  parentPath: CascaderOption[],
  selectedKeys: Set<string>,
): boolean {
  const parent = parentPath[parentPath.length - 1]
  if (!parent) return false
  const leafPaths = collectSelectableLeafPaths(parent).map((leafPath) => [
    ...parentPath.slice(0, -1),
    ...leafPath,
  ])
  return (
    leafPaths.length > 0 &&
    leafPaths.every((path) => selectedKeys.has(pathKey(valuePathFromOptions(path))))
  )
}

export function filterDisplayedPaths(
  selectedPaths: CascaderOption[][],
  strategy: CascaderShowCheckedStrategy,
  rootOptions: CascaderOption[],
): CascaderOption[][] {
  if (strategy === SHOW_CHILD) {
    return selectedPaths.filter((path) => !path[path.length - 1]?.children?.length)
  }

  const selectedKeys = new Set(selectedPaths.map((path) => pathKey(valuePathFromOptions(path))))
  const allPaths = flattenOptionPaths(rootOptions)
  const display: CascaderOption[][] = []
  const hiddenKeys = new Set<string>()

  for (const path of allPaths) {
    const key = pathKey(valuePathFromOptions(path))
    if (hiddenKeys.has(key)) continue
    const selectedDirectly = selectedKeys.has(key)
    const selectedByChildren = allSelectableLeavesSelected(path, selectedKeys)
    if (!selectedDirectly && !selectedByChildren) continue

    display.push(path)
    for (const descendantPath of allPaths) {
      const descendantKey = pathKey(valuePathFromOptions(descendantPath))
      if (isAncestorValuePath(valuePathFromOptions(path), valuePathFromOptions(descendantPath))) {
        hiddenKeys.add(descendantKey)
      }
    }
  }

  return display
}
