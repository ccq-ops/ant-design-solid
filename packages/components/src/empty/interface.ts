import type { Component, JSX } from 'solid-js'

export type EmptySemanticSlot = 'root' | 'image' | 'description' | 'footer'
export type EmptySemanticClassNames = Partial<Record<EmptySemanticSlot, string>>
export type EmptySemanticStyles = Partial<Record<EmptySemanticSlot, JSX.CSSProperties>>
export type EmptySemanticInfo = { props: EmptyProps }
export type EmptySemanticClassNamesConfig =
  | EmptySemanticClassNames
  | ((info: EmptySemanticInfo) => EmptySemanticClassNames)
export type EmptySemanticStylesConfig =
  | EmptySemanticStyles
  | ((info: EmptySemanticInfo) => EmptySemanticStyles)

export interface EmptyRef {
  nativeElement?: HTMLDivElement
}

export interface EmptyComponent {
  (props: EmptyProps): JSX.Element
  PRESENTED_IMAGE_DEFAULT: Component
  PRESENTED_IMAGE_SIMPLE: Component
}

export interface EmptyProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'ref'> {
  prefixCls?: string
  rootClassName?: string
  image?: JSX.Element | Component
  description?: JSX.Element
  classNames?: EmptySemanticClassNamesConfig
  styles?: EmptySemanticStylesConfig
  children?: JSX.Element
  ref?: EmptyRef | { current?: EmptyRef } | ((ref: EmptyRef) => void)
}
