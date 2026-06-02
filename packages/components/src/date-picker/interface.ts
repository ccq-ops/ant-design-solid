import type { JSX } from 'solid-js'

export type DatePickerValue = Date | string

export interface DatePickerProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: DatePickerValue
  defaultValue?: DatePickerValue
  format?: string
  placeholder?: string
  disabled?: boolean
  allowClear?: boolean
  open?: boolean
  defaultOpen?: boolean
  disabledDate?: (date: Date) => boolean
  onChange?: (value: Date | undefined, dateString: string) => void
  onOpenChange?: (open: boolean) => void
  prefixCls?: string
}
