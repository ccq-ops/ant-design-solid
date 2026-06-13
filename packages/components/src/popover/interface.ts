import type { JSX } from 'solid-js'
import type { TooltipPlacement } from '../shared/placement'
import type {
  TooltipAlignConfig,
  TooltipArrow,
  TooltipOverflowConfig,
  TooltipRef,
  TooltipTriggerInput,
} from '../tooltip'

export type { TooltipPlacement as PopoverPlacement } from '../shared/placement'
export type { TooltipRef as PopoverRef } from '../tooltip'
export type PopoverTrigger = TooltipTriggerInput
export type PopoverRender = () => JSX.Element
export type PopoverSemanticSlot = 'root' | 'container' | 'arrow' | 'title' | 'content'
export type PopoverSemanticClassNames = Partial<Record<PopoverSemanticSlot, string>>
export type PopoverSemanticStyles = Partial<Record<PopoverSemanticSlot, JSX.CSSProperties>>
export type PopoverSemanticClassNamesConfig =
  | PopoverSemanticClassNames
  | ((info: { props: PopoverProps }) => PopoverSemanticClassNames)
export type PopoverSemanticStylesConfig =
  | PopoverSemanticStyles
  | ((info: { props: PopoverProps }) => PopoverSemanticStyles)

export interface PopoverProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'title' | 'ref'> {
  /** @internal Used by Popconfirm and related popover-based components. */
  prefixCls?: string
  ref?: TooltipRef | { current?: TooltipRef } | ((ref: TooltipRef) => void)
  title?: JSX.Element | PopoverRender
  content?: JSX.Element | PopoverRender
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
  openClass?: string
  overlayClass?: string
  overlayStyle?: JSX.CSSProperties
  /** @deprecated Use `styles.container` instead. */
  overlayInnerStyle?: JSX.CSSProperties
  classNames?: PopoverSemanticClassNamesConfig
  styles?: PopoverSemanticStylesConfig
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement | ShadowRoot
}
