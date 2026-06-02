import type { JSX } from 'solid-js'

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom'

export interface DrawerProps {
  open?: boolean
  title?: JSX.Element
  placement?: DrawerPlacement
  width?: number | string
  height?: number | string
  closable?: boolean
  mask?: boolean
  maskClosable?: boolean
  keyboard?: boolean
  destroyOnClose?: boolean
  extra?: JSX.Element
  footer?: JSX.Element
  zIndex?: number
  onClose?: () => void
  afterOpenChange?: (open: boolean) => void
  children?: JSX.Element
  class?: string
  classList?: Record<string, boolean | undefined>
  style?: JSX.CSSProperties
  'aria-label'?: string
  'aria-labelledby'?: string
}
