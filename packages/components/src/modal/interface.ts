import type { JSX } from 'solid-js'
import type { ButtonProps, ButtonType } from '../button'

export type ModalSemanticName =
  | 'root'
  | 'mask'
  | 'wrap'
  | 'modal'
  | 'content'
  | 'header'
  | 'title'
  | 'body'
  | 'footer'
  | 'close'

export type ModalClassNames = Partial<Record<ModalSemanticName, string>>
export type ModalStyles = Partial<Record<ModalSemanticName, JSX.CSSProperties>>

export interface ModalMaskConfig {
  enabled?: boolean
  blur?: boolean
  closable?: boolean
}

export interface ModalClosableConfig {
  closeIcon?: JSX.Element
  disabled?: boolean
  onClose?: () => void
  afterClose?: () => void
}

export type ModalGetContainer = HTMLElement | (() => HTMLElement | undefined) | string | false

export interface ModalFooterRenderExtra {
  OkBtn: () => JSX.Element
  CancelBtn: () => JSX.Element
}

export type ModalFooterRender = (
  originNode: JSX.Element,
  extra: ModalFooterRenderExtra,
) => JSX.Element

export type ModalFooter = JSX.Element | ModalFooterRender | null

export interface ModalProps {
  open?: boolean
  title?: JSX.Element
  footer?: ModalFooter
  okText?: JSX.Element
  cancelText?: JSX.Element
  confirmLoading?: boolean
  closable?: boolean | ModalClosableConfig
  closeIcon?: JSX.Element
  mask?: boolean | ModalMaskConfig
  maskClosable?: boolean
  keyboard?: boolean
  centered?: boolean
  width?: number | string
  zIndex?: number
  okType?: ButtonType
  okButtonProps?: ButtonProps
  cancelButtonProps?: ButtonProps
  destroyOnHidden?: boolean
  forceRender?: boolean
  getContainer?: ModalGetContainer
  modalRender?: (node: JSX.Element) => JSX.Element
  afterOpenChange?: (open: boolean) => void
  loading?: boolean
  className?: string
  wrapClassName?: string
  classNames?: ModalClassNames
  styles?: ModalStyles
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
export type ModalFuncClose = () => void

export interface ModalFuncProps {
  type?: ModalFuncType
  title?: JSX.Element
  content?: JSX.Element
  okText?: JSX.Element
  cancelText?: JSX.Element
  closable?: boolean | ModalClosableConfig
  closeIcon?: JSX.Element
  mask?: boolean | ModalMaskConfig
  maskClosable?: boolean
  keyboard?: boolean
  centered?: boolean
  width?: number | string
  zIndex?: number
  style?: JSX.CSSProperties
  className?: string
  wrapClassName?: string
  classNames?: ModalClassNames
  styles?: ModalStyles
  okType?: ButtonType
  okButtonProps?: ButtonProps
  cancelButtonProps?: ButtonProps
  footer?: ModalFooter
  icon?: JSX.Element
  afterClose?: () => void
  getContainer?: ModalGetContainer
  modalRender?: (node: JSX.Element) => JSX.Element
  destroyOnHidden?: boolean
  forceRender?: boolean
  onOk?: (close?: ModalFuncClose) => void | Promise<void>
  onCancel?: (close?: ModalFuncClose) => void | Promise<void>
}

export type ModalFuncUpdate =
  | Partial<ModalFuncProps>
  | ((prevConfig: ModalFuncProps) => Partial<ModalFuncProps>)

export interface ModalFuncReturn {
  destroy: () => void
  update: (config: ModalFuncUpdate) => void
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
