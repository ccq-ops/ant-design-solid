import type { JSX } from 'solid-js'
import type { ComponentSize } from '../config-provider'
import type { OptionValue } from '../shared/options'

export type RawValue = OptionValue
export type SelectMode = 'multiple' | 'tags'
export type SelectPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'
export type SelectStatus = '' | 'error' | 'warning'
export type SelectVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'

export interface LabeledValue {
  key?: string
  value: RawValue
  label: JSX.Element
}

export type SelectValue = RawValue | RawValue[] | LabeledValue | LabeledValue[] | undefined

export interface SelectFieldNames {
  label?: string
  value?: string
  options?: string
  groupLabel?: string
}

export interface SelectOption {
  label?: JSX.Element
  value?: RawValue
  disabled?: boolean
  class?: string
  className?: string
  style?: JSX.CSSProperties
  title?: string
  key?: string
  [key: string]: unknown
}

export interface SelectOptionGroup {
  label?: JSX.Element
  options?: SelectOptionInput[]
  class?: string
  className?: string
  title?: string
  key?: string
  [key: string]: unknown
}

export type SelectOptionInput = RawValue | SelectOption | SelectOptionGroup

export interface FlattenOptionData {
  label: JSX.Element
  value: RawValue
  disabled?: boolean
  class?: string
  style?: JSX.CSSProperties
  title?: string
  key?: string
  groupLabel?: JSX.Element
  data: SelectOption
}

export interface FlattenOptionGroupData {
  group: true
  label: JSX.Element
  key?: string
  class?: string
  title?: string
}

export type FlattenSelectItem = FlattenOptionData | FlattenOptionGroupData

export interface SelectRef {
  focus: () => void
  blur: () => void
}

export interface SelectSearchConfig {
  autoClearSearchValue?: boolean
  filterOption?: boolean | ((inputValue: string, option: SelectOption) => boolean)
  filterSort?: (
    optionA: FlattenOptionData,
    optionB: FlattenOptionData,
    info: { searchValue: string },
  ) => number
  optionFilterProp?: string | string[]
  searchValue?: string
  onSearch?: (value: string) => void
  searchIcon?: JSX.Element
}

export interface SelectTagRenderProps {
  label: JSX.Element
  value: RawValue
  disabled: boolean
  closable: boolean
  onClose: () => void
}

export interface SelectProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'onInput' | 'onSelect' | 'ref' | 'prefix'
> {
  ref?: SelectRef | { current?: SelectRef } | ((ref: SelectRef) => void)
  value?: SelectValue
  defaultValue?: SelectValue
  open?: boolean
  defaultOpen?: boolean
  options?: SelectOptionInput[]
  children?: JSX.Element
  placeholder?: JSX.Element
  disabled?: boolean
  allowClear?: boolean | { clearIcon?: JSX.Element }
  prefixCls?: string
  rootClassName?: string
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement | ShadowRoot
  mode?: SelectMode
  labelInValue?: boolean
  fieldNames?: SelectFieldNames
  showSearch?: boolean | SelectSearchConfig
  autoClearSearchValue?: boolean
  filterOption?: boolean | ((inputValue: string, option: SelectOption) => boolean)
  filterSort?: (
    optionA: FlattenOptionData,
    optionB: FlattenOptionData,
    info: { searchValue: string },
  ) => number
  optionFilterProp?: string | string[]
  searchValue?: string
  onSearch?: (value: string) => void
  optionLabelProp?: string
  optionRender?: (option: FlattenOptionData, info: { index: number }) => JSX.Element
  labelRender?: (props: LabeledValue) => JSX.Element
  tagRender?: (props: SelectTagRenderProps) => JSX.Element
  popupRender?: (originNode: JSX.Element) => JSX.Element
  dropdownRender?: (originNode: JSX.Element) => JSX.Element
  notFoundContent?: JSX.Element
  placement?: SelectPlacement
  popupMatchSelectWidth?: boolean | number
  dropdownMatchSelectWidth?: boolean | number
  popupClassName?: string
  dropdownClassName?: string
  popupStyle?: JSX.CSSProperties
  dropdownStyle?: JSX.CSSProperties
  listHeight?: number
  listItemHeight?: number
  virtual?: boolean
  size?: ComponentSize | 'middle'
  status?: SelectStatus
  variant?: SelectVariant
  bordered?: boolean
  prefix?: JSX.Element
  suffixIcon?: JSX.Element | null
  showArrow?: boolean
  clearIcon?: JSX.Element
  removeIcon?: JSX.Element
  menuItemSelectedIcon?: JSX.Element
  loading?: boolean
  loadingIcon?: JSX.Element
  maxCount?: number
  maxTagCount?: number | 'responsive'
  maxTagPlaceholder?: JSX.Element | ((omittedValues: FlattenOptionData[]) => JSX.Element)
  maxTagTextLength?: number
  tokenSeparators?: string[]
  classNames?: Record<string, string>
  styles?: Record<string, JSX.CSSProperties>
  onChange?: (
    value: SelectValue,
    option: FlattenOptionData | FlattenOptionData[] | undefined,
  ) => void
  onOpenChange?: (open: boolean) => void
  onDropdownVisibleChange?: (open: boolean) => void
  onSelect?: (value: RawValue | LabeledValue, option: FlattenOptionData) => void
  onDeselect?: (value: RawValue | LabeledValue, option: FlattenOptionData) => void
  onClear?: () => void
  onInputKeyDown?: JSX.EventHandler<HTMLInputElement, KeyboardEvent>
  onPopupScroll?: JSX.EventHandler<HTMLDivElement, UIEvent>
  onActive?: (value: RawValue | LabeledValue) => void
}
