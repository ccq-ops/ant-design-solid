import type { JSX } from 'solid-js'
import type { PaginationProps } from '../pagination'
import type { SpinProps } from '../spin'

export type ListSize = 'default' | 'large' | 'small'
export type ListItemLayout = 'horizontal' | 'vertical'
export type ListPaginationPosition = 'top' | 'bottom' | 'both'
export type ListColumnCount = number
export type ListBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'xxxl'

export interface ListGridType {
  gutter?: number | [number, number]
  column?: ListColumnCount
  xs?: ListColumnCount
  sm?: ListColumnCount
  md?: ListColumnCount
  lg?: ListColumnCount
  xl?: ListColumnCount
  xxl?: ListColumnCount
  xxxl?: ListColumnCount
}

export interface ListLocale {
  emptyText?: JSX.Element
}

export interface ListPaginationConfig extends PaginationProps {
  position?: ListPaginationPosition
}

export interface ListItemSemanticClassNames {
  actions?: string
  extra?: string
}

export interface ListItemSemanticStyles {
  actions?: JSX.CSSProperties
  extra?: JSX.CSSProperties
}

export interface ListProps<T = unknown> extends JSX.HTMLAttributes<HTMLDivElement> {
  prefixCls?: string
  rootClass?: string
  dataSource?: T[]
  renderItem?: (item: T, index: number) => JSX.Element
  header?: JSX.Element
  footer?: JSX.Element
  grid?: ListGridType
  itemLayout?: ListItemLayout
  bordered?: boolean
  split?: boolean
  size?: ListSize
  loading?: boolean | SpinProps
  loadMore?: JSX.Element
  locale?: ListLocale
  pagination?: boolean | ListPaginationConfig
  rowKey?: keyof T | ((item: T) => string | number)
  emptyText?: JSX.Element
  children?: JSX.Element
}

export interface ListItemProps extends JSX.LiHTMLAttributes<HTMLLIElement> {
  actions?: JSX.Element[]
  extra?: JSX.Element
  classNames?: ListItemSemanticClassNames
  styles?: ListItemSemanticStyles
  children?: JSX.Element
}

export interface ListItemMetaProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title'> {
  avatar?: JSX.Element
  title?: JSX.Element
  description?: JSX.Element
  children?: JSX.Element
}
