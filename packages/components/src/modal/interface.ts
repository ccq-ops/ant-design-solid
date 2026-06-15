import type { JSX } from 'solid-js'
import type { ButtonProps, ButtonType } from '../button'

export type ModalBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
export type ModalWidth = number | string | Partial<Record<ModalBreakpoint, number | string>>

export type ModalSemanticName =
  | 'root'
  | 'mask'
  | 'wrap'
  | 'wrapper'
  | 'modal'
  | 'container'
  | 'content'
  | 'header'
  | 'title'
  | 'body'
  | 'footer'
  | 'close'

export type ModalClassNames = Partial<Record<ModalSemanticName, string>>
export type ModalStyles = Partial<Record<ModalSemanticName, JSX.CSSProperties>>
export interface ModalSemanticInfo {
  props: ModalProps
}
export type ModalClassNamesInput = ModalClassNames | ((info: ModalSemanticInfo) => ModalClassNames)
export type ModalStylesInput = ModalStyles | ((info: ModalSemanticInfo) => ModalStyles)

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
  [key: `aria-${string}`]: string | undefined
  [key: `data-${string}`]: string | undefined
}

export interface ModalFocusableConfig {
  trap?: boolean
  focusTriggerAfterClose?: boolean
  autoFocusButton?: null | 'ok' | 'cancel'
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

export type ModalCloseIcon = JSX.Element | null | false
export type ModalEvent = MouseEvent | KeyboardEvent

export interface ModalProps {
  open?: boolean
  title?: JSX.Element
  footer?: ModalFooter
  okText?: JSX.Element
  cancelText?: JSX.Element
  confirmLoading?: boolean
  closable?: boolean | ModalClosableConfig
  closeIcon?: ModalCloseIcon
  mask?: boolean | ModalMaskConfig
  maskClosable?: boolean
  keyboard?: boolean
  centered?: boolean
  width?: ModalWidth
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
  focusable?: ModalFocusableConfig
  focusTriggerAfterClose?: boolean
  class?: string
  rootClass?: string
  wrapClass?: string
  classNames?: ModalClassNamesInput
  styles?: ModalStylesInput
  bodyStyle?: JSX.CSSProperties
  maskStyle?: JSX.CSSProperties
  onOk?: (event: MouseEvent) => void | Promise<void>
  onCancel?: (event: ModalEvent) => void
  afterClose?: () => void
  children?: JSX.Element
  classList?: Record<string, boolean | undefined>
  style?: JSX.CSSProperties
  rootStyle?: JSX.CSSProperties
  wrapProps?: JSX.HTMLAttributes<HTMLDivElement>
  prefixCls?: string
  transitionName?: string
  maskTransitionName?: string
  mousePosition?: { x: number; y: number } | null
  'aria-label'?: string
  'aria-labelledby'?: string
}

export type ModalFuncType = 'info' | 'success' | 'error' | 'warn' | 'warning' | 'confirm'
export type ModalFuncClose = () => void

export interface ModalFuncProps {
  type?: ModalFuncType
  open?: boolean
  title?: JSX.Element
  content?: JSX.Element
  okText?: JSX.Element
  cancelText?: JSX.Element
  closable?: boolean | ModalClosableConfig
  closeIcon?: ModalCloseIcon
  mask?: boolean | ModalMaskConfig
  maskClosable?: boolean
  keyboard?: boolean
  centered?: boolean
  width?: number | string
  zIndex?: number
  style?: JSX.CSSProperties
  rootStyle?: JSX.CSSProperties
  class?: string
  rootClass?: string
  wrapClass?: string
  classNames?: ModalClassNamesInput
  styles?: ModalStylesInput
  bodyStyle?: JSX.CSSProperties
  maskStyle?: JSX.CSSProperties
  okType?: ButtonType
  okButtonProps?: ButtonProps
  cancelButtonProps?: ButtonProps
  footer?: ModalFooter
  icon?: JSX.Element | null | false
  afterClose?: () => void
  getContainer?: ModalGetContainer
  modalRender?: (node: JSX.Element) => JSX.Element
  destroyOnHidden?: boolean
  forceRender?: boolean
  okCancel?: boolean
  prefixCls?: string
  direction?: 'ltr' | 'rtl'
  transitionName?: string
  maskTransitionName?: string
  focusTriggerAfterClose?: boolean
  autoFocusButton?: null | 'ok' | 'cancel'
  focusable?: ModalFocusableConfig
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

export interface ModalFuncReturnWithThen extends ModalFuncReturn {
  then: <T>(
    onfulfilled?: ((value: boolean) => T | PromiseLike<T>) | null,
    onrejected?: ((reason: unknown) => T | PromiseLike<T>) | null,
  ) => Promise<T | boolean>
}

export type ModalHookFunc = (config: ModalFuncProps) => ModalFuncReturnWithThen

export interface ModalHookApi {
  confirm: ModalHookFunc
  info: ModalHookFunc
  success: ModalHookFunc
  error: ModalHookFunc
  warning: ModalHookFunc
  warn: ModalHookFunc
}

export interface ModalStaticMethods {
  confirm: (config: ModalFuncProps) => ModalFuncReturn
  info: (config: ModalFuncProps) => ModalFuncReturn
  success: (config: ModalFuncProps) => ModalFuncReturn
  error: (config: ModalFuncProps) => ModalFuncReturn
  warning: (config: ModalFuncProps) => ModalFuncReturn
  warn: (config: ModalFuncProps) => ModalFuncReturn
  destroyAll: () => void
  useModal: () => readonly [ModalHookApi, JSX.Element]
  config: (options: { rootPrefixCls?: string }) => void
}

export type ModalComponent = ((props: ModalProps) => JSX.Element) & ModalStaticMethods
