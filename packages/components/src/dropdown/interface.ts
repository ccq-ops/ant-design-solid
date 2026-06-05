import type { JSX } from 'solid-js'
import type { DropdownPlacement } from '../shared/placement'

export type { DropdownPlacement } from '../shared/placement'
export type DropdownTrigger = 'hover' | 'click'

export interface DropdownMenuClickInfo {
  key: string
  domEvent: MouseEvent
}

export interface DropdownMenuItem {
  key: string
  label?: JSX.Element
  disabled?: boolean
  type?: 'item' | 'divider'
}

export interface DropdownMenuProps {
  items: DropdownMenuItem[]
  onClick?: (info: DropdownMenuClickInfo) => void
}

export interface DropdownProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  menu: DropdownMenuProps
  trigger?: DropdownTrigger
  placement?: DropdownPlacement
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  overlayClass?: string
  overlayStyle?: JSX.CSSProperties
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
}
