import type { JSX } from 'solid-js'
export type Gutter = number | [number, number]
export interface RowProps extends JSX.HTMLAttributes<HTMLDivElement> { gutter?: Gutter; align?: 'top' | 'middle' | 'bottom' | 'stretch'; justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'; wrap?: boolean }
export interface ColProps extends JSX.HTMLAttributes<HTMLDivElement> { span?: number; offset?: number; order?: number; push?: number; pull?: number }
