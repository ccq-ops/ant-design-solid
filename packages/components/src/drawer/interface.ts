import type { JSX } from 'solid-js'

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom'
export type DrawerSize = 'default' | 'large' | number | string
export type DrawerSemanticDOM =
  | 'root'
  | 'mask'
  | 'wrapper'
  | 'section'
  | 'header'
  | 'title'
  | 'extra'
  | 'body'
  | 'footer'
  | 'dragger'
  | 'close'

export type DrawerSemanticClassNames =
  | Partial<Record<DrawerSemanticDOM, string>>
  | ((info: { props: DrawerProps }) => Partial<Record<DrawerSemanticDOM, string>>)

export type DrawerSemanticStyles =
  | Partial<Record<DrawerSemanticDOM, JSX.CSSProperties>>
  | ((info: { props: DrawerProps }) => Partial<Record<DrawerSemanticDOM, JSX.CSSProperties>>)

export interface DrawerClosableConfig {
  closeIcon?: JSX.Element
  disabled?: boolean
  placement?: 'start' | 'end'
}

export interface DrawerMaskConfig {
  enabled?: boolean
  blur?: boolean
  closable?: boolean
}

export interface DrawerFocusableConfig {
  trap?: boolean
  focusTriggerAfterClose?: boolean
}

export interface DrawerPushConfig {
  distance: number | string
}

export interface DrawerResizableConfig {
  onResizeStart?: () => void
  onResize?: (size: number) => void
  onResizeEnd?: () => void
}

export type DrawerGetContainer = HTMLElement | (() => HTMLElement) | string | false

export interface DrawerProps {
  open?: boolean
  title?: JSX.Element
  placement?: DrawerPlacement
  size?: DrawerSize
  defaultSize?: number
  closable?: boolean | DrawerClosableConfig
  closeIcon?: JSX.Element
  mask?: boolean | DrawerMaskConfig
  keyboard?: boolean
  destroyOnHidden?: boolean
  forceRender?: boolean
  extra?: JSX.Element
  footer?: JSX.Element
  zIndex?: number
  getContainer?: DrawerGetContainer
  rootClass?: string
  rootStyle?: JSX.CSSProperties
  classNames?: DrawerSemanticClassNames
  styles?: DrawerSemanticStyles
  loading?: boolean
  push?: boolean | DrawerPushConfig
  drawerRender?: (node: JSX.Element) => JSX.Element
  focusable?: DrawerFocusableConfig
  resizable?: boolean | DrawerResizableConfig
  maxSize?: number
  onClose?: (event?: MouseEvent | KeyboardEvent) => void
  afterOpenChange?: (open: boolean) => void
  children?: JSX.Element
  class?: string
  classList?: Record<string, boolean | undefined>
  style?: JSX.CSSProperties
  'aria-label'?: string
  'aria-labelledby'?: string
}
