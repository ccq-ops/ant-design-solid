import type { JSX } from 'solid-js'
import type { DropdownProps } from '../dropdown'
import type { MenuItem, MenuProps } from '../menu'

export type BreadcrumbParams = Record<string, string | number>
export type BreadcrumbSemanticSlot = 'root' | 'item' | 'separator'
export type BreadcrumbSemanticClassNames = Partial<Record<BreadcrumbSemanticSlot, string>>
export type BreadcrumbSemanticStyles = Partial<Record<BreadcrumbSemanticSlot, JSX.CSSProperties>>

export interface BreadcrumbMenuItem {
  key?: string | number
  title?: JSX.Element
  label?: JSX.Element
  path?: string
  href?: string
  disabled?: boolean
}

export interface BreadcrumbItemType extends JSX.AriaAttributes {
  key?: string | number
  title?: JSX.Element
  breadcrumbName?: string
  href?: string
  path?: string
  menu?: Omit<MenuProps, 'items'> & {
    items?: Array<MenuItem | BreadcrumbMenuItem>
  }
  dropdownProps?: DropdownProps
  onClick?: JSX.EventHandlerUnion<HTMLElement, MouseEvent>
  separator?: JSX.Element
  class?: string
  style?: JSX.CSSProperties
  children?: Omit<BreadcrumbItemType, 'children'>[]
  [key: `data-${string}`]: string | undefined
}

export interface BreadcrumbSeparatorType {
  type: 'separator'
  key?: string | number
  separator?: JSX.Element
  class?: string
  style?: JSX.CSSProperties
}

export type BreadcrumbRouteType = Partial<BreadcrumbItemType & BreadcrumbSeparatorType>

export type BreadcrumbItemRender = (
  route: BreadcrumbRouteType,
  params: BreadcrumbParams,
  routes: BreadcrumbRouteType[],
  paths: string[],
) => JSX.Element

export interface BreadcrumbProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'children'> {
  prefixCls?: string
  rootClass?: string
  params?: BreadcrumbParams
  routes?: BreadcrumbRouteType[]
  items?: BreadcrumbRouteType[]
  separator?: JSX.Element
  dropdownIcon?: JSX.Element
  itemRender?: BreadcrumbItemRender
  classNames?: BreadcrumbSemanticClassNames
  styles?: BreadcrumbSemanticStyles
  children?: JSX.Element
}

export interface BreadcrumbItemProps extends JSX.LiHTMLAttributes<HTMLLIElement> {
  prefixCls?: string
  href?: string
  menu?: BreadcrumbItemType['menu']
  dropdownProps?: DropdownProps
  dropdownIcon?: JSX.Element
  onClick?: JSX.EventHandlerUnion<HTMLElement, MouseEvent>
  separator?: JSX.Element
  children?: JSX.Element
}

export interface BreadcrumbSeparatorProps extends JSX.LiHTMLAttributes<HTMLLIElement> {
  children?: JSX.Element
}
