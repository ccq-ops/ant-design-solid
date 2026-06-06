import type { InternalNamePath, NamePath } from './interface'

export function getNamePath(name: NamePath): InternalNamePath {
  return Array.isArray(name) ? [...name] : [name]
}

export function serializeNamePath(name: NamePath): string {
  return JSON.stringify(getNamePath(name))
}

export function isSameNamePath(first: NamePath, second: NamePath): boolean {
  const firstPath = getNamePath(first)
  const secondPath = getNamePath(second)
  if (firstPath.length !== secondPath.length) return false
  return firstPath.every((segment, index) => segment === secondPath[index])
}

export function containsNamePath(parent: NamePath, child: NamePath): boolean {
  const parentPath = getNamePath(parent)
  const childPath = getNamePath(child)
  if (parentPath.length > childPath.length) return false
  return parentPath.every((segment, index) => segment === childPath[index])
}

export function matchNamePath(base: NamePath, target: NamePath, recursive = false): boolean {
  return recursive ? containsNamePath(base, target) : isSameNamePath(base, target)
}

export function composeNamePath(prefix: NamePath | undefined, name: NamePath): InternalNamePath {
  return prefix === undefined ? getNamePath(name) : [...getNamePath(prefix), ...getNamePath(name)]
}
