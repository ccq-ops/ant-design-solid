import type { JSX } from 'solid-js'

export interface BreadcrumbItemType {
  title: JSX.Element
  href?: string
  onClick?: JSX.EventHandlerUnion<HTMLElement, MouseEvent>
  separator?: JSX.Element
}

export interface BreadcrumbProps extends JSX.HTMLAttributes<HTMLElement> {
  items?: BreadcrumbItemType[]
  separator?: JSX.Element
  children?: JSX.Element
}

export interface BreadcrumbItemProps extends JSX.LiHTMLAttributes<HTMLLIElement> {
  href?: string
  onClick?: JSX.EventHandlerUnion<HTMLElement, MouseEvent>
  children?: JSX.Element
}
