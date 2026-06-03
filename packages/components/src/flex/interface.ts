import type { JSX } from 'solid-js'

export type FlexGap = 'small' | 'middle' | 'large' | number | [number, number]
export type FlexWrap = boolean | 'nowrap' | 'wrap' | 'wrap-reverse'
export type FlexJustify =
  | 'flex-start'
  | 'center'
  | 'flex-end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
export type FlexAlign = 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline'

export interface FlexProps extends JSX.HTMLAttributes<HTMLElement> {
  vertical?: boolean
  wrap?: FlexWrap
  justify?: FlexJustify
  align?: FlexAlign
  gap?: FlexGap
  component?: keyof JSX.IntrinsicElements
  prefixCls?: string
}
