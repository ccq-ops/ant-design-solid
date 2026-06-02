import type { JSX } from 'solid-js'
import type { TooltipPlacement } from '../shared/placement'

export type { TooltipPlacement } from '../shared/placement'
export type TooltipTrigger = 'hover' | 'click' | 'focus'
export interface TooltipProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'title'> {
  title?: JSX.Element
  placement?: TooltipPlacement
  trigger?: TooltipTrigger
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  mouseEnterDelay?: number
  mouseLeaveDelay?: number
  overlayClass?: string
  overlayStyle?: JSX.CSSProperties
}
