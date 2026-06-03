import type { JSX } from 'solid-js'
import type { OptionValue } from '../shared/options'

export interface CascaderOption {
  label: JSX.Element
  value: OptionValue
  disabled?: boolean
  children?: CascaderOption[]
}

export interface CascaderProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'onInput'
> {
  options?: CascaderOption[]
  value?: OptionValue[]
  defaultValue?: OptionValue[]
  open?: boolean
  defaultOpen?: boolean
  placeholder?: JSX.Element
  disabled?: boolean
  allowClear?: boolean
  changeOnSelect?: boolean
  expandTrigger?: 'click' | 'hover'
  displayRender?: (labels: JSX.Element[], selectedOptions: CascaderOption[]) => JSX.Element
  prefixCls?: string
  onChange?: (value: OptionValue[], selectedOptions: CascaderOption[]) => void
  onOpenChange?: (open: boolean) => void
}
