import type { JSX } from 'solid-js'

export type ListSize = 'default' | 'large' | 'small'

export interface ListProps<T = unknown> extends JSX.HTMLAttributes<HTMLDivElement> {
  dataSource?: T[]
  renderItem?: (item: T, index: number) => JSX.Element
  header?: JSX.Element
  footer?: JSX.Element
  bordered?: boolean
  split?: boolean
  size?: ListSize
  loading?: boolean
  emptyText?: JSX.Element
  children?: JSX.Element
}

export interface ListItemProps extends JSX.LiHTMLAttributes<HTMLLIElement> {
  actions?: JSX.Element[]
  extra?: JSX.Element
  children?: JSX.Element
}

export interface ListItemMetaProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title'> {
  avatar?: JSX.Element
  title?: JSX.Element
  description?: JSX.Element
  children?: JSX.Element
}
