import type { JSX } from 'solid-js'

export type AlertType = 'success' | 'info' | 'warning' | 'error'

export interface AlertProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onClose'> {
  type?: AlertType
  message?: JSX.Element
  description?: JSX.Element
  closable?: boolean
  showIcon?: boolean
  action?: JSX.Element
  afterClose?: () => void
  onClose?: (event: MouseEvent) => void
}
