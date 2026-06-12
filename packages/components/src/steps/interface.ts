import type { JSX } from 'solid-js'

export type StepsStatus = 'wait' | 'process' | 'finish' | 'error'
export type StepsDirection = 'horizontal' | 'vertical'
export type StepsSize = 'medium' | 'small' | 'default'
export type StepsType = 'default' | 'navigation' | 'dot' | 'inline' | 'panel'
export type StepsVariant = 'outlined' | 'filled'
export type StepsSemanticKey =
  | 'root'
  | 'list'
  | 'item'
  | 'itemTitle'
  | 'itemSubtitle'
  | 'itemIcon'
  | 'itemContent'
  | 'itemRail'
  | 'itemWrapper'
  | 'itemSection'
  | 'itemHeader'
export type StepsSemanticClassNames = Partial<Record<StepsSemanticKey, string>>
export type StepsSemanticStyles = Partial<Record<StepsSemanticKey, JSX.CSSProperties>>
export type StepsSemanticClassNamesConfig =
  | StepsSemanticClassNames
  | ((info: { props: StepsProps }) => StepsSemanticClassNames)
export type StepsSemanticStylesConfig =
  | StepsSemanticStyles
  | ((info: { props: StepsProps }) => StepsSemanticStyles)
export type StepsRootComponent = 'div' | 'ol'
export type StepsItemComponent = 'div' | 'li'
export type StepsIconRender = (
  originNode: JSX.Element,
  info: { index: number; active: boolean; item: StepItem },
) => JSX.Element
export type StepsProgressDotRender = (
  iconDot: JSX.Element,
  info: {
    index: number
    status: StepsStatus
    title?: JSX.Element
    description?: JSX.Element
    content?: JSX.Element
  },
) => JSX.Element

export interface StepItem {
  title?: JSX.Element
  subTitle?: JSX.Element
  content?: JSX.Element
  /** @deprecated Please use `content` instead. */
  description?: JSX.Element
  status?: StepsStatus
  icon?: JSX.Element
  disabled?: boolean
  onClick?: JSX.EventHandler<HTMLElement, MouseEvent>
  class?: string
  className?: string
  style?: JSX.CSSProperties
  classNames?: Omit<StepsSemanticClassNames, 'root' | 'list'>
  styles?: Omit<StepsSemanticStyles, 'root' | 'list'>
}

export interface StepsProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items?: StepItem[]
  current?: number
  initial?: number
  status?: StepsStatus
  /** @deprecated Please use `orientation` instead. */
  direction?: StepsDirection
  orientation?: StepsDirection
  /** @deprecated Please use `titlePlacement` instead. */
  labelPlacement?: StepsDirection
  titlePlacement?: StepsDirection
  size?: StepsSize
  type?: StepsType
  variant?: StepsVariant
  percent?: number
  /** @deprecated Please use `type="dot"` instead. */
  progressDot?: boolean | StepsProgressDotRender
  responsive?: boolean
  ellipsis?: boolean
  offset?: number
  prefixCls?: string
  className?: string
  rootClassName?: string
  classNames?: StepsSemanticClassNamesConfig
  styles?: StepsSemanticStylesConfig
  rootComponent?: StepsRootComponent
  itemComponent?: StepsItemComponent
  iconRender?: StepsIconRender
  onChange?: (current: number) => void
}
