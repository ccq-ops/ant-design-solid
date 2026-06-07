import type { JSX } from 'solid-js'

export type MessageVisualType = 'info' | 'success' | 'error' | 'warning' | 'loading'
export type MessageType = MessageVisualType
export type MessageKey = string | number
export type MessageSemanticKey = 'root' | 'list' | 'listContent' | 'wrapper' | 'icon' | 'title'
export type MessageSemanticClassNames = Partial<Record<MessageSemanticKey, string>>
export type MessageSemanticStyles = Partial<Record<MessageSemanticKey, JSX.CSSProperties>>

export interface MessageArgs {
  key?: MessageKey
  type?: MessageVisualType
  content: JSX.Element
  duration?: number
  onClose?: () => void
  icon?: JSX.Element
  className?: string
  style?: JSX.CSSProperties
  classNames?: MessageSemanticClassNames
  styles?: MessageSemanticStyles
  onClick?: (event: MouseEvent) => void
  pauseOnHover?: boolean
}

export interface MessageConfigOptions {
  top?: string | number
  duration?: number
  prefixCls?: string
  getContainer?: () => HTMLElement
  maxCount?: number
  rtl?: boolean
  stack?: boolean | { threshold?: number }
  pauseOnHover?: boolean
  classNames?: MessageSemanticClassNames
  styles?: MessageSemanticStyles
}

export interface MessageNotice extends MessageArgs {
  key: MessageKey
  type: MessageVisualType
}

export interface MessageHandle extends PromiseLike<boolean> {
  (): void
  close: () => void
}

export type MessageContent = JSX.Element | MessageArgs
export type MessageTypeOpen = (
  content: MessageContent,
  duration?: number | (() => void),
  onClose?: () => void,
) => MessageHandle

export interface MessageInstance {
  open: (args: MessageArgs) => MessageHandle
  info: MessageTypeOpen
  success: MessageTypeOpen
  error: MessageTypeOpen
  warning: MessageTypeOpen
  loading: MessageTypeOpen
  destroy: (key?: MessageKey) => void
}

export interface MessageStatic extends MessageInstance {
  config: (options: MessageConfigOptions) => void
  useMessage: (config?: MessageConfigOptions) => [MessageInstance, JSX.Element]
}
