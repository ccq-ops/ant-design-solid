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
  defaultOpenValue?: Dayjs
  format?: string
  showHour?: boolean
  showMinute?: boolean
  showSecond?: boolean
  showMillisecond?: boolean
  use12Hours?: boolean
  hideDisabledOptions?: boolean
}

export interface RangeShowTimeOptions extends Omit<
  ShowTimeOptions,
  'defaultValue' | 'defaultOpenValue'
> {
  defaultValue?: [Dayjs, Dayjs]
  defaultOpenValue?: [Dayjs, Dayjs]
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
  'onChange' | 'onInput' | 'onFocus' | 'onBlur' | 'onKeyDown' | 'prefix' | 'ref'
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
  showNow?: boolean
  disabledTime?: (date: Dayjs | null) => DisabledTimeConfig
  cellRender?: (current: Dayjs, info: CellRenderInfo) => JSX.Element
  dateRender?: (current: Dayjs, today: Dayjs) => JSX.Element
  renderExtraFooter?: (mode: PickerMode) => JSX.Element
  panelRender?: (panel: JSX.Element) => JSX.Element
  suffixIcon?: JSX.Element
  prefix?: JSX.Element
  separator?: JSX.Element
  prevIcon?: JSX.Element
  nextIcon?: JSX.Element
  previousIcon?: JSX.Element
  bordered?: boolean
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
  onFocus?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>
  onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>
  onKeyDown?: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent>
  ref?: DatePickerRef | { current?: DatePickerRef } | ((ref: DatePickerRef) => void)
}

export interface DatePickerSingleProps extends CommonPickerProps {
  value?: DatePickerValue
  defaultValue?: DatePickerValue
  multiple?: false
  order?: boolean
  presets?: PresetValue[]
  needConfirm?: boolean
  tagRender?: (props: TagRenderProps) => JSX.Element
  onChange?: (date: DatePickerValue, dateString: string) => void
  onOk?: (date?: DatePickerValue) => void
}

export interface DatePickerMultipleProps extends CommonPickerProps {
  value?: DatePickerMultipleValue
  defaultValue?: DatePickerMultipleValue
  multiple: true
  order?: boolean
  presets?: PresetValue[]
  needConfirm?: boolean
  tagRender?: (props: TagRenderProps) => JSX.Element
  onChange?: (date: DatePickerMultipleValue, dateString: string[]) => void
  onOk?: (date?: DatePickerMultipleValue) => void
}

export type DatePickerProps = DatePickerSingleProps | DatePickerMultipleProps

export interface RangePickerProps extends Omit<
  CommonPickerProps,
  | 'placeholder'
  | 'showTime'
  | 'defaultPickerValue'
  | 'pickerValue'
  | 'onPanelChange'
  | 'disabled'
  | 'id'
  | 'onFocus'
  | 'onBlur'
> {
  value?: RangePickerValue
  defaultValue?: RangePickerValue
  defaultPickerValue?: Dayjs | [Dayjs, Dayjs]
  pickerValue?: Dayjs | [Dayjs, Dayjs]
  id?: string | [string, string]
  placeholder?: [string, string]
  disabled?: boolean | [boolean, boolean]
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
  onFocus?: (event: FocusEvent, info: { range: RangeSide }) => void
  onBlur?: (event: FocusEvent, info: { range: RangeSide }) => void
}

export interface DatePickerRef {
  focus: () => void
  blur: () => void
  nativeElement?: HTMLDivElement
}
