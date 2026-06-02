import type { JSX } from 'solid-js'

export type PopconfirmPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface PopconfirmProps {
  title?: JSX.Element
  description?: JSX.Element
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  placement?: PopconfirmPlacement
  okText?: JSX.Element
  cancelText?: JSX.Element
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  onOpenChange?: (open: boolean) => void
  children: JSX.Element
}
