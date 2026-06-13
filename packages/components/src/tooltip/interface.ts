import type { JSX } from 'solid-js'
import type {
  TooltipAlignConfig,
  TooltipPlacement,
  TooltipOverflowConfig,
} from '../shared/placement'

export type {
  TooltipAlignConfig,
  TooltipPlacement,
  TooltipOverflowConfig,
} from '../shared/placement'
export type TooltipTrigger = 'hover' | 'click' | 'focus' | 'contextMenu'
export type TooltipTriggerInput = TooltipTrigger | TooltipTrigger[]
export type TooltipSemanticSlot = 'root' | 'container' | 'arrow'
export type TooltipSemanticClassNames = Partial<Record<TooltipSemanticSlot, string>>
export type TooltipSemanticStyles = Partial<Record<TooltipSemanticSlot, JSX.CSSProperties>>
export type TooltipSemanticClassNamesConfig =
  | TooltipSemanticClassNames
  | ((info: { props: TooltipProps }) => TooltipSemanticClassNames)
export type TooltipSemanticStylesConfig =
  | TooltipSemanticStyles
  | ((info: { props: TooltipProps }) => TooltipSemanticStyles)
export type TooltipArrow = boolean | { pointAtCenter?: boolean }
export type TooltipRender = () => JSX.Element

export interface TooltipRef {
  forceAlign: () => void
  nativeElement?: HTMLElement
  popupElement?: HTMLDivElement
}

export interface TooltipProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'title' | 'ref'> {
  /** @internal Used by Popover and related tooltip-based components. */
  prefixCls?: string
  /** @internal Allows tooltip-based components to provide their own styles. */
  skipStyle?: boolean
  /** @internal Prevents tooltip ConfigProvider defaults from leaking into composed components. */
  skipConfig?: boolean
  ref?: TooltipRef | { current?: TooltipRef } | ((ref: TooltipRef) => void)
  title?: JSX.Element | TooltipRender
  overlay?: JSX.Element | TooltipRender
  color?: string
  placement?: TooltipPlacement
  builtinPlacements?: Partial<Record<TooltipPlacement, TooltipAlignConfig>>
  trigger?: TooltipTriggerInput
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  afterOpenChange?: (open: boolean) => void
  mouseEnterDelay?: number
  mouseLeaveDelay?: number
  align?: TooltipAlignConfig
  arrow?: TooltipArrow
  autoAdjustOverflow?: boolean | TooltipOverflowConfig
  fresh?: boolean
  destroyOnHidden?: boolean
  /** @deprecated Please use `destroyOnHidden` instead. */
  destroyTooltipOnHide?: boolean | { keepParent?: boolean }
  rootClass?: string
  /** @deprecated Use `rootClass` in Solid code. */
  rootClassName?: string
  openClass?: string
  /** @deprecated Use `openClass` in Solid code. */
  openClassName?: string
  overlayClass?: string
  /** @deprecated Use `classNames.root` instead. */
  overlayClassName?: string
  overlayStyle?: JSX.CSSProperties
  /** @deprecated Use `styles.container` instead. */
  overlayInnerStyle?: JSX.CSSProperties
  classNames?: TooltipSemanticClassNamesConfig
  styles?: TooltipSemanticStylesConfig
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement | ShadowRoot
}
