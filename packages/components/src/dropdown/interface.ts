import type { JSX } from 'solid-js'
import type { ButtonHTMLType, ButtonLoading, ButtonProps, ButtonType } from '../button'
import type { MenuClickInfo, MenuItem, MenuProps } from '../menu'
import type { TooltipAlignConfig, TooltipOverflowConfig } from '../shared/placement'

export type { TooltipAlignConfig, TooltipOverflowConfig } from '../shared/placement'
export type DropdownPlacement =
  | 'bottom'
  | 'bottomLeft'
  | 'bottomRight'
  | 'top'
  | 'topLeft'
  | 'topRight'
export type DropdownTrigger = 'hover' | 'click' | 'contextMenu'
export type DropdownTriggerInput = DropdownTrigger | DropdownTrigger[]
export type DropdownArrow = boolean | { pointAtCenter?: boolean }
export type DropdownOpenChangeSource = 'trigger' | 'menu'
export type DropdownSemanticSlot = 'root' | 'item' | 'itemTitle' | 'itemIcon' | 'itemContent'
export type DropdownSemanticClassNames = Partial<Record<DropdownSemanticSlot, string>>
export type DropdownSemanticStyles = Partial<Record<DropdownSemanticSlot, JSX.CSSProperties>>
export type DropdownSemanticClassNamesConfig =
  | DropdownSemanticClassNames
  | ((info: { props: DropdownProps }) => DropdownSemanticClassNames)
export type DropdownSemanticStylesConfig =
  | DropdownSemanticStyles
  | ((info: { props: DropdownProps }) => DropdownSemanticStyles)

export interface DropdownMenuClickInfo {
  key: string
  domEvent: MouseEvent
}

export interface DropdownMenuItem {
  key: string
  label?: JSX.Element
  icon?: JSX.Element
  disabled?: boolean
  type?: 'item' | 'divider'
  danger?: boolean
  extra?: JSX.Element
  children?: DropdownMenuItem[]
}

export interface DropdownMenuProps extends Omit<MenuProps, 'items' | 'onClick'> {
  items?: MenuItem[] | DropdownMenuItem[]
  onClick?: (info: MenuClickInfo | DropdownMenuClickInfo) => void
}

export interface DropdownProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  menu?: DropdownMenuProps
  trigger?: DropdownTriggerInput
  placement?: DropdownPlacement
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean, info: { source: DropdownOpenChangeSource }) => void
  disabled?: boolean
  arrow?: DropdownArrow
  autoAdjustOverflow?: boolean | TooltipOverflowConfig
  align?: TooltipAlignConfig
  popupRender?: (originNode: JSX.Element) => JSX.Element
  /** @deprecated Use `popupRender` instead. */
  dropdownRender?: (originNode: JSX.Element) => JSX.Element
  destroyOnHidden?: boolean
  /** @deprecated Use `destroyOnHidden` instead. */
  destroyPopupOnHide?: boolean
  forceRender?: boolean
  autoFocus?: boolean
  mouseEnterDelay?: number
  mouseLeaveDelay?: number
  rootClass?: string
  openClass?: string
  overlayClass?: string
  /** @deprecated Use `classNames.root` instead. */
  overlayClassName?: string
  overlayStyle?: JSX.CSSProperties
  classNames?: DropdownSemanticClassNamesConfig
  styles?: DropdownSemanticStylesConfig
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement | ShadowRoot
}

export type DropdownButtonType = ButtonType

export interface DropdownButtonProps
  extends
    Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onClick'>,
    Pick<
      DropdownProps,
      | 'menu'
      | 'arrow'
      | 'autoFocus'
      | 'trigger'
      | 'align'
      | 'open'
      | 'onOpenChange'
      | 'placement'
      | 'getPopupContainer'
      | 'mouseEnterDelay'
      | 'mouseLeaveDelay'
      | 'overlayClass'
      | 'overlayClassName'
      | 'overlayStyle'
      | 'destroyOnHidden'
      | 'destroyPopupOnHide'
      | 'dropdownRender'
      | 'popupRender'
      | 'disabled'
    > {
  type?: DropdownButtonType
  htmlType?: ButtonHTMLType
  danger?: boolean
  loading?: ButtonLoading
  onClick?: JSX.EventHandlerUnion<HTMLElement, MouseEvent>
  icon?: JSX.Element
  href?: string
  children?: JSX.Element
  title?: string
  buttonsRender?: (buttons: JSX.Element[]) => JSX.Element[]
  buttonProps?: ButtonProps
}
