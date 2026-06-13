import type { JSX, ValidComponent } from 'solid-js'

export type FlexGap = 'small' | 'middle' | 'medium' | 'large' | number | string | [number, number]
export type FlexOrientation = 'horizontal' | 'vertical'
export type FlexWrap = boolean | JSX.CSSProperties['flex-wrap']
export type FlexJustify =
  | 'flex-start'
  | 'flex-end'
  | 'start'
  | 'end'
  | 'center'
  | 'space-between'
  | 'space-around'
  | 'space-evenly'
  | 'stretch'
  | 'normal'
  | 'left'
  | 'right'
export type FlexAlign =
  | 'center'
  | 'start'
  | 'end'
  | 'flex-start'
  | 'flex-end'
  | 'self-start'
  | 'self-end'
  | 'baseline'
  | 'normal'
  | 'stretch'

export interface FlexProps extends JSX.HTMLAttributes<HTMLElement> {
  rootClassName?: string
  vertical?: boolean
  orientation?: FlexOrientation
  wrap?: FlexWrap
  justify?: FlexJustify
  align?: FlexAlign
  flex?: JSX.CSSProperties['flex']
  gap?: FlexGap
  component?: ValidComponent
  prefixCls?: string
}
