import type { JSX } from 'solid-js'
import type { AffixTarget } from '../affix'
import type { BadgeProps } from '../badge'
import type { ButtonHTMLType } from '../button'
import type { TooltipProps } from '../tooltip'

export type FloatButtonType = 'default' | 'primary'
export type FloatButtonShape = 'circle' | 'square'
export type FloatButtonGroupTrigger = 'click' | 'hover'
export type FloatButtonGroupPlacement = 'top' | 'left' | 'right' | 'bottom'
export type FloatButtonSemanticDOM = 'root' | 'icon' | 'content'
export type FloatButtonSemanticClassNames = Partial<Record<FloatButtonSemanticDOM, string>>
export type FloatButtonSemanticStyles = Partial<Record<FloatButtonSemanticDOM, JSX.CSSProperties>>
export type FloatButtonSemanticInfo = { props: FloatButtonProps }
export type FloatButtonSemanticClassNamesConfig =
  | FloatButtonSemanticClassNames
  | ((info: FloatButtonSemanticInfo) => FloatButtonSemanticClassNames)
export type FloatButtonSemanticStylesConfig =
  | FloatButtonSemanticStyles
  | ((info: FloatButtonSemanticInfo) => FloatButtonSemanticStyles)
export type FloatButtonTooltip = JSX.Element | Omit<TooltipProps, 'children'>
export type FloatButtonBadgeProps = Omit<BadgeProps, 'status' | 'text' | 'title' | 'children'>

export type FloatButtonGroupSemanticDOM =
  | 'root'
  | 'list'
  | 'item'
  | 'itemIcon'
  | 'itemContent'
  | 'trigger'
  | 'triggerIcon'
  | 'triggerContent'
export type FloatButtonGroupSemanticClassNames = Partial<
  Record<FloatButtonGroupSemanticDOM, string>
>
export type FloatButtonGroupSemanticStyles = Partial<
  Record<FloatButtonGroupSemanticDOM, JSX.CSSProperties>
>
export type FloatButtonGroupSemanticInfo = { props: FloatButtonGroupProps }
export type FloatButtonGroupSemanticClassNamesConfig =
  | FloatButtonGroupSemanticClassNames
  | ((info: FloatButtonGroupSemanticInfo) => FloatButtonGroupSemanticClassNames)
export type FloatButtonGroupSemanticStylesConfig =
  | FloatButtonGroupSemanticStyles
  | ((info: FloatButtonGroupSemanticInfo) => FloatButtonGroupSemanticStyles)

export interface FloatButtonProps extends Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'target' | 'type'
> {
  type?: FloatButtonType
  shape?: FloatButtonShape
  icon?: JSX.Element
  content?: JSX.Element
  /** @deprecated Please use `content` instead. */
  description?: JSX.Element
  tooltip?: FloatButtonTooltip
  href?: string
  target?: string
  badge?: FloatButtonBadgeProps
  disabled?: boolean
  htmlType?: ButtonHTMLType
  classNames?: FloatButtonSemanticClassNamesConfig
  styles?: FloatButtonSemanticStylesConfig
}

export interface FloatButtonGroupProps extends Omit<
  FloatButtonProps,
  'classNames' | 'styles' | 'href' | 'target'
> {
  shape?: FloatButtonShape
  trigger?: FloatButtonGroupTrigger
  open?: boolean
  closeIcon?: JSX.Element
  placement?: FloatButtonGroupPlacement
  onOpenChange?: (open: boolean) => void
  classNames?: FloatButtonGroupSemanticClassNamesConfig
  styles?: FloatButtonGroupSemanticStylesConfig
  children?: JSX.Element
}

export interface FloatButtonBackTopProps extends Omit<
  FloatButtonProps,
  'children' | 'target' | 'href'
> {
  visibilityHeight?: number
  target?: () => AffixTarget | undefined | null
  duration?: number
  children?: JSX.Element
}

export interface FloatButtonComponent {
  (props: FloatButtonProps): JSX.Element
  Group: (props: FloatButtonGroupProps) => JSX.Element
  BackTop: (props: FloatButtonBackTopProps) => JSX.Element
}
