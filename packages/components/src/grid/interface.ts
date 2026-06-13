import type { JSX } from 'solid-js'
import type { Breakpoint, ResponsiveLike } from '../shared/responsive-observer'

export type ColSpanType = number | string
export type FlexType = number | 'none' | 'auto' | (string & {})
export type Gutter = number | string | undefined | ResponsiveLike<number | string>
export type RowAlign = 'top' | 'middle' | 'bottom' | 'stretch'
export type RowJustify =
  | 'start'
  | 'end'
  | 'center'
  | 'space-around'
  | 'space-between'
  | 'space-evenly'

export interface RowProps extends JSX.HTMLAttributes<HTMLDivElement> {
  gutter?: Gutter | [Gutter, Gutter]
  align?: RowAlign | ResponsiveLike<RowAlign>
  justify?: RowJustify | ResponsiveLike<RowJustify>
  prefixCls?: string
  wrap?: boolean
}

export interface ColSize {
  flex?: FlexType
  span?: ColSpanType
  order?: ColSpanType
  offset?: ColSpanType
  push?: ColSpanType
  pull?: ColSpanType
}

export interface ColProps
  extends JSX.HTMLAttributes<HTMLDivElement>, Partial<Record<Breakpoint, ColSpanType | ColSize>> {
  flex?: FlexType
  span?: ColSpanType
  offset?: ColSpanType
  order?: ColSpanType
  push?: ColSpanType
  pull?: ColSpanType
  prefixCls?: string
}
