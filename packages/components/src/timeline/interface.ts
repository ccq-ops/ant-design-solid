import type { JSX } from 'solid-js'

export type TimelineMode = 'start' | 'alternate' | 'end'
export type TimelineOrientation = 'vertical' | 'horizontal'
export type TimelineVariant = 'outlined' | 'filled'
export type TimelinePlacement = 'start' | 'end'
export type TimelineColor = 'blue' | 'red' | 'green' | 'gray' | string
export type TimelineSemanticKey =
  | 'root'
  | 'list'
  | 'item'
  | 'itemTitle'
  | 'itemIcon'
  | 'itemContent'
  | 'itemRail'
  | 'itemWrapper'
  | 'itemSection'
  | 'itemHeader'
export type TimelineSemanticClassNames = Partial<Record<TimelineSemanticKey, string>>
export type TimelineSemanticStyles = Partial<Record<TimelineSemanticKey, JSX.CSSProperties>>

export interface TimelineItem {
  key?: string | number
  title?: JSX.Element
  content?: JSX.Element
  color?: TimelineColor
  icon?: JSX.Element
  placement?: TimelinePlacement
  loading?: boolean
  class?: string
  className?: string
  style?: JSX.CSSProperties
  classNames?: Omit<TimelineSemanticClassNames, 'root' | 'list'>
  styles?: Omit<TimelineSemanticStyles, 'root' | 'list'>
}

export interface TimelineProps extends Omit<
  JSX.OlHTMLAttributes<HTMLOListElement>,
  'children' | 'onChange'
> {
  items?: TimelineItem[]
  mode?: TimelineMode
  orientation?: TimelineOrientation
  variant?: TimelineVariant
  titleSpan?: number | string
  reverse?: boolean
  prefixCls?: string
  rootClassName?: string
  className?: string
  classNames?: TimelineSemanticClassNames
  styles?: TimelineSemanticStyles
}
