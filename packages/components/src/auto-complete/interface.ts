import type { JSX } from 'solid-js'

export type AutoCompleteRawValue = string

export interface AutoCompleteOption {
  label?: JSX.Element
  value: AutoCompleteRawValue
  disabled?: boolean
  class?: string
  /** @deprecated Use `class` in Solid projects. */
  className?: string
  style?: JSX.CSSProperties
  title?: string
  key?: string
  [key: string]: unknown
}

export type AutoCompleteSize = 'small' | 'middle' | 'large'
export type AutoCompleteStatus = 'error' | 'warning'
export type AutoCompleteVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'
export type AutoCompleteSemanticKey =
  | 'root'
  | 'selector'
  | 'input'
  | 'clear'
  | 'popup'
  | 'list'
  | 'option'
  | 'empty'

export type AutoCompleteSemanticClassNames = Partial<Record<AutoCompleteSemanticKey, string>>
export type AutoCompleteSemanticStyles = Partial<Record<AutoCompleteSemanticKey, JSX.CSSProperties>>
export type AutoCompleteSemanticInfo<P> = { props: P }
export type AutoCompleteSemanticClassNamesConfig<P> =
  | AutoCompleteSemanticClassNames
  | ((info: AutoCompleteSemanticInfo<P>) => AutoCompleteSemanticClassNames)
export type AutoCompleteSemanticStylesConfig<P> =
  | AutoCompleteSemanticStyles
  | ((info: AutoCompleteSemanticInfo<P>) => AutoCompleteSemanticStyles)

export interface AutoCompleteAllowClear {
  clearIcon?: JSX.Element
}

export interface AutoCompleteShowSearch {
  filterOption?: boolean | ((inputValue: string, option: AutoCompleteOption) => boolean)
  onSearch?: (value: string) => void
  searchIcon?: JSX.Element
}

export interface AutoCompleteRef {
  focus: () => void
  blur: () => void
  input?: HTMLInputElement | HTMLTextAreaElement | null
  nativeElement?: HTMLElement | null
}

export interface AutoCompleteDataSourceItemObject extends Omit<AutoCompleteOption, 'label'> {
  text?: JSX.Element
  label?: JSX.Element
}

export interface AutoCompleteProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'onSelect' | 'ref'
> {
  ref?: ((ref: AutoCompleteRef) => void) | { current?: AutoCompleteRef } | AutoCompleteRef
  value?: string
  defaultValue?: string
  open?: boolean
  defaultOpen?: boolean
  options?: AutoCompleteOption[]
  /** @deprecated Use `options` instead. */
  dataSource?: Array<string | AutoCompleteDataSourceItemObject | JSX.Element>
  children?: JSX.Element
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
  /** @deprecated Use `popupRender` instead. */
  dropdownRender?: (originNode: JSX.Element) => JSX.Element
  /** @deprecated Use `popupMatchSelectWidth` instead. */
  dropdownMatchSelectWidth?: boolean | number
  popupClass?: string
  dropdownClass?: string
  /** @deprecated Use `popupClass` in Solid projects. */
  popupClassName?: string
  /** @deprecated Use `dropdownClass` in Solid projects. */
  dropdownClassName?: string
  popupStyle?: JSX.CSSProperties
  /** @deprecated Use `styles.popup` instead. */
  dropdownStyle?: JSX.CSSProperties
  virtual?: boolean
  classNames?: AutoCompleteSemanticClassNamesConfig<AutoCompleteProps>
  styles?: AutoCompleteSemanticStylesConfig<AutoCompleteProps>
  filterOption?: boolean | ((inputValue: string, option: AutoCompleteOption) => boolean)
  prefixCls?: string
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement | ShadowRoot
  onChange?: (value: string) => void
  onSelect?: (value: string, option: AutoCompleteOption) => void
  onOpenChange?: (open: boolean) => void
  /** @deprecated Use `onOpenChange` instead. */
  onDropdownVisibleChange?: (open: boolean) => void
  onClear?: () => void
  onInputKeyDown?: (event: KeyboardEvent) => void
  onPopupScroll?: (event: UIEvent) => void
}
