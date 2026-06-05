import type { JSX } from 'solid-js'

export type TimePickerFormat = 'HH:mm:ss' | 'HH:mm'

export interface TimePickerProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  defaultValue?: string
  format?: TimePickerFormat
  placeholder?: string
  disabled?: boolean
  allowClear?: boolean
  open?: boolean
  defaultOpen?: boolean
  minuteStep?: number
  secondStep?: number
  disabledHours?: () => number[]
  disabledMinutes?: (selectedHour: number | undefined) => number[]
  disabledSeconds?: (
    selectedHour: number | undefined,
    selectedMinute: number | undefined,
  ) => number[]
  onChange?: (value: string | undefined) => void
  onOpenChange?: (open: boolean) => void
  prefixCls?: string
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
}
