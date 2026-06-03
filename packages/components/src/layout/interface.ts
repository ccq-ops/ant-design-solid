import type { JSX } from 'solid-js'

export interface LayoutProps extends JSX.HTMLAttributes<HTMLElement> {
  hasSider?: boolean
  children?: JSX.Element
}

export interface LayoutHeaderProps extends JSX.HTMLAttributes<HTMLElement> {
  children?: JSX.Element
}

export interface LayoutFooterProps extends JSX.HTMLAttributes<HTMLElement> {
  children?: JSX.Element
}

export interface LayoutContentProps extends JSX.HTMLAttributes<HTMLElement> {
  children?: JSX.Element
}

export type LayoutSiderTheme = 'light' | 'dark'

export interface LayoutSiderProps extends JSX.HTMLAttributes<HTMLElement> {
  width?: number | string
  collapsedWidth?: number | string
  collapsed?: boolean
  theme?: LayoutSiderTheme
  children?: JSX.Element
}
