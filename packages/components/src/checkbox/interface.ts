import type { JSX } from 'solid-js'
import type { OptionInput, OptionValue } from '../shared/options'

export interface CheckboxProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'checked' | 'disabled' | 'onChange'
> {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  indeterminate?: boolean
  prefixCls?: string
  children?: JSX.Element
  onChange?: JSX.EventHandler<HTMLInputElement, Event>
}

export interface CheckboxGroupProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: OptionValue[]
  defaultValue?: OptionValue[]
  options?: OptionInput[]
  disabled?: boolean
  prefixCls?: string
  children?: JSX.Element
  onChange?: (checkedValue: OptionValue[]) => void
}
