import type { JSX } from 'solid-js'

export type NotificationKey = string | number
export type NotificationType = 'success' | 'info' | 'warning' | 'error'
export type NotificationPlacement =
  | 'top'
  | 'topLeft'
  | 'topRight'
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
export type NotificationSemanticKey =
  | 'list'
  | 'listContent'
  | 'wrapper'
  | 'root'
  | 'icon'
  | 'title'
  | 'description'
  | 'actions'
  | 'section'
  | 'close'
  | 'progress'
  | 'notice'
  | 'message'

export interface NotificationSemanticInfo {
  props?: NotificationDivProps
}

export type NotificationClassNames =
  | Partial<Record<NotificationSemanticKey, string>>
  | ((info: NotificationSemanticInfo) => Partial<Record<NotificationSemanticKey, string>>)
export type NotificationStyles =
  | Partial<Record<NotificationSemanticKey, JSX.CSSProperties>>
  | ((
      info: NotificationSemanticInfo,
    ) => Partial<Record<NotificationSemanticKey, JSX.CSSProperties>>)

export type NotificationDivProps = JSX.HTMLAttributes<HTMLDivElement> &
  Record<`data-${string}`, string | undefined> &
  Record<`aria-${string}`, string | undefined>

export interface NotificationClosableConfig {
  closeIcon?: JSX.Element
  onClose?: () => void
}

export interface NotificationArgs {
  key?: NotificationKey
  type?: NotificationType
  title?: JSX.Element
  message?: JSX.Element
  description?: JSX.Element
  duration?: number | false
  placement?: NotificationPlacement
  onClose?: () => void
  class?: string
  className?: string
  classNames?: NotificationClassNames
  style?: JSX.CSSProperties
  styles?: NotificationStyles
  props?: NotificationDivProps
  onClick?: JSX.EventHandler<HTMLDivElement, MouseEvent>
  icon?: JSX.Element
  actions?: JSX.Element
  btn?: JSX.Element
  closable?: boolean | null | NotificationClosableConfig
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
  getContainer?: () => HTMLElement | ShadowRoot
  maxCount?: number
  stack?: boolean | { threshold?: number }
  prefixCls?: string
  closeIcon?: JSX.Element | boolean | null
  closable?: boolean | null | NotificationClosableConfig
  showProgress?: boolean
  pauseOnHover?: boolean
  rtl?: boolean
  classNames?: NotificationClassNames
  styles?: NotificationStyles
  props?: NotificationDivProps
}

export interface NotificationNotice extends NotificationArgs {
  key: NotificationKey
  type?: NotificationType
  placement: NotificationPlacement
  props?: NotificationDivProps
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
  destroy: (key?: NotificationKey) => void
  config: (options: NotificationConfig) => void
  useNotification: (config?: NotificationConfig) => [NotificationApi, JSX.Element]
}

export type NotificationApi = Omit<NotificationInstance, 'config' | 'useNotification'>
