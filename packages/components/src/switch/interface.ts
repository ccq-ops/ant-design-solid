import type { JSX } from 'solid-js'

export type SwitchSize = 'small' | 'middle' | 'medium'
export type SwitchSemanticDOM = 'root' | 'content' | 'indicator'
export type SwitchSemanticClassNames = Partial<Record<SwitchSemanticDOM, string>>
export type SwitchSemanticStyles = Partial<Record<SwitchSemanticDOM, JSX.CSSProperties>>

export interface SwitchRef {
  focus: () => void
  blur: () => void
  nativeElement?: HTMLButtonElement
}

export interface SwitchProps extends Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  | 'type'
  | 'role'
  | 'disabled'
  | 'checked'
  | 'defaultChecked'
  | 'value'
  | 'onChange'
  | 'onClick'
  | 'ref'
> {
  checked?: boolean
  value?: boolean
  defaultChecked?: boolean
  defaultValue?: boolean
  disabled?: boolean
  loading?: boolean
  size?: SwitchSize
  checkedChildren?: JSX.Element
  unCheckedChildren?: JSX.Element
  prefixCls?: string
  classNames?: SwitchSemanticClassNames
  styles?: SwitchSemanticStyles
  ref?: { current?: SwitchRef } | ((ref: SwitchRef) => void)
  onChange?: (checked: boolean, event: MouseEvent) => void
  onClick?: (checked: boolean, event: MouseEvent) => void
}
