import type { Dayjs } from 'dayjs'
import { dayjs, defaultFormatForPicker } from './date-utils'
import type { DatePickerFormat, PickerType } from './interface'

function displayFormat(
  format: DatePickerFormat | undefined,
  picker: PickerType | undefined,
): string {
  if (!format) return defaultFormatForPicker(picker)
  if (typeof format === 'string') return format
  if (Array.isArray(format)) return format[0] ?? defaultFormatForPicker(picker)
  if (typeof format === 'function') return defaultFormatForPicker(picker)
  return format.format
}

function parseFormats(
  format: DatePickerFormat | undefined,
  picker: PickerType | undefined,
): string[] {
  if (!format) return [defaultFormatForPicker(picker)]
  if (typeof format === 'string') return [format]
  if (Array.isArray(format)) return format.length ? format : [defaultFormatForPicker(picker)]
  if (typeof format === 'function') return [defaultFormatForPicker(picker)]
  return [format.format]
}

export function formatDayjs(
  value: Dayjs | null | undefined,
  format?: DatePickerFormat,
  picker?: PickerType,
): string {
  if (!value?.isValid()) return ''
  if (typeof format === 'function') return format(value)
  return value.format(displayFormat(format, picker))
}

export function parseDayjs(
  text: string,
  format?: DatePickerFormat,
  picker?: PickerType,
): Dayjs | null {
  const trimmed = text.trim()
  if (!trimmed) return null
  for (const currentFormat of parseFormats(format, picker)) {
    const parsed = dayjs(trimmed, currentFormat, true)
    if (parsed.isValid()) return parsed
  }
  const fallback = dayjs(trimmed)
  return fallback.isValid() ? fallback : null
}
