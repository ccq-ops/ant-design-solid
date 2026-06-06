import type { FormValues, InternalNamePath, NamePath } from './interface'
import { getNamePath } from './name-path'

type Container = unknown[] | Record<string, unknown>
type PathSegment = string | number

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item)) as T
  if (isPlainObject(value)) {
    const next: Record<string, unknown> = {}
    for (const key of Object.keys(value)) next[key] = cloneValue(value[key])
    return next as T
  }
  return value
}

function createContainer(nextSegment: PathSegment | undefined): Container {
  return typeof nextSegment === 'number' ? [] : {}
}

function cloneContainer(value: unknown, nextSegment: PathSegment | undefined): Container {
  if (Array.isArray(value)) return [...value]
  if (isPlainObject(value)) return { ...value }
  return createContainer(nextSegment)
}

function readSegment(value: unknown, segment: PathSegment): unknown {
  if (value === null || typeof value !== 'object') return undefined
  return (value as Record<PathSegment, unknown>)[segment]
}

function writeSegment(container: Container, segment: PathSegment, value: unknown): void {
  ;(container as Record<PathSegment, unknown>)[segment] = value
}

function deleteSegment(container: Container, segment: PathSegment): void {
  delete (container as Record<PathSegment, unknown>)[segment]
}

export function cloneFormValues(values: FormValues): FormValues {
  return cloneValue(values)
}

export function getValue(values: FormValues, name: NamePath): unknown {
  let current: unknown = values
  for (const segment of getNamePath(name)) {
    current = readSegment(current, segment)
    if (current === undefined) return undefined
  }
  return current
}

export function setValue(values: FormValues, name: NamePath, value: unknown): FormValues {
  const path = getNamePath(name)
  if (path.length === 0) return cloneValue(value) as FormValues

  const root = cloneContainer(values, path[0])
  let current = root

  for (let index = 0; index < path.length; index += 1) {
    const segment = path[index]
    const isLast = index === path.length - 1

    if (isLast) {
      writeSegment(current, segment, cloneValue(value))
      continue
    }

    const nextSegment = path[index + 1]
    const nextValue = cloneContainer(readSegment(current, segment), nextSegment)
    writeSegment(current, segment, nextValue)
    current = nextValue
  }

  return root as FormValues
}

export function deleteValue(values: FormValues, name: NamePath): FormValues {
  const path = getNamePath(name)
  if (path.length === 0) return {}

  const root = cloneContainer(values, path[0])
  let current = root

  for (let index = 0; index < path.length - 1; index += 1) {
    const segment = path[index]
    const nextSegment = path[index + 1]
    const nextValue = cloneContainer(readSegment(current, segment), nextSegment)
    writeSegment(current, segment, nextValue)
    current = nextValue
  }

  deleteSegment(current, path[path.length - 1])
  return root as FormValues
}

export function mergeValues(current: FormValues, patch: FormValues): FormValues {
  const next = cloneFormValues(current)

  for (const key of Object.keys(patch)) {
    const currentValue = next[key]
    const patchValue = patch[key]
    next[key] =
      isPlainObject(currentValue) && isPlainObject(patchValue)
        ? mergeValues(currentValue, patchValue)
        : cloneValue(patchValue)
  }

  return next
}

export function flattenValuePaths(
  values: unknown,
  prefix: InternalNamePath = [],
): InternalNamePath[] {
  if (Array.isArray(values)) {
    return values.flatMap((item, index) => flattenValuePaths(item, [...prefix, index]))
  }
  if (isPlainObject(values)) {
    return Object.keys(values).flatMap((key) => flattenValuePaths(values[key], [...prefix, key]))
  }
  return prefix.length > 0 ? [prefix] : []
}

export function pickValues(values: FormValues, names: NamePath[]): FormValues {
  return names.reduce<FormValues>((picked, name) => {
    const value = getValue(values, name)
    return value === undefined ? picked : setValue(picked, name, value)
  }, {})
}
