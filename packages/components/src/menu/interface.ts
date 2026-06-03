import type { JSX } from 'solid-js'

export type MenuMode = 'vertical' | 'horizontal' | 'inline'
export type MenuKey = string

export interface MenuClickInfo {
  key: MenuKey
  keyPath: MenuKey[]
  domEvent: MouseEvent | KeyboardEvent
}

export interface MenuSelectInfo extends MenuClickInfo {
  selectedKeys: MenuKey[]
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
}

export interface SubMenuType extends MenuItemBase {
  type?: 'submenu'
  children: MenuItem[]
}

export interface MenuItemGroupType {
  type: 'group'
  label?: JSX.Element
  children: MenuItem[]
  class?: string
  style?: JSX.CSSProperties
}

export interface MenuDividerType {
  type: 'divider'
  class?: string
  style?: JSX.CSSProperties
}

export type MenuItem = MenuItemType | SubMenuType | MenuItemGroupType | MenuDividerType

export interface MenuProps extends Omit<
  JSX.HTMLAttributes<HTMLUListElement>,
  'onClick' | 'onSelect'
> {
  items: MenuItem[]
  mode?: MenuMode
  selectedKeys?: MenuKey[]
  defaultSelectedKeys?: MenuKey[]
  openKeys?: MenuKey[]
  defaultOpenKeys?: MenuKey[]
  inlineCollapsed?: boolean
  onClick?: (info: MenuClickInfo) => void
  onSelect?: (info: MenuSelectInfo) => void
  onOpenChange?: (openKeys: MenuKey[]) => void
}
