import type { JSX } from 'solid-js'

export type WatermarkContent = string | string[]
export type WatermarkGap = [number, number]
export type WatermarkOffset = [number, number]
export type WatermarkFontSize = number | string
export type WatermarkTextAlign = 'left' | 'right' | 'center' | 'start' | 'end'
export type WatermarkFontWeight = 'normal' | 'lighter' | 'bold' | 'bolder' | number
export type WatermarkFontStyle = 'none' | 'normal' | 'italic' | 'oblique'

export interface WatermarkProps extends JSX.HTMLAttributes<HTMLDivElement> {
  width?: number
  height?: number
  rotate?: number
  zIndex?: number
  image?: string
  content?: WatermarkContent
  font?: {
    color?: string
    fontSize?: WatermarkFontSize
    fontWeight?: WatermarkFontWeight
    fontFamily?: string
    fontStyle?: WatermarkFontStyle
    textAlign?: WatermarkTextAlign
  }
  gap?: WatermarkGap
  offset?: WatermarkOffset
  inherit?: boolean
  onRemove?: () => void
  prefixCls?: string
  rootClassName?: string
  className?: string
  children?: JSX.Element
}
