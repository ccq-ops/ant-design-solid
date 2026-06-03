import type { JSX } from 'solid-js'

export interface AutoCompleteOption {
  label?: JSX.Element
  value: string
  disabled?: boolean
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
  allowClear?: boolean
  filterOption?: boolean | ((inputValue: string, option: AutoCompleteOption) => boolean)
  prefixCls?: string
  onChange?: (value: string) => void
  onSelect?: (value: string, option: AutoCompleteOption) => void
  onOpenChange?: (open: boolean) => void
}
