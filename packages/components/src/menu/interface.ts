import type { Component, JSX } from 'solid-js'

export type MenuMode = 'vertical' | 'horizontal' | 'inline'
export type MenuTheme = 'light' | 'dark'
export type MenuKey = string
export type TriggerSubMenuAction = 'hover' | 'click'
export type MenuSemanticName =
  | 'root'
  | 'item'
  | 'itemIcon'
  | 'itemContent'
  | 'itemExtra'
  | 'submenu'
  | 'submenuTitle'
  | 'submenuArrow'
  | 'submenuList'
  | 'submenuPopup'
  | 'group'
  | 'groupTitle'
  | 'groupList'
  | 'divider'

export type MenuSemanticClasses =
  | Partial<Record<MenuSemanticName, string>>
  | ((info: { props: MenuProps }) => Partial<Record<MenuSemanticName, string>>)
export type MenuSemanticStyles =
  | Partial<Record<MenuSemanticName, JSX.CSSProperties>>
  | ((info: { props: MenuProps }) => Partial<Record<MenuSemanticName, JSX.CSSProperties>>)

export interface MenuClickInfo {
  key: MenuKey
  keyPath: MenuKey[]
  domEvent: MouseEvent | KeyboardEvent
}

export interface MenuSelectInfo extends MenuClickInfo {
  selectedKeys: MenuKey[]
}

export interface SubMenuTitleClickInfo {
  key: MenuKey
  domEvent: MouseEvent | KeyboardEvent
}

export interface MenuItemBase {
  key: MenuKey
  label: JSX.Element
  icon?: JSX.Element
  disabled?: boolean
  class?: string
  style?: JSX.CSSProperties
}

export interface MenuItemType extends MenuItemBase {
  type?: 'item'
  danger?: boolean
  extra?: JSX.Element
  title?: string
}

export interface SubMenuType extends MenuItemBase {
  type?: 'submenu'
  children?: MenuItem[]
  popupClass?: string
  popupOffset?: [number, number]
  theme?: MenuTheme
  onTitleClick?: (info: SubMenuTitleClickInfo) => void
  popupRender?: MenuPopupRender
}

export interface MenuItemGroupType {
  type: 'group'
  key?: MenuKey
  label?: JSX.Element
  children?: MenuItem[]
  class?: string
  style?: JSX.CSSProperties
}

export interface MenuDividerType {
  type: 'divider'
  key?: MenuKey
  dashed?: boolean
  class?: string
  style?: JSX.CSSProperties
}

export type MenuItem = MenuItemType | SubMenuType | MenuItemGroupType | MenuDividerType | null
export type MenuPopupRender = (
  node: JSX.Element,
  props: { item: SubMenuType; keys: MenuKey[] },
) => JSX.Element
export type MenuExpandIcon =
  | JSX.Element
  | ((props: SubMenuType & { isSubMenu: boolean; open: boolean }) => JSX.Element)
export type MenuTooltip = false | { title?: JSX.Element; class?: string; style?: JSX.CSSProperties }

export interface MenuProps extends Omit<
  JSX.HTMLAttributes<HTMLUListElement>,
  'onClick' | 'onSelect' | 'children'
> {
  items?: MenuItem[]
  children?: JSX.Element
  mode?: MenuMode
  selectedKeys?: MenuKey[]
  defaultSelectedKeys?: MenuKey[]
  openKeys?: MenuKey[]
  defaultOpenKeys?: MenuKey[]
  inlineCollapsed?: boolean
  inlineIndent?: number
  multiple?: boolean
  selectable?: boolean
  overflowedIndicator?: JSX.Element
  expandIcon?: MenuExpandIcon
  forceSubMenuRender?: boolean
  subMenuCloseDelay?: number
  subMenuOpenDelay?: number
  tooltip?: MenuTooltip
  theme?: MenuTheme
  triggerSubMenuAction?: TriggerSubMenuAction
  popupRender?: MenuPopupRender
  classNames?: MenuSemanticClasses
  styles?: MenuSemanticStyles
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement | ShadowRoot
  onClick?: (info: MenuClickInfo) => void
  onSelect?: (info: MenuSelectInfo) => void
  onDeselect?: (info: MenuSelectInfo) => void
  onOpenChange?: (openKeys: MenuKey[]) => void
}

export interface MenuItemComponentProps extends Omit<
  JSX.LiHTMLAttributes<HTMLLIElement>,
  'children' | 'onClick'
> {
  key: MenuKey
  icon?: JSX.Element
  disabled?: boolean
  danger?: boolean
  extra?: JSX.Element
  title?: string
  children?: JSX.Element
}

export interface SubMenuComponentProps extends Omit<
  JSX.LiHTMLAttributes<HTMLLIElement>,
  'children' | 'title' | 'onClick'
> {
  key: MenuKey
  title?: JSX.Element
  icon?: JSX.Element
  disabled?: boolean
  popupClass?: string
  popupOffset?: [number, number]
  theme?: MenuTheme
  onTitleClick?: (info: SubMenuTitleClickInfo) => void
  popupRender?: MenuPopupRender
  children?: JSX.Element
}

export interface MenuItemGroupComponentProps extends Omit<
  JSX.LiHTMLAttributes<HTMLLIElement>,
  'children' | 'title'
> {
  key?: MenuKey
  title?: JSX.Element
  children?: JSX.Element
}

export interface MenuDividerComponentProps extends JSX.LiHTMLAttributes<HTMLLIElement> {
  key?: MenuKey
  dashed?: boolean
}

export type MenuCompoundComponent = Component<MenuProps> & {
  Item: Component<MenuItemComponentProps>
  SubMenu: Component<SubMenuComponentProps>
  Divider: Component<MenuDividerComponentProps>
  ItemGroup: Component<MenuItemGroupComponentProps>
}
