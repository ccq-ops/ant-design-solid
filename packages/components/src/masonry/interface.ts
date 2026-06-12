import type { JSX } from 'solid-js'

export type MasonryBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
export type MasonryResponsiveValue<T> = T | Partial<Record<MasonryBreakpoint, T>>
export type MasonryGap = MasonryResponsiveValue<number | undefined>
export type MasonryGutter = MasonryGap | [MasonryGap, MasonryGap]
export type MasonryItemKey = string | number
export type MasonrySemanticSlot = 'root' | 'item'
export type MasonrySemanticClassNamesMap = Partial<Record<MasonrySemanticSlot, string>>
export type MasonrySemanticStylesMap = Partial<Record<MasonrySemanticSlot, JSX.CSSProperties>>
export type MasonrySemanticClassNames<T extends MasonryItem = MasonryItem> =
  | MasonrySemanticClassNamesMap
  | ((info: { props: MasonryProps<T> }) => MasonrySemanticClassNamesMap)
export type MasonrySemanticStyles<T extends MasonryItem = MasonryItem> =
  | MasonrySemanticStylesMap
  | ((info: { props: MasonryProps<T> }) => MasonrySemanticStylesMap)

export interface MasonryItem<T = unknown> {
  key: MasonryItemKey
  column?: number
  height?: number
  children?: JSX.Element
  data: T
}

export interface MasonryRenderItem<T = unknown> extends MasonryItem<T> {
  index: number
  column: number
}

export interface MasonryLayoutItem<T extends MasonryItem = MasonryItem> {
  key: MasonryItemKey
  item: T
  index: number
  column: number
  height: number
}

export interface MasonryLayoutInfo<T extends MasonryItem = MasonryItem> {
  columns: number
  columnHeights: number[]
  items: MasonryLayoutItem<T>[]
}

export interface MasonryProps<T extends MasonryItem = MasonryItem> {
  prefixCls?: string
  class?: string
  classList?: Record<string, boolean | undefined>
  rootClass?: string
  /** @deprecated Use `rootClass` in Solid code. */
  rootClassName?: string
  style?: JSX.CSSProperties | string
  columns?: MasonryResponsiveValue<number>
  gutter?: MasonryGutter
  items?: T[]
  itemRender?: (item: MasonryRenderItem<T['data']>) => JSX.Element
  children?: JSX.Element
  fresh?: boolean
  classNames?: MasonrySemanticClassNames<T>
  styles?: MasonrySemanticStyles<T>
  onLayoutChange?: (info: Array<{ key: MasonryItemKey; column: number }>) => void
  onLayoutInfoChange?: (info: MasonryLayoutInfo<T>) => void
}
