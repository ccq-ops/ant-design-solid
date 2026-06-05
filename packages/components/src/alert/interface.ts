import type { JSX } from 'solid-js'

export type AlertType = 'success' | 'info' | 'warning' | 'error'

export interface AlertClosableConfig extends Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'onClose'
> {
  closeIcon?: JSX.Element
  afterClose?: () => void
  onClose?: (event: MouseEvent) => void
}

export interface AlertProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onClose' | 'title'> {
  type?: AlertType
  title?: JSX.Element
  message?: JSX.Element
  description?: JSX.Element
  closable?: boolean | AlertClosableConfig
  showIcon?: boolean
  icon?: JSX.Element
  action?: JSX.Element
  banner?: boolean
  afterClose?: () => void
  onClose?: (event: MouseEvent) => void
}
