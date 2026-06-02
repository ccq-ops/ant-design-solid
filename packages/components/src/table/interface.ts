import type { JSX } from 'solid-js'
import type { ComponentSize } from '@ant-design-solid/theme'

export interface TableColumn<T extends Record<string, unknown> = Record<string, unknown>> {
  title?: JSX.Element
  dataIndex?: keyof T | string
  key?: string
  render?: (value: unknown, record: T, index: number) => JSX.Element
  width?: number | string
  align?: 'left' | 'center' | 'right'
  class?: string
  classList?: Record<string, boolean | undefined>
}

export interface TableProps<T extends Record<string, unknown> = Record<string, unknown>>
  extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'children'> {
  columns?: TableColumn<T>[]
  dataSource?: T[]
  rowKey?: keyof T | ((record: T, index: number) => string | number)
  loading?: boolean
  emptyText?: JSX.Element
  size?: ComponentSize
  bordered?: boolean
  showHeader?: boolean
  onRow?: (record: T, index: number) => JSX.HTMLAttributes<HTMLTableRowElement>
}
