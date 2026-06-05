import type { JSX } from 'solid-js'
import type { ComponentSize } from '@ant-design-solid/theme'
export type ButtonType = 'default' | 'primary' | 'dashed' | 'text' | 'link'
export type ButtonHTMLType = 'button' | 'submit' | 'reset'
export type ButtonShape = 'default' | 'circle' | 'round'
export type ButtonIconPosition = 'start' | 'end'
export type ButtonVariant = 'outlined' | 'dashed' | 'solid' | 'filled' | 'text' | 'link'
export type ButtonPresetColor =
  | 'blue'
  | 'purple'
  | 'cyan'
  | 'green'
  | 'magenta'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'volcano'
  | 'geekblue'
  | 'lime'
  | 'gold'
export type ButtonColor = 'default' | 'primary' | 'danger' | ButtonPresetColor
export interface ButtonLoadingConfig {
  delay?: number
  icon?: JSX.Element
}
export type ButtonLoading = boolean | ButtonLoadingConfig
export interface ButtonProps extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  type?: ButtonType
  size?: ComponentSize
  htmlType?: ButtonHTMLType
  loading?: ButtonLoading
  danger?: boolean
  block?: boolean
  ghost?: boolean
  href?: string
  target?: string
  shape?: ButtonShape
  color?: ButtonColor
  variant?: ButtonVariant
  icon?: JSX.Element
  iconPosition?: ButtonIconPosition
  iconPlacement?: ButtonIconPosition
  autoInsertSpace?: boolean
}
