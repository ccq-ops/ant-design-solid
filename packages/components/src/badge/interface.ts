import type { JSX } from 'solid-js'

export type BadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning'
export type BadgeSize = 'medium' | 'small' | 'default'
export type BadgeOffset = [number | string, number | string]
export type BadgeSemanticSlot = 'root' | 'indicator'
export type RibbonPlacement = 'start' | 'end'
export type RibbonSemanticSlot = 'root' | 'content' | 'indicator'

export type BadgeSemanticClassNames = Partial<Record<BadgeSemanticSlot, string>>
export type BadgeSemanticStyles = Partial<Record<BadgeSemanticSlot, JSX.CSSProperties>>
export type BadgeSemanticInfo = { props: BadgeProps }
export type BadgeSemanticClassNamesConfig =
  | BadgeSemanticClassNames
  | ((info: BadgeSemanticInfo) => BadgeSemanticClassNames)
export type BadgeSemanticStylesConfig =
  | BadgeSemanticStyles
  | ((info: BadgeSemanticInfo) => BadgeSemanticStyles)

export type RibbonSemanticClassNames = Partial<Record<RibbonSemanticSlot, string>>
export type RibbonSemanticStyles = Partial<Record<RibbonSemanticSlot, JSX.CSSProperties>>
export type RibbonSemanticInfo = { props: RibbonProps }
export type RibbonSemanticClassNamesConfig =
  | RibbonSemanticClassNames
  | ((info: RibbonSemanticInfo) => RibbonSemanticClassNames)
export type RibbonSemanticStylesConfig =
  | RibbonSemanticStyles
  | ((info: RibbonSemanticInfo) => RibbonSemanticStyles)

export interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  prefixCls?: string
  scrollNumberPrefixCls?: string
  rootClassName?: string
  rootClass?: string
  count?: JSX.Element
  dot?: boolean
  status?: BadgeStatus
  text?: JSX.Element
  color?: string
  overflowCount?: number
  showZero?: boolean
  size?: BadgeSize
  offset?: BadgeOffset
  title?: string
  classNames?: BadgeSemanticClassNamesConfig
  styles?: BadgeSemanticStylesConfig
}

export interface RibbonProps extends JSX.HTMLAttributes<HTMLDivElement> {
  prefixCls?: string
  rootClassName?: string
  rootClass?: string
  text?: JSX.Element
  color?: string
  placement?: RibbonPlacement
  classNames?: RibbonSemanticClassNamesConfig
  styles?: RibbonSemanticStylesConfig
}

export interface BadgeComponent {
  (props: BadgeProps): JSX.Element
  Ribbon: (props: RibbonProps) => JSX.Element
}
