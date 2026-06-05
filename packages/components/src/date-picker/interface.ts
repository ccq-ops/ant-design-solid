import type { Dayjs } from 'dayjs'
import type { JSX } from 'solid-js'
import type { ComponentSize } from '../config-provider'

export type PickerType = 'date' | 'week' | 'month' | 'quarter' | 'year' | 'time'
export type PickerMode = PickerType | 'decade'
export type DatePickerPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'
export type DatePickerStatus = '' | 'error' | 'warning'
export type DatePickerVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'
export type DatePickerValue = Dayjs | null
export type DatePickerMultipleValue = Dayjs[]
export type RangePickerValue = [Dayjs | null, Dayjs | null] | null
export type RangeSide = 'start' | 'end'
export type TimeSubtype = 'hour' | 'minute' | 'second' | 'meridiem'

export type DatePickerFormat =
  | string
  | string[]
  | ((value: Dayjs) => string)
  | { format: string; type?: 'mask' }

export interface DatePickerLocale {
  lang?: {
    locale?: string
    placeholder?: string
    rangePlaceholder?: [string, string]
    today?: string
    now?: string
    backToToday?: string
    ok?: string
    clear?: string
    month?: string
    year?: string
    timeSelect?: string
    dateSelect?: string
    weekSelect?: string
    monthSelect?: string
    yearSelect?: string
    decadeSelect?: string
    previousMonth?: string
    nextMonth?: string
    previousYear?: string
    nextYear?: string
    previousDecade?: string
    nextDecade?: string
  }
  timePickerLocale?: Record<string, unknown>
}

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

export interface ShowTimeOptions extends DisabledTimeConfig {
  defaultValue?: Dayjs
  format?: string
  showHour?: boolean
  showMinute?: boolean
  showSecond?: boolean
  showMillisecond?: boolean
  use12Hours?: boolean
  hideDisabledOptions?: boolean
}

export interface RangeShowTimeOptions extends Omit<ShowTimeOptions, 'defaultValue'> {
  defaultValue?: [Dayjs, Dayjs]
}

export interface CellRenderInfo {
  originNode: JSX.Element
  today: Dayjs
  range?: RangeSide
  type: PickerType
  locale?: DatePickerLocale
  subType?: TimeSubtype
}

export interface PresetValue {
  label: JSX.Element
  value: Dayjs | (() => Dayjs) | RangePickerValue | (() => RangePickerValue)
}

export interface TagRenderProps {
  label: JSX.Element
  value: Dayjs
  disabled: boolean
  onClose: () => void
}

export type DatePickerSemanticSlot =
  | 'root'
  | 'selector'
  | 'input'
  | 'clear'
  | 'popup'
  | 'cell'
  | 'presets'
  | 'footer'

export interface CommonPickerProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'onInput' | 'onBlur' | 'onKeyDown' | 'prefix'
> {
  id?: string
  name?: string
  format?: DatePickerFormat
  picker?: PickerType
  mode?: PickerMode
  placeholder?: string
  disabled?: boolean
  allowClear?: boolean | { clearIcon?: JSX.Element }
  autoFocus?: boolean
  inputReadOnly?: boolean
  preserveInvalidOnBlur?: boolean
  open?: boolean
  defaultOpen?: boolean
  pickerValue?: Dayjs
  defaultPickerValue?: Dayjs
  placement?: DatePickerPlacement
  size?: ComponentSize
  status?: DatePickerStatus
  variant?: DatePickerVariant
  locale?: DatePickerLocale
  disabledDate?: (current: Dayjs, info: { type: PickerType }) => boolean
  minDate?: Dayjs
  maxDate?: Dayjs
  showTime?: boolean | ShowTimeOptions
  cellRender?: (current: Dayjs, info: CellRenderInfo) => JSX.Element
  dateRender?: (current: Dayjs, today: Dayjs) => JSX.Element
  renderExtraFooter?: (mode: PickerMode) => JSX.Element
  panelRender?: (panel: JSX.Element) => JSX.Element
  suffixIcon?: JSX.Element
  prefix?: JSX.Element
  separator?: JSX.Element
  classNames?: Partial<Record<DatePickerSemanticSlot, string>>
  styles?: Partial<Record<DatePickerSemanticSlot, JSX.CSSProperties>>
  prefixCls?: string
  className?: string
  popupClassName?: string
  dropdownClassName?: string
  popupStyle?: JSX.CSSProperties
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
  onOpenChange?: (open: boolean) => void
  onPanelChange?: (value: Dayjs, mode: PickerMode) => void
  onKeyDown?: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent>
}

export interface DatePickerProps extends CommonPickerProps {
  value?: DatePickerValue
  defaultValue?: DatePickerValue
  multiple?: boolean
  order?: boolean
  presets?: PresetValue[]
  needConfirm?: boolean
  onChange?: (date: DatePickerValue, dateString: string) => void
  onOk?: (date: DatePickerValue) => void
}

export interface RangePickerProps extends Omit<
  CommonPickerProps,
  'placeholder' | 'showTime' | 'defaultPickerValue' | 'pickerValue' | 'onPanelChange'
> {
  value?: RangePickerValue
  defaultValue?: RangePickerValue
  defaultPickerValue?: Dayjs | [Dayjs, Dayjs]
  pickerValue?: Dayjs | [Dayjs, Dayjs]
  placeholder?: [string, string]
  allowEmpty?: [boolean, boolean]
  showTime?: boolean | RangeShowTimeOptions
  presets?: PresetValue[]
  order?: boolean
  onChange?: (dates: RangePickerValue, dateStrings: [string, string]) => void
  onCalendarChange?: (
    dates: RangePickerValue,
    dateStrings: [string, string],
    info: { range: RangeSide },
  ) => void
  onOk?: (dates: RangePickerValue) => void
  onPanelChange?: (value: Dayjs | [Dayjs, Dayjs], mode: PickerMode) => void
}

export interface DatePickerRef {
  focus: () => void
  blur: () => void
  nativeElement?: HTMLDivElement
}
