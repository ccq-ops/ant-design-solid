import type { JSX } from 'solid-js'
import type { OptionValue } from '../shared/options'

export type CascaderShowCheckedStrategy = 'SHOW_PARENT' | 'SHOW_CHILD'
export type CascaderSize = 'large' | 'middle' | 'small'
export type CascaderStatus = 'error' | 'warning'
export type CascaderVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'

export interface CascaderOption {
  label: JSX.Element
  value: OptionValue
  disabled?: boolean
  children?: CascaderOption[]
  isLeaf?: boolean
  loading?: boolean
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

export interface CascaderProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'onInput' | 'prefix'
> {
  options?: CascaderOption[]
  value?: OptionValue[] | OptionValue[][]
  defaultValue?: OptionValue[] | OptionValue[][]
  open?: boolean
  defaultOpen?: boolean
  placeholder?: JSX.Element
  disabled?: boolean
  allowClear?: boolean | { clearIcon?: JSX.Element }
  changeOnSelect?: boolean
  expandTrigger?: 'click' | 'hover'
  displayRender?: (labels: JSX.Element[], selectedOptions: CascaderOption[]) => JSX.Element
  prefixCls?: string
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
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
}
