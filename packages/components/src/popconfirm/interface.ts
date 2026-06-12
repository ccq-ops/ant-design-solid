import type { JSX } from 'solid-js'
import type { ButtonProps, ButtonType } from '../button'
import type {
  PopoverPlacement,
  PopoverRef,
  PopoverSemanticClassNames,
  PopoverSemanticStyles,
  PopoverTrigger,
} from '../popover'
import type { TooltipAlignConfig, TooltipArrow, TooltipOverflowConfig } from '../tooltip'

export type PopconfirmPlacement = PopoverPlacement
export type PopconfirmTrigger = PopoverTrigger
export type PopconfirmRender = () => JSX.Element
export type PopconfirmRef = PopoverRef
export type PopconfirmSemanticSlot =
  | keyof PopoverSemanticClassNames
  | 'icon'
  | 'title'
  | 'description'
  | 'buttons'
export type PopconfirmSemanticClassNames = PopoverSemanticClassNames &
  Partial<Record<'icon' | 'title' | 'description' | 'buttons', string>>
export type PopconfirmSemanticStyles = PopoverSemanticStyles &
  Partial<Record<'icon' | 'title' | 'description' | 'buttons', JSX.CSSProperties>>
export type PopconfirmSemanticClassNamesConfig =
  | PopconfirmSemanticClassNames
  | ((info: { props: PopconfirmProps }) => PopconfirmSemanticClassNames)
export type PopconfirmSemanticStylesConfig =
  | PopconfirmSemanticStyles
  | ((info: { props: PopconfirmProps }) => PopconfirmSemanticStyles)

export interface PopconfirmProps extends Omit<
  JSX.HTMLAttributes<HTMLSpanElement>,
  'title' | 'ref' | 'onConfirm' | 'onCancel' | 'className' | 'style' | 'classList' | 'children'
> {
  ref?: PopconfirmRef | { current?: PopconfirmRef } | ((ref: PopconfirmRef) => void)
  title?: JSX.Element | PopconfirmRender
  description?: JSX.Element | PopconfirmRender
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  placement?: PopconfirmPlacement
  trigger?: PopconfirmTrigger
  okText?: JSX.Element
  okType?: ButtonType
  okButtonProps?: ButtonProps
  cancelText?: JSX.Element
  cancelButtonProps?: ButtonProps
  showCancel?: boolean
  icon?: JSX.Element
  onConfirm?: (event?: MouseEvent) => void | Promise<void>
  onCancel?: (event?: MouseEvent) => void
  onOpenChange?: (open: boolean) => void
  afterOpenChange?: (open: boolean) => void
  onPopupClick?: (event: MouseEvent) => void
  mouseEnterDelay?: number
  mouseLeaveDelay?: number
  align?: TooltipAlignConfig
  arrow?: TooltipArrow
  autoAdjustOverflow?: boolean | TooltipOverflowConfig
  fresh?: boolean
  destroyOnHidden?: boolean
  /** @deprecated Please use `destroyOnHidden` instead. */
  destroyTooltipOnHide?: boolean | { keepParent?: boolean }
  color?: string
  rootClass?: string
  /** @deprecated Use `rootClass` in Solid code. */
  rootClassName?: string
  openClass?: string
  /** @deprecated Use `openClass` in Solid code. */
  openClassName?: string
  overlayClass?: string
  /** @deprecated Use `classNames.root` instead. */
  overlayClassName?: string
  overlayStyle?: JSX.CSSProperties
  /** @deprecated Use `styles.container` instead. */
  overlayInnerStyle?: JSX.CSSProperties
  classNames?: PopconfirmSemanticClassNamesConfig
  styles?: PopconfirmSemanticStylesConfig
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
  class?: string
  classList?: Record<string, boolean | undefined>
  style?: JSX.CSSProperties | string
  children: JSX.Element
}
