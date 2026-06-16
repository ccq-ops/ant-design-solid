import type { JSX } from 'solid-js'
import type { ComponentSize } from '@solid-ant-design/theme'

export type DividerType = 'horizontal' | 'vertical'
export type DividerOrientation = DividerType
export type DividerTitlePlacement = 'left' | 'right' | 'center' | 'start' | 'end'
export type DividerVariant = 'dashed' | 'dotted' | 'solid'
export type DividerSize = ComponentSize | 'medium'
export type DividerSemanticKey = 'root' | 'rail' | 'content'
export type DividerSemanticClassNames = Partial<Record<DividerSemanticKey, string>>
export type DividerSemanticStyles = Partial<Record<DividerSemanticKey, JSX.CSSProperties>>
export type DividerSemanticInfo = { props: DividerProps }
export type DividerSemanticClassNamesConfig =
  | DividerSemanticClassNames
  | ((info: DividerSemanticInfo) => DividerSemanticClassNames)
export type DividerSemanticStylesConfig =
  | DividerSemanticStyles
  | ((info: DividerSemanticInfo) => DividerSemanticStyles)

export interface DividerProps extends JSX.HTMLAttributes<HTMLDivElement> {
  prefixCls?: string
  orientation?: DividerOrientation
  vertical?: boolean
  titlePlacement?: DividerTitlePlacement
  orientationMargin?: string | number
  rootClass?: string
  dashed?: boolean
  variant?: DividerVariant
  size?: DividerSize
  plain?: boolean
  classNames?: DividerSemanticClassNamesConfig
  styles?: DividerSemanticStylesConfig
  children?: JSX.Element
}
