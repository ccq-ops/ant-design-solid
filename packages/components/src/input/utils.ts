import type {
  AllowClear,
  CountConfig,
  CountFormatterInfo,
  InputFocusOptions,
  SemanticClassNamesConfig,
  SemanticStylesConfig,
} from './interface'
import type { JSX } from 'solid-js'
import type { ShowCount } from './interface'

export function getAllowClearConfig(allowClear: AllowClear | undefined) {
  if (!allowClear) return undefined
  return typeof allowClear === 'object' ? allowClear : {}
}

export function getCount(value: string, count: CountConfig | undefined) {
  return count?.strategy ? count.strategy(value) : value.length
}

export function getMaxLength(
  maxLength: string | number | undefined,
  count: CountConfig | undefined,
) {
  if (count?.max !== undefined) return count.max
  if (maxLength === undefined) return undefined
  const parsed = Number(maxLength)
  return Number.isNaN(parsed) ? undefined : parsed
}

export function formatCount(
  showCount: ShowCount | undefined,
  countConfig: CountConfig | undefined,
  info: CountFormatterInfo,
) {
  if (typeof countConfig?.show === 'function') return countConfig.show(info)
  if (typeof showCount === 'object' && showCount.formatter) return showCount.formatter(info)
  return `${info.count}${info.maxLength !== undefined ? ` / ${info.maxLength}` : ''}`
}

export function shouldShowCount(
  showCount: ShowCount | undefined,
  countConfig: CountConfig | undefined,
) {
  if (countConfig?.show !== undefined) return Boolean(countConfig.show)
  return Boolean(showCount)
}

export function applyExceedFormatter(value: string, countConfig: CountConfig | undefined) {
  if (!countConfig?.max || !countConfig.exceedFormatter) return value
  if (getCount(value, countConfig) <= countConfig.max) return value
  return countConfig.exceedFormatter(value, { max: countConfig.max })
}

export function resolveClassNames<P, T>(
  classNames: SemanticClassNamesConfig<P, T> | undefined,
  props: P,
): T {
  return typeof classNames === 'function'
    ? (classNames as (info: { props: P }) => T)({ props })
    : ((classNames ?? {}) as T)
}

export function resolveStyles<P, T>(styles: SemanticStylesConfig<P, T> | undefined, props: P): T {
  return typeof styles === 'function'
    ? (styles as (info: { props: P }) => T)({ props })
    : ((styles ?? {}) as T)
}

export function rootClass(semantic: { root?: string; wrapper?: string }) {
  return semantic.root ?? semantic.wrapper
}

export function rootStyle(semantic: { root?: JSX.CSSProperties; wrapper?: JSX.CSSProperties }) {
  return semantic.root ?? semantic.wrapper
}

export function focusInput(
  element: HTMLInputElement | HTMLTextAreaElement | undefined,
  options?: InputFocusOptions,
) {
  element?.focus({ preventScroll: options?.preventScroll })
  if (!element || !options?.cursor) return
  const length = element.value.length
  if (options.cursor === 'start') element.setSelectionRange(0, 0)
  if (options.cursor === 'end') element.setSelectionRange(length, length)
  if (options.cursor === 'all') element.setSelectionRange(0, length)
}

export function assignRef<T>(
  ref: ((value: T) => void) | { current?: T } | T | undefined,
  value: T,
) {
  if (!ref) return
  if (typeof ref === 'function') {
    ;(ref as (value: T) => void)(value)
    return
  }
  if (!('focus' in (ref as object))) {
    ;(ref as { current?: T }).current = value
    return
  }
  Object.assign(ref as object, value)
}
