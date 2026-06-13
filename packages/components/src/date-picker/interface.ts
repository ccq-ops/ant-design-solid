import type { Dayjs } from 'dayjs'
import type { Component, JSX } from 'solid-js'

export type PickerType = 'date' | 'week' | 'month' | 'quarter' | 'year'
export type PickerMode = PickerType | 'time' | 'decade'
export type DatePickerPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'
export type DatePickerStatus = '' | 'error' | 'warning'
export type DatePickerVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'
export type DatePickerSize = 'small' | 'medium' | 'large'
export type DatePickerValue = Dayjs | null
export type DatePickerMultipleValue = Dayjs[]
export type RangePickerValue = [Dayjs | null, Dayjs | null] | null
export type RangeSide = 'start' | 'end'
export type TimeSubtype = 'hour' | 'minute' | 'second' | 'meridiem'
export type DatePickerPreviewValue = false | 'hover'

export type DatePickerFormat =
  | string
  | ((value: Dayjs) => string)
  | Array<string | ((value: Dayjs) => string)>
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
    clearStart?: string
    clearEnd?: string
    month?: string
    year?: string
    week?: string
    hour?: string
    minute?: string
    second?: string
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
    previousYears?: string
    nextYears?: string
    previousDecades?: string
    nextDecades?: string
    previousCenturies?: string
    nextCenturies?: string
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
  defaultOpenValue?: Dayjs
  format?: string
  showHour?: boolean
  showMinute?: boolean
  showSecond?: boolean
  showMillisecond?: boolean
  use12Hours?: boolean
  hideDisabledOptions?: boolean
}

export interface RangeShowTimeOptions extends Omit<ShowTimeOptions, 'defaultOpenValue'> {
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

export type SinglePresetValue = Dayjs | (() => Dayjs)
export type RangePresetEndpoint = Dayjs | (() => Dayjs) | null
export type RangePresetTuple = [RangePresetEndpoint, RangePresetEndpoint]
export type RangePresetValue = RangePresetTuple | (() => RangePresetTuple)

export interface PresetValue<T> {
  label: JSX.Element
  value: T
}

export interface TagRenderProps {
  label: JSX.Element
  value: Dayjs
  disabled: boolean
  onClose: () => void
}

export interface PickerInputSlotProps {
  prefixCls: string
  value: string
  multiple?: boolean
  multipleValues?: Dayjs[]
  multipleFormat?: DatePickerFormat
  multiplePicker?: PickerType
  tagRender?: (props: TagRenderProps) => JSX.Element
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  allowClear?: boolean
  clearIcon?: JSX.Element
  clearAriaLabel?: string
  prefix?: JSX.Element
  suffixIcon?: JSX.Element
  showSuffixIcon?: boolean
  id?: string
  name?: string
  ariaLabel?: string
  autoFocus?: boolean
  inputClass?: string
  inputStyle?: JSX.CSSProperties
  clearClass?: string
  clearStyle?: JSX.CSSProperties
  inputRef?: (element: HTMLInputElement) => void
  onInput?: JSX.EventHandler<HTMLInputElement, InputEvent>
  onFocus?: JSX.EventHandler<HTMLInputElement, FocusEvent>
  onBlur?: JSX.EventHandler<HTMLInputElement, FocusEvent>
  onKeyDown?: JSX.EventHandler<HTMLInputElement, KeyboardEvent>
  onClear?: (event: MouseEvent) => void
  onRemoveTag?: (value: Dayjs) => void
}

export interface PickerPanelSlotProps {
  prefixCls: string
  mode: PickerMode
  children?: JSX.Element
}

export type PickerComponents = Partial<
  Record<'input', Component<PickerInputSlotProps>> &
    Record<'panel' | PickerMode, Component<PickerPanelSlotProps>>
> &
  Record<string, Component<any> | undefined>

export type DatePickerSemanticSlot =
  | 'root'
  | 'selector'
  | 'input'
  | 'clear'
  | 'popup'
  | 'cell'
  | 'presets'
  | 'footer'

export type SemanticClassNames<Slot extends string, Props> =
  | Partial<Record<Slot, string>>
  | ((info: { props: Props }) => Partial<Record<Slot, string>>)

export type SemanticStyles<Slot extends string, Props> =
  | Partial<Record<Slot, JSX.CSSProperties>>
  | ((info: { props: Props }) => Partial<Record<Slot, JSX.CSSProperties>>)

type ReactClassPropName = `class${'Name'}`

export interface CommonPickerProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  | 'onChange'
  | 'onInput'
  | 'onFocus'
  | 'onBlur'
  | 'onKeyDown'
  | 'onSelect'
  | 'prefix'
  | 'ref'
  | ReactClassPropName
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
  size?: DatePickerSize
  status?: DatePickerStatus
  variant?: DatePickerVariant
  locale?: DatePickerLocale
  disabledDate?: (current: Dayjs, info: { type: PickerType; from?: Dayjs }) => boolean
  minDate?: Dayjs
  maxDate?: Dayjs
  showNow?: boolean
  cellRender?: (current: Dayjs, info: CellRenderInfo) => JSX.Element
  dateRender?: (current: Dayjs, today: Dayjs) => JSX.Element
  renderExtraFooter?: (mode: PickerMode) => JSX.Element
  panelRender?: (panel: JSX.Element) => JSX.Element
  suffixIcon?: JSX.Element
  prefix?: JSX.Element
  separator?: JSX.Element
  prevIcon?: JSX.Element
  nextIcon?: JSX.Element
  superPrevIcon?: JSX.Element
  superNextIcon?: JSX.Element
  components?: PickerComponents
  previewValue?: DatePickerPreviewValue
  onSelect?: (date: Dayjs) => void
  showWeek?: boolean
  classNames?: SemanticClassNames<DatePickerSemanticSlot, DatePickerProps | RangePickerProps>
  styles?: SemanticStyles<DatePickerSemanticSlot, DatePickerProps | RangePickerProps>
  prefixCls?: string
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement | ShadowRoot
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
  showTime?: boolean | ShowTimeOptions
  disabledTime?: (date: Dayjs | null) => DisabledTimeConfig
  presets?: Array<PresetValue<SinglePresetValue>>
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
  showTime?: never
  disabledTime?: never
  presets?: Array<PresetValue<SinglePresetValue>>
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
  | 'disabledTime'
  | 'showWeek'
> {
  value?: RangePickerValue
  defaultValue?: RangePickerValue
  defaultPickerValue?: Dayjs | [Dayjs, Dayjs]
  pickerValue?: Dayjs | [Dayjs, Dayjs]
  id?: { start?: string; end?: string }
  placeholder?: [string, string]
  disabled?: boolean | [boolean, boolean]
  allowEmpty?: [boolean, boolean]
  showTime?: boolean | RangeShowTimeOptions
  disabledTime?: (
    date: Dayjs | null,
    partial: RangeSide,
    info: { from?: Dayjs },
  ) => DisabledTimeConfig
  presets?: Array<PresetValue<RangePresetValue>>
  order?: boolean
  onChange?: (dates: RangePickerValue, dateStrings: [string, string] | null) => void
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
