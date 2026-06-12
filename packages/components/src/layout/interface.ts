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
export type LayoutSiderCollapseType = 'clickTrigger' | 'responsive'
export type LayoutSiderBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl'

export interface LayoutSiderProps extends JSX.HTMLAttributes<HTMLElement> {
  width?: number | string
  collapsedWidth?: number | string
  collapsed?: boolean
  collapsible?: boolean
  defaultCollapsed?: boolean
  reverseArrow?: boolean
  trigger?: JSX.Element | null
  zeroWidthTriggerStyle?: JSX.CSSProperties
  breakpoint?: LayoutSiderBreakpoint
  theme?: LayoutSiderTheme
  onBreakpoint?: (broken: boolean) => void
  onCollapse?: (collapsed: boolean, type: LayoutSiderCollapseType) => void
  children?: JSX.Element
}
