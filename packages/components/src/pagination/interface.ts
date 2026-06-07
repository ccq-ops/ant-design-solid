import type { JSX } from 'solid-js'
import type { SelectProps } from '../select'

export type PaginationPageSizeOption = string | number
export type PaginationAlign = 'start' | 'center' | 'end'
export type PaginationSize = 'large' | 'medium' | 'small'
export type PaginationItemType = 'page' | 'prev' | 'next'

export interface PaginationSimpleConfig {
  readOnly?: boolean
}

export interface PaginationQuickJumperConfig {
  goButton?: JSX.Element
}

export type PaginationShowSizeChangerConfig = Omit<
  SelectProps,
  'children' | 'value' | 'defaultValue' | 'options'
>

export type PaginationShowSizeChanger = boolean | PaginationShowSizeChangerConfig
export type PaginationSimple = boolean | PaginationSimpleConfig
export type PaginationShowQuickJumper = boolean | PaginationQuickJumperConfig

export interface PaginationSemanticClassNames {
  root?: string
  list?: string
  item?: string
  itemButton?: string
  prev?: string
  next?: string
  ellipsis?: string
  simplePager?: string
  input?: string
  select?: string
  quickJumper?: string
  totalText?: string
  goButton?: string
}

export interface PaginationSemanticStyles {
  root?: JSX.CSSProperties
  list?: JSX.CSSProperties
  item?: JSX.CSSProperties
  itemButton?: JSX.CSSProperties
  prev?: JSX.CSSProperties
  next?: JSX.CSSProperties
  ellipsis?: JSX.CSSProperties
  simplePager?: JSX.CSSProperties
  input?: JSX.CSSProperties
  select?: JSX.CSSProperties
  quickJumper?: JSX.CSSProperties
  totalText?: JSX.CSSProperties
  goButton?: JSX.CSSProperties
}

export interface PaginationProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'onChange'> {
  current?: number
  defaultCurrent?: number
  pageSize?: number
  defaultPageSize?: number
  total?: number
  disabled?: boolean
  simple?: PaginationSimple
  showSizeChanger?: PaginationShowSizeChanger
  pageSizeOptions?: PaginationPageSizeOption[]
  showQuickJumper?: PaginationShowQuickJumper
  hideOnSinglePage?: boolean
  showTotal?: (total: number, range: [number, number]) => JSX.Element
  align?: PaginationAlign
  responsive?: boolean
  showLessItems?: boolean
  showTitle?: boolean
  size?: PaginationSize
  totalBoundaryShowSizeChanger?: number
  itemRender?: (page: number, type: PaginationItemType, originalElement: JSX.Element) => JSX.Element
  classNames?: PaginationSemanticClassNames
  styles?: PaginationSemanticStyles
  onChange?: (page: number, pageSize: number) => void
  onShowSizeChange?: (current: number, size: number) => void
}
