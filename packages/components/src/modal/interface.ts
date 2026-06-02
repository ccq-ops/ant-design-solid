import type { JSX } from 'solid-js'

export interface ModalProps {
  open?: boolean
  title?: JSX.Element
  footer?: JSX.Element | null
  okText?: JSX.Element
  cancelText?: JSX.Element
  confirmLoading?: boolean
  closable?: boolean
  mask?: boolean
  maskClosable?: boolean
  keyboard?: boolean
  centered?: boolean
  width?: number | string
  zIndex?: number
  onOk?: () => void | Promise<void>
  onCancel?: () => void
  afterClose?: () => void
  children?: JSX.Element
  class?: string
  classList?: Record<string, boolean | undefined>
  style?: JSX.CSSProperties
  'aria-label'?: string
  'aria-labelledby'?: string
}

export type ModalFuncType = 'info' | 'success' | 'error' | 'warning' | 'confirm'

export interface ModalFuncProps {
  type?: ModalFuncType
  title?: JSX.Element
  content?: JSX.Element
  okText?: JSX.Element
  cancelText?: JSX.Element
  closable?: boolean
  maskClosable?: boolean
  keyboard?: boolean
  width?: number | string
  onOk?: () => void | Promise<void>
  onCancel?: () => void
}

export interface ModalFuncReturn {
  destroy: () => void
  update: (config: Partial<ModalFuncProps>) => void
}

export interface ModalStaticMethods {
  confirm: (config: ModalFuncProps) => ModalFuncReturn
  info: (config: ModalFuncProps) => ModalFuncReturn
  success: (config: ModalFuncProps) => ModalFuncReturn
  error: (config: ModalFuncProps) => ModalFuncReturn
  warning: (config: ModalFuncProps) => ModalFuncReturn
  destroyAll: () => void
}

export type ModalComponent = ((props: ModalProps) => JSX.Element) & ModalStaticMethods
