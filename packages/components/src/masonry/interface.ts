import type { JSX } from 'solid-js'

export type MasonryBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
export type MasonryResponsiveValue<T> = T | Partial<Record<MasonryBreakpoint, T>>
export type MasonryItemKey = string | number

export interface MasonryItem {
  key?: MasonryItemKey
  [key: string]: unknown
}

export interface MasonryLayoutItem<T = MasonryItem> {
  key: MasonryItemKey
  item: T
  index: number
  column: number
  height: number
}

export interface MasonryLayoutInfo<T = MasonryItem> {
  columns: number
  columnHeights: number[]
  items: MasonryLayoutItem<T>[]
}

export interface MasonryProps<T extends MasonryItem = MasonryItem> {
  prefixCls?: string
  class?: string
  classList?: Record<string, boolean | undefined>
  style?: JSX.CSSProperties | string
  columns?: MasonryResponsiveValue<number>
  gutter?: MasonryResponsiveValue<number | string>
  items?: T[]
  itemRender?: (item: T, index: number) => JSX.Element
  children?: JSX.Element
  fresh?: boolean
  classNames?: {
    item?: string
  }
  styles?: {
    item?: JSX.CSSProperties | string
  }
  onLayoutChange?: (info: MasonryLayoutInfo<T>) => void
}
