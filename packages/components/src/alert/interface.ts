import type { JSX } from 'solid-js'

export type AlertType = 'success' | 'info' | 'warning' | 'error'

export interface AlertProps {
  type?: AlertType
  message?: JSX.Element
  description?: JSX.Element
  closable?: boolean
  showIcon?: boolean
  action?: JSX.Element
  afterClose?: () => void
  onClose?: (event: MouseEvent) => void
  class?: string
  classList?: Record<string, boolean | undefined>
  style?: JSX.CSSProperties
}
