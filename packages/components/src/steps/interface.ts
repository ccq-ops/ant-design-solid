import type { JSX } from 'solid-js'

export type StepsStatus = 'wait' | 'process' | 'finish' | 'error'
export type StepsDirection = 'horizontal' | 'vertical'
export type StepsSize = 'default' | 'small'
export type StepsType = 'default' | 'navigation' | 'dot'
export type StepsVariant = 'outlined' | 'filled'
export type StepsSemanticKey =
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
export type StepsSemanticClassNames = Partial<Record<StepsSemanticKey, string>>
export type StepsSemanticStyles = Partial<Record<StepsSemanticKey, JSX.CSSProperties>>
export type StepsRootComponent = 'div' | 'ol'
export type StepsItemComponent = 'div' | 'li'

export interface StepItem {
  title?: JSX.Element
  description?: JSX.Element
  status?: StepsStatus
  icon?: JSX.Element
  disabled?: boolean
  class?: string
  className?: string
  style?: JSX.CSSProperties
  classNames?: Omit<StepsSemanticClassNames, 'root' | 'list'>
  styles?: Omit<StepsSemanticStyles, 'root' | 'list'>
}

export interface StepsProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items?: StepItem[]
  current?: number
  status?: StepsStatus
  direction?: StepsDirection
  orientation?: StepsDirection
  size?: StepsSize
  type?: StepsType
  variant?: StepsVariant
  prefixCls?: string
  className?: string
  classNames?: StepsSemanticClassNames
  styles?: StepsSemanticStyles
  rootComponent?: StepsRootComponent
  itemComponent?: StepsItemComponent
  onChange?: (current: number) => void
}
