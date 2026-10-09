export type ComponentRefProp<T extends object> = T | { current?: T } | ((value: T) => void)

export function setComponentRef<T extends object>(
  ref: ComponentRefProp<T> | undefined,
  value: T,
): void {
  if (typeof ref === 'function') (ref as (value: T) => void)(value)
  else if (ref && typeof ref === 'object') {
    if ('current' in ref) ref.current = value
    else Object.assign(ref, value)
  }
}
