import type { JSX } from 'solid-js'

export type TimelineMode = 'left' | 'right' | 'alternate'
export type TimelinePosition = 'left' | 'right'
export type TimelineColor = 'blue' | 'red' | 'green' | 'gray' | string

export interface TimelineItem {
  label?: JSX.Element
  children?: JSX.Element
  color?: TimelineColor
  dot?: JSX.Element
  position?: TimelinePosition
}

export interface TimelineProps extends Omit<JSX.OlHTMLAttributes<HTMLOListElement>, 'children'> {
  items?: TimelineItem[]
  mode?: TimelineMode
  pending?: JSX.Element | boolean
  pendingDot?: JSX.Element
  reverse?: boolean
  prefixCls?: string
}
