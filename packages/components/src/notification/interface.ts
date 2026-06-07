import type { JSX } from 'solid-js'

export type NotificationType = 'success' | 'info' | 'warning' | 'error'
export type NotificationPlacement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
export type NotificationSemanticKey =
  | 'root'
  | 'notice'
  | 'icon'
  | 'message'
  | 'description'
  | 'actions'
  | 'close'
  | 'progress'

export type NotificationClassNames = Partial<Record<NotificationSemanticKey, string>>
export type NotificationStyles = Partial<Record<NotificationSemanticKey, JSX.CSSProperties>>

export interface NotificationClosableConfig {
  closeIcon?: JSX.Element
  onClose?: () => void
}

export interface NotificationArgs {
  key?: string
  type?: NotificationType
  title?: JSX.Element
  message?: JSX.Element
  description?: JSX.Element
  duration?: number | false
  placement?: NotificationPlacement
  onClose?: () => void
  className?: string
  classNames?: NotificationClassNames
  style?: JSX.CSSProperties
  styles?: NotificationStyles
  props?: JSX.HTMLAttributes<HTMLDivElement> & Record<`data-${string}`, string | undefined>
  onClick?: JSX.EventHandler<HTMLDivElement, MouseEvent>
  icon?: JSX.Element
  actions?: JSX.Element
  btn?: JSX.Element
  closable?: boolean | NotificationClosableConfig
  closeIcon?: JSX.Element | boolean | null
  role?: 'alert' | 'status'
  showProgress?: boolean
  pauseOnHover?: boolean
}

export interface NotificationConfig {
  placement?: NotificationPlacement
  duration?: number | false
  top?: number
  bottom?: number
  getContainer?: () => HTMLElement
  maxCount?: number
  closeIcon?: JSX.Element | boolean | null
  showProgress?: boolean
  pauseOnHover?: boolean
  rtl?: boolean
}

export interface NotificationNotice extends NotificationArgs {
  key: string
  type?: NotificationType
  placement: NotificationPlacement
}

export interface NotificationHandle {
  close: () => void
}

export interface NotificationInstance {
  open: (args: NotificationArgs) => NotificationHandle
  success: (args: NotificationArgs) => NotificationHandle
  info: (args: NotificationArgs) => NotificationHandle
  warning: (args: NotificationArgs) => NotificationHandle
  error: (args: NotificationArgs) => NotificationHandle
  destroy: (key?: string) => void
  config: (options: NotificationConfig) => void
}
