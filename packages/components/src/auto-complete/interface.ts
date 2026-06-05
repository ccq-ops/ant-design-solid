import type { JSX } from 'solid-js'

export interface AutoCompleteOption {
  label?: JSX.Element
  value: string
  disabled?: boolean
}

export type AutoCompleteSize = 'small' | 'middle' | 'large'
export type AutoCompleteStatus = 'error' | 'warning'
export type AutoCompleteVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'

export interface AutoCompleteAllowClear {
  clearIcon?: JSX.Element
}

export interface AutoCompleteShowSearch {
  filterOption?: boolean | ((inputValue: string, option: AutoCompleteOption) => boolean)
  onSearch?: (value: string) => void
}

export interface AutoCompleteProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'onSelect'
> {
  value?: string
  defaultValue?: string
  open?: boolean
  defaultOpen?: boolean
  options?: AutoCompleteOption[]
  placeholder?: string
  disabled?: boolean
  size?: AutoCompleteSize
  status?: AutoCompleteStatus
  variant?: AutoCompleteVariant
  allowClear?: boolean | AutoCompleteAllowClear
  showSearch?: true | AutoCompleteShowSearch
  defaultActiveFirstOption?: boolean
  backfill?: boolean
  notFoundContent?: JSX.Element
  popupMatchSelectWidth?: boolean | number
  popupRender?: (originNode: JSX.Element) => JSX.Element
  filterOption?: boolean | ((inputValue: string, option: AutoCompleteOption) => boolean)
  prefixCls?: string
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
  onChange?: (value: string) => void
  onSelect?: (value: string, option: AutoCompleteOption) => void
  onOpenChange?: (open: boolean) => void
  onClear?: () => void
  onInputKeyDown?: (event: KeyboardEvent) => void
  onPopupScroll?: (event: UIEvent) => void
}
