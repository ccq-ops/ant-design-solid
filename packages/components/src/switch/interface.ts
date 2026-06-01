import type { JSX } from 'solid-js'

export interface SwitchProps extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'role' | 'disabled' | 'onChange'> {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  loading?: boolean
  size?: 'small' | 'middle'
  checkedChildren?: JSX.Element
  unCheckedChildren?: JSX.Element
  prefixCls?: string
  onChange?: (checked: boolean, event: MouseEvent) => void
}
