import type { JSX } from 'solid-js'
import { classNames } from '../shared/class-names'
import type { DatePickerSemanticSlot, SemanticClassNames, SemanticStyles } from './interface'

export type ResolvedSemanticClasses = Partial<Record<DatePickerSemanticSlot, string>>
export type ResolvedSemanticStyles = Partial<Record<DatePickerSemanticSlot, JSX.CSSProperties>>

export function resolveSemanticClassNames<Props>(
  classes: SemanticClassNames<DatePickerSemanticSlot, Props> | undefined,
  props: Props,
): ResolvedSemanticClasses | undefined {
  return typeof classes === 'function' ? classes({ props }) : classes
}

export function resolveSemanticStyles<Props>(
  styles: SemanticStyles<DatePickerSemanticSlot, Props> | undefined,
  props: Props,
): ResolvedSemanticStyles | undefined {
  return typeof styles === 'function' ? styles({ props }) : styles
}

export function semanticClass(
  slot: DatePickerSemanticSlot,
  classes: ResolvedSemanticClasses | undefined,
  ...values: Array<string | false | null | undefined>
): string {
  return classNames(...values, classes?.[slot])
}

export function semanticStyle(
  slot: DatePickerSemanticSlot,
  styles: ResolvedSemanticStyles | undefined,
): JSX.CSSProperties | undefined {
  return styles?.[slot]
}

export function rootVariantClass(
  prefixCls: string,
  status?: string,
  variant?: string,
  size?: string,
): Array<string | false | null | undefined> {
  const effectiveVariant = variant
  return [
    status === 'error' && `${prefixCls}-status-error`,
    status === 'warning' && `${prefixCls}-status-warning`,
    effectiveVariant === 'outlined' && `${prefixCls}-outlined`,
    effectiveVariant === 'borderless' && `${prefixCls}-borderless`,
    effectiveVariant === 'filled' && `${prefixCls}-filled`,
    effectiveVariant === 'underlined' && `${prefixCls}-underlined`,
    size === 'small' && `${prefixCls}-sm`,
    size === 'medium' && `${prefixCls}-md`,
    size === 'large' && `${prefixCls}-lg`,
  ]
}
