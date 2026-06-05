import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import quarterOfYear from 'dayjs/plugin/quarterOfYear'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import type { Dayjs, OpUnitType } from 'dayjs'
import type { DatePickerValue, PickerType, RangePickerValue } from './interface'

dayjs.extend(customParseFormat)
dayjs.extend(advancedFormat)
dayjs.extend(localizedFormat)
dayjs.extend(quarterOfYear)
dayjs.extend(weekOfYear)

export { dayjs }
export type { Dayjs }

export function isDayjsValue(value: unknown): value is Dayjs {
  return dayjs.isDayjs(value) && value.isValid()
}

export function normalizeDateValue(value: DatePickerValue | undefined): Dayjs | null {
  if (value == null) return null
  return isDayjsValue(value) ? value : null
}

export function defaultFormatForPicker(picker: PickerType = 'date'): string {
  switch (picker) {
    case 'week':
      return 'YYYY-wo'
    case 'month':
      return 'YYYY-MM'
    case 'quarter':
      return 'YYYY-[Q]Q'
    case 'year':
      return 'YYYY'
    case 'time':
      return 'HH:mm:ss'
    case 'date':
    default:
      return 'YYYY-MM-DD'
  }
}

export function pickerUnit(picker: PickerType = 'date'): OpUnitType {
  switch (picker) {
    case 'week':
      return 'week'
    case 'month':
      return 'month'
    case 'quarter':
      return 'month'
    case 'year':
      return 'year'
    case 'time':
      return 'second'
    case 'date':
    default:
      return 'day'
  }
}

export function samePickerValue(
  left: Dayjs | null | undefined,
  right: Dayjs | null | undefined,
  picker: PickerType = 'date',
): boolean {
  if (!left || !right) return left == null && right == null
  return left.isSame(right, pickerUnit(picker))
}

export function isBeforeMin(value: Dayjs, minDate: Dayjs | undefined, picker: PickerType = 'date') {
  return Boolean(minDate && value.isBefore(minDate, pickerUnit(picker)))
}

export function isAfterMax(value: Dayjs, maxDate: Dayjs | undefined, picker: PickerType = 'date') {
  return Boolean(maxDate && value.isAfter(maxDate, pickerUnit(picker)))
}

export function isOutOfBounds(
  value: Dayjs,
  minDate: Dayjs | undefined,
  maxDate: Dayjs | undefined,
  picker: PickerType = 'date',
): boolean {
  return isBeforeMin(value, minDate, picker) || isAfterMax(value, maxDate, picker)
}

export function sortRange(value: [Dayjs | null, Dayjs | null]): [Dayjs | null, Dayjs | null] {
  const [start, end] = value
  if (start && end && end.isBefore(start, 'day')) return [end, start]
  return value
}

export function rangeToNullable(value: [Dayjs | null, Dayjs | null] | undefined): RangePickerValue {
  if (!value || (!value[0] && !value[1])) return null
  return value
}

export function monthStart(value: Dayjs): Dayjs {
  return value.startOf('month')
}
