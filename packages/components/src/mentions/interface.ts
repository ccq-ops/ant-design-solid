import type { JSX } from 'solid-js'

export interface MentionsOption {
  label?: JSX.Element
  value: string
  disabled?: boolean
}

export interface MentionsProps extends Omit<
  JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'onChange' | 'onSelect' | 'prefix'
> {
  value?: string
  defaultValue?: string
  open?: boolean
  defaultOpen?: boolean
  options?: MentionsOption[]
  prefix?: string | string[]
  split?: string
  placeholder?: string
  disabled?: boolean
  allowClear?: boolean
  filterOption?: boolean | ((inputValue: string, option: MentionsOption) => boolean)
  validateSearch?: (text: string, props: MentionsProps) => boolean
  prefixCls?: string
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
  onChange?: (value: string) => void
  onSelect?: (option: MentionsOption, prefix: string) => void
  onSearch?: (text: string, prefix: string) => void
  onOpenChange?: (open: boolean) => void
}
