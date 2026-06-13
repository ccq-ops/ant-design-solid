import type { JSX } from 'solid-js'
import type { OptionValue } from '../shared/options'

export type CascaderShowCheckedStrategy = 'SHOW_PARENT' | 'SHOW_CHILD'
export type CascaderSize = 'large' | 'middle' | 'small'
export type CascaderStatus = 'error' | 'warning'
export type CascaderVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'
export type CascaderPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'
export type CascaderSemanticSlot =
  | 'root'
  | 'selector'
  | 'prefix'
  | 'suffix'
  | 'clear'
  | 'popup'
  | 'menu'
  | 'item'
  | 'itemContent'
  | 'expandIcon'
  | 'loadingIcon'
  | 'search'
  | 'searchIcon'
  | 'empty'
  | 'tag'
  | 'tagLabel'
  | 'tagClose'
export type CascaderSemanticClassNames =
  | Partial<Record<CascaderSemanticSlot, string>>
  | ((info: { props: CascaderProps }) => Partial<Record<CascaderSemanticSlot, string>>)
export type CascaderSemanticStyles =
  | Partial<Record<CascaderSemanticSlot, JSX.CSSProperties>>
  | ((info: { props: CascaderProps }) => Partial<Record<CascaderSemanticSlot, JSX.CSSProperties>>)

export interface CascaderFieldNames {
  label?: string
  value?: string
  children?: string
}

export interface CascaderOption {
  label: JSX.Element
  value: OptionValue
  disabled?: boolean
  children?: CascaderOption[]
  isLeaf?: boolean
  loading?: boolean
  [key: string]: unknown
}

export interface CascaderOptionInput {
  label?: JSX.Element
  value?: OptionValue
  disabled?: boolean
  children?: CascaderOptionInput[]
  isLeaf?: boolean
  loading?: boolean
  [key: string]: unknown
}

export interface CascaderShowSearch {
  filter?: (inputValue: string, path: CascaderOption[]) => boolean
  limit?: number | false
  matchInputWidth?: boolean
  render?: (inputValue: string, path: CascaderOption[]) => JSX.Element
  sort?: (a: CascaderOption[], b: CascaderOption[], inputValue: string) => number
  searchValue?: string
  onSearch?: (search: string) => void
  autoClearSearchValue?: boolean
  searchIcon?: JSX.Element
}

export interface CascaderSelectedPath {
  value: OptionValue[]
  options: CascaderOption[]
  label: JSX.Element
}

export interface CascaderRef {
  focus: () => void
  blur: () => void
  nativeElement?: HTMLDivElement
}

export interface CascaderProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'onInput' | 'prefix' | 'ref'
> {
  ref?: CascaderRef | { current?: CascaderRef } | ((ref: CascaderRef) => void)
  options?: CascaderOptionInput[]
  value?: OptionValue[] | OptionValue[][]
  defaultValue?: OptionValue[] | OptionValue[][]
  open?: boolean
  defaultOpen?: boolean
  placeholder?: JSX.Element
  disabled?: boolean
  allowClear?: boolean | { clearIcon?: JSX.Element }
  changeOnSelect?: boolean
  expandTrigger?: 'click' | 'hover'
  expandIcon?: JSX.Element
  displayRender?: (labels: JSX.Element[], selectedOptions: CascaderOption[]) => JSX.Element
  fieldNames?: CascaderFieldNames
  prefixCls?: string
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement | ShadowRoot
  onChange?: (
    value: OptionValue[] | OptionValue[][],
    selectedOptions: CascaderOption[] | CascaderOption[][],
  ) => void
  onOpenChange?: (open: boolean) => void
  showSearch?: boolean | CascaderShowSearch
  searchValue?: string
  onSearch?: (search: string) => void
  loadData?: (selectedOptions: CascaderOption[]) => void | Promise<void>
  loadingIcon?: JSX.Element
  notFoundContent?: JSX.Element
  optionRender?: (option: CascaderOption) => JSX.Element
  popupRender?: (originNode: JSX.Element) => JSX.Element
  placement?: CascaderPlacement
  multiple?: boolean
  showCheckedStrategy?: CascaderShowCheckedStrategy
  tagRender?: (label: JSX.Element, onClose: () => void, value: OptionValue[]) => JSX.Element
  removeIcon?: JSX.Element
  maxTagCount?: number | 'responsive'
  maxTagPlaceholder?: JSX.Element | ((omittedValues: CascaderSelectedPath[]) => JSX.Element)
  maxTagTextLength?: number
  autoClearSearchValue?: boolean
  size?: CascaderSize
  status?: CascaderStatus
  variant?: CascaderVariant
  prefix?: JSX.Element
  suffixIcon?: JSX.Element | null
  classNames?: CascaderSemanticClassNames
  styles?: CascaderSemanticStyles
  onClear?: () => void
}
