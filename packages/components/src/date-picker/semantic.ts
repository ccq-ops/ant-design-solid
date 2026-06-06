import type { JSX } from 'solid-js'
import { classNames } from '../shared/class-names'
import type { DatePickerSemanticSlot } from './interface'

export function semanticClass(
  slot: DatePickerSemanticSlot,
  classes: Partial<Record<DatePickerSemanticSlot, string>> | undefined,
  ...values: Array<string | false | null | undefined>
): string {
  return classNames(...values, classes?.[slot])
}

export function semanticStyle(
  slot: DatePickerSemanticSlot,
  styles: Partial<Record<DatePickerSemanticSlot, JSX.CSSProperties>> | undefined,
): JSX.CSSProperties | undefined {
  return styles?.[slot]
}

export function rootVariantClass(
  prefixCls: string,
  status?: string,
  variant?: string,
  size?: string,
  bordered?: boolean,
): Array<string | false | null | undefined> {
  const effectiveVariant = variant ?? (bordered === false ? 'borderless' : undefined)
  return [
    status === 'error' && `${prefixCls}-status-error`,
    status === 'warning' && `${prefixCls}-status-warning`,
    effectiveVariant === 'outlined' && `${prefixCls}-outlined`,
    effectiveVariant === 'borderless' && `${prefixCls}-borderless`,
    effectiveVariant === 'filled' && `${prefixCls}-filled`,
    effectiveVariant === 'underlined' && `${prefixCls}-underlined`,
    size === 'small' && `${prefixCls}-sm`,
    size === 'large' && `${prefixCls}-lg`,
  ]
}
