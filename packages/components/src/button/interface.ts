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
export type ButtonSemanticSlot = 'root' | 'icon' | 'content'
export type ButtonSemanticClassNames = Partial<Record<ButtonSemanticSlot, string>>
export type ButtonSemanticStyles = Partial<Record<ButtonSemanticSlot, JSX.CSSProperties>>
export type ButtonSemanticInfo = { props: ButtonProps }
export type ButtonSemanticClassNamesConfig =
  | ButtonSemanticClassNames
  | ((info: ButtonSemanticInfo) => ButtonSemanticClassNames)
export type ButtonSemanticStylesConfig =
  | ButtonSemanticStyles
  | ((info: ButtonSemanticInfo) => ButtonSemanticStyles)
export interface ButtonLoadingConfig {
  delay?: number
  icon?: JSX.Element
}
export type ButtonLoading = boolean | ButtonLoadingConfig
type MergedButtonHTMLAttributes = Omit<
  JSX.HTMLAttributes<HTMLElement> &
    JSX.ButtonHTMLAttributes<HTMLButtonElement> &
    JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
  'type' | 'color' | 'shape' | 'onClick'
>
export interface ButtonProps extends MergedButtonHTMLAttributes {
  prefixCls?: string
  rootClass?: string
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
  onClick?: JSX.EventHandlerUnion<HTMLElement, MouseEvent>
  classNames?: ButtonSemanticClassNamesConfig
  styles?: ButtonSemanticStylesConfig
  /** @private Internal compatibility with antd Button reuse. */
  _skipSemantic?: boolean
}
