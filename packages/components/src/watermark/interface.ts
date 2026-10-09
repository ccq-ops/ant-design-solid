import type { JSX } from 'solid-js'

export type WatermarkContent = string | string[]
export type WatermarkGap = [number, number]
export type WatermarkOffset = [number, number]
export type WatermarkFontSize = number | string
export type WatermarkTextAlign = 'left' | 'right' | 'center' | 'start' | 'end'
export type WatermarkFontWeight = 'normal' | 'lighter' | 'bold' | 'bolder' | number
export type WatermarkFontStyle = 'none' | 'normal' | 'italic' | 'oblique'

export interface WatermarkFont {
  color?: string
  fontSize?: WatermarkFontSize
  fontWeight?: WatermarkFontWeight
  fontFamily?: string
  fontStyle?: WatermarkFontStyle
  textAlign?: WatermarkTextAlign
}

export interface WatermarkText {
  text: string
  font?: WatermarkFont
}

export interface WatermarkRef {
  nativeElement?: HTMLDivElement
}

export interface WatermarkProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'ref'> {
  width?: number
  height?: number
  rotate?: number
  zIndex?: number
  image?: string
  content?: WatermarkContent
  font?: WatermarkFont
  gap?: WatermarkGap
  offset?: WatermarkOffset
  inherit?: boolean
  onRemove?: () => void
  prefixCls?: string
  rootClassName?: string
  className?: string
  children?: JSX.Element
  ref?: WatermarkRef | { current?: WatermarkRef } | ((ref: WatermarkRef) => void)
}
