import type { Dayjs } from 'dayjs'
import type { JSX } from 'solid-js'

export type TimePickerFormat = string
export type TimePickerValue = Dayjs | string | null | undefined
export type TimePickerRangeValue = [Dayjs | null, Dayjs | null] | null
export type TimePickerPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'
export type TimePickerSize = 'large' | 'medium' | 'small'
export type TimePickerStatus = 'error' | 'warning' | 'success' | 'validating'
export type TimePickerVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'
export type TimePickerAllowClear = boolean | { clearIcon?: JSX.Element }
export type TimePickerSemanticSlot =
  | 'root'
  | 'selector'
  | 'input'
  | 'clear'
  | 'suffix'
  | 'popup'
  | 'panel'
  | 'column'
  | 'cell'
  | 'footer'

export interface DisabledTimeConfig {
  disabledHours?: () => number[]
  disabledMinutes?: (selectedHour: number) => number[]
  disabledSeconds?: (selectedHour: number, selectedMinute: number) => number[]
  disabledMilliseconds?: (
    selectedHour: number,
    selectedMinute: number,
    selectedSecond: number,
  ) => number[]
}

export type DisabledTime = (now: Dayjs) => DisabledTimeConfig
export type RangeDisabledTime = (now: Dayjs, type: 'start' | 'end') => DisabledTimeConfig

export interface TimePickerCellRenderInfo {
  originNode: JSX.Element
  today: Dayjs
  range?: 'start' | 'end'
  subType: 'hour' | 'minute' | 'second' | 'meridiem'
}

export interface TimePickerRef {
  focus: () => void
  blur: () => void
  nativeElement?: HTMLDivElement
}

export interface TimePickerProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'ref' | 'prefix'
> {
  value?: TimePickerValue
  defaultValue?: TimePickerValue
  format?: TimePickerFormat
  placeholder?: string
  disabled?: boolean
  allowClear?: TimePickerAllowClear
  open?: boolean
  defaultOpen?: boolean
  hourStep?: number
  minuteStep?: number
  secondStep?: number
  hideDisabledOptions?: boolean
  changeOnScroll?: boolean
  disabledTime?: DisabledTime
  disabledHours?: () => number[]
  disabledMinutes?: (selectedHour: number) => number[]
  disabledSeconds?: (selectedHour: number, selectedMinute: number) => number[]
  placement?: TimePickerPlacement
  inputReadOnly?: boolean
  prefix?: JSX.Element
  suffixIcon?: JSX.Element
  cellRender?: (current: number, info: TimePickerCellRenderInfo) => JSX.Element
  renderExtraFooter?: () => JSX.Element
  needConfirm?: boolean
  showNow?: boolean
  use12Hours?: boolean
  size?: TimePickerSize
  status?: TimePickerStatus
  variant?: TimePickerVariant
  onChange?: (time: Dayjs | null, timeString: string) => void
  onOpenChange?: (open: boolean) => void
  classNames?: Partial<Record<TimePickerSemanticSlot, string>>
  styles?: Partial<Record<TimePickerSemanticSlot, JSX.CSSProperties>>
  popupClassName?: string
  dropdownClassName?: string
  popupStyle?: JSX.CSSProperties
  ref?: TimePickerRef | { current?: TimePickerRef } | ((ref: TimePickerRef) => void)
  prefixCls?: string
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
}

export interface TimeRangePickerProps extends Omit<
  TimePickerProps,
  'value' | 'defaultValue' | 'placeholder' | 'disabledTime' | 'onChange'
> {
  value?: TimePickerRangeValue
  defaultValue?: TimePickerRangeValue
  placeholder?: [string, string]
  disabledTime?: RangeDisabledTime
  order?: boolean
  onChange?: (times: TimePickerRangeValue, timeStrings: [string, string]) => void
}
