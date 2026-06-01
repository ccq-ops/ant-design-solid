import type { JSX } from 'solid-js'
import type { OptionInput, LabeledOption, OptionValue } from '../shared/options'

export interface SelectProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'onInput'
> {
  value?: OptionValue
  defaultValue?: OptionValue
  open?: boolean
  defaultOpen?: boolean
  options?: OptionInput[]
  placeholder?: JSX.Element
  disabled?: boolean
  allowClear?: boolean
  prefixCls?: string
  onChange?: (value: OptionValue | undefined, option: LabeledOption | undefined) => void
  onOpenChange?: (open: boolean) => void
}
