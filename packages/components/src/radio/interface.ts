import type { JSX } from 'solid-js'
import type { OptionInput, OptionValue } from '../shared/options'

export interface RadioProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'checked' | 'defaultChecked' | 'disabled' | 'value' | 'onChange'
> {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  value?: OptionValue
  prefixCls?: string
  children?: JSX.Element
  onChange?: JSX.EventHandler<HTMLInputElement, Event>
}

export interface RadioGroupProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: OptionValue
  defaultValue?: OptionValue
  options?: OptionInput[]
  disabled?: boolean
  optionType?: 'default' | 'button'
  prefixCls?: string
  children?: JSX.Element
  onChange?: (checkedValue: OptionValue) => void
}
