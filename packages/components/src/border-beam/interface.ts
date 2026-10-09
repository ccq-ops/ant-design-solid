import type { JSX } from 'solid-js'
import type { BorderBeamColor, BorderBeamGradient } from './util'

export type { BorderBeamColor, BorderBeamGradient }

export interface BorderBeamProps {
  prefixCls?: string
  class?: string
  classList?: Record<string, boolean | undefined>
  style?: JSX.CSSProperties | string
  children?: JSX.Element
  color?: BorderBeamColor
  count?: number
  duration?: number
  lineWidth?: number | string
  outset?: number | string
  size?: number | string
}
