import type { JSX } from 'solid-js'

export type WatermarkContent = string | string[]
export type WatermarkGap = [number, number]
export type WatermarkOffset = [number, number]

export interface WatermarkProps extends JSX.HTMLAttributes<HTMLDivElement> {
  width?: number
  height?: number
  rotate?: number
  zIndex?: number
  image?: string
  content?: WatermarkContent
  font?: {
    color?: string
    fontSize?: number
    fontWeight?: number | string
    fontFamily?: string
    fontStyle?: string
  }
  gap?: WatermarkGap
  offset?: WatermarkOffset
  prefixCls?: string
  className?: string
  children?: JSX.Element
}
