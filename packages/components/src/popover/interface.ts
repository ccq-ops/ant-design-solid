import type { JSX } from 'solid-js'
import type { TooltipPlacement } from '../shared/placement'

export type { TooltipPlacement as PopoverPlacement } from '../shared/placement'
export type PopoverTrigger = 'hover' | 'click' | 'focus'

export interface PopoverProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'title'> {
  title?: JSX.Element
  content?: JSX.Element
  placement?: TooltipPlacement
  trigger?: PopoverTrigger
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  mouseEnterDelay?: number
  mouseLeaveDelay?: number
  overlayClass?: string
  overlayStyle?: JSX.CSSProperties
}
