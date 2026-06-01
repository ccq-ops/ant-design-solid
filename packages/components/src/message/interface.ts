import type { JSX } from 'solid-js'

export type MessageType = 'info' | 'success' | 'error' | 'warning' | 'loading'

export interface MessageArgs {
  key?: string
  type?: MessageType
  content: JSX.Element
  duration?: number
  onClose?: () => void
}

export interface MessageNotice extends MessageArgs {
  key: string
  type: MessageType
}

export interface MessageHandle {
  close: () => void
}

export interface MessageInstance {
  open: (args: MessageArgs) => MessageHandle
  info: (content: JSX.Element | MessageArgs, duration?: number) => MessageHandle
  success: (content: JSX.Element | MessageArgs, duration?: number) => MessageHandle
  error: (content: JSX.Element | MessageArgs, duration?: number) => MessageHandle
  warning: (content: JSX.Element | MessageArgs, duration?: number) => MessageHandle
  loading: (content: JSX.Element | MessageArgs, duration?: number) => MessageHandle
  destroy: (key?: string) => void
}
