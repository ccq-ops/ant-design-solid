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
