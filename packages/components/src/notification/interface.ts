import type { JSX } from 'solid-js'

export type NotificationType = 'success' | 'info' | 'warning' | 'error'
export type NotificationPlacement = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'

export interface NotificationArgs {
  key?: string
  type?: NotificationType
  message: JSX.Element
  description?: JSX.Element
  duration?: number
  placement?: NotificationPlacement
  onClose?: () => void
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
}
