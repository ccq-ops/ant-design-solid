import type { JSX } from 'solid-js'

export type PaginationPageSizeOption = string | number

export interface PaginationProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'onChange'> {
  current?: number
  defaultCurrent?: number
  pageSize?: number
  defaultPageSize?: number
  total?: number
  disabled?: boolean
  simple?: boolean
  showSizeChanger?: boolean
  pageSizeOptions?: PaginationPageSizeOption[]
  showQuickJumper?: boolean
  hideOnSinglePage?: boolean
  showTotal?: (total: number, range: [number, number]) => JSX.Element
  onChange?: (page: number, pageSize: number) => void
  onShowSizeChange?: (current: number, size: number) => void
}
