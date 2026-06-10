import type { JSX } from 'solid-js'
import type { ComponentSize } from '@ant-design-solid/theme'
import type { PaginationProps } from '../pagination'

export type TableKey = string | number
export type TableDataIndex<T extends object = object> =
  | keyof T
  | string
  | readonly (string | number)[]
export type TableSortOrder = 'ascend' | 'descend' | null
export type TableFilterValue = (TableKey | boolean)[]
export type TableCompareFn<T extends object = object> = (
  a: T,
  b: T,
  sortOrder?: TableSortOrder,
) => number

export interface TableColumnFilterItem {
  text: JSX.Element
  value: TableKey | boolean
  children?: TableColumnFilterItem[]
}

export interface TableColumnSorter<T extends object = object> {
  compare?: TableCompareFn<T>
  multiple?: number
}

export interface TablePaginationConfig extends Omit<PaginationProps, 'onChange' | 'total'> {
  total?: number
  placement?: Array<
    'topStart' | 'topCenter' | 'topEnd' | 'bottomStart' | 'bottomCenter' | 'bottomEnd' | 'none'
  >
  position?: Array<
    'topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight' | 'none'
  >
  onChange?: (page: number, pageSize: number) => void
}

export interface TableLocale {
  emptyText?: JSX.Element | (() => JSX.Element)
}

export interface TableLoadingConfig {
  spinning?: boolean
  tip?: JSX.Element
}

export interface TableScrollConfig {
  x?: string | number | true
  y?: string | number
  scrollToFirstRowOnChange?: boolean
}

export interface TableChangePagination {
  current: number
  pageSize: number
  total: number
}

export interface TableSorterResult<T extends object = object> {
  column?: TableColumn<T>
  order?: TableSortOrder
  field?: TableDataIndex<T>
  columnKey?: TableKey
}

export type TableChangeAction = 'paginate' | 'sort' | 'filter'
export type TableRowSelectionType = 'checkbox' | 'radio'
export type TableRowSelectionChangeType = 'all' | 'none' | 'invert' | 'single' | 'multiple'
export type TableRowSelectionPreset = 'all' | 'invert' | 'none'

export interface TableRowSelectionSelection {
  key: TableKey
  text: JSX.Element
  onSelect?: (changeableRowKeys: TableKey[]) => void
}

export interface TableCurrentDataSource<T extends object = object> {
  currentDataSource: T[]
  action: TableChangeAction
}

export interface TableRowSelection<T extends object = object> {
  type?: TableRowSelectionType
  selectedRowKeys?: TableKey[]
  defaultSelectedRowKeys?: TableKey[]
  columnTitle?: JSX.Element
  columnWidth?: string | number
  hideSelectAll?: boolean
  preserveSelectedRowKeys?: boolean
  selections?: boolean | Array<TableRowSelectionPreset | TableRowSelectionSelection>
  getTitleCheckboxProps?: () => Partial<Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type'>>
  getCheckboxProps?: (
    record: T,
  ) => Partial<Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'type' | 'checked'>>
  renderCell?: (checked: boolean, record: T, index: number, originNode: JSX.Element) => JSX.Element
  onChange?: (
    selectedRowKeys: TableKey[],
    selectedRows: T[],
    info: { type: TableRowSelectionChangeType },
  ) => void
  onSelect?: (record: T, selected: boolean, selectedRows: T[], nativeEvent: Event) => void
  onSelectAll?: (selected: boolean, selectedRows: T[], changeRows: T[]) => void
  onSelectInvert?: (selectedRowKeys: TableKey[]) => void
  onSelectNone?: () => void
}

export interface TableExpandableConfig<T extends object = object> {
  columnTitle?: JSX.Element
  columnWidth?: string | number
  defaultExpandAllRows?: boolean
  defaultExpandedRowKeys?: TableKey[]
  expandedRowKeys?: TableKey[]
  expandedRowRender?: (record: T, index: number, indent: number, expanded: boolean) => JSX.Element
  expandedRowClassName?: string | ((record: T, index: number, indent: number) => string)
  expandRowByClick?: boolean
  rowExpandable?: (record: T) => boolean
  onExpand?: (expanded: boolean, record: T) => void
  onExpandedRowsChange?: (expandedRows: TableKey[]) => void
}

export type TableBreakpoint = 'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs'
export type TableLayout = 'auto' | 'fixed'

export interface TableColumnEllipsis {
  showTitle?: boolean
}

export interface TableRenderCellProps extends JSX.HTMLAttributes<HTMLTableCellElement> {
  colSpan?: number
  rowSpan?: number
}

export interface TableRenderCellResult {
  children?: JSX.Element
  props?: TableRenderCellProps
}

export type TableRenderCellOutput = JSX.Element | TableRenderCellResult

export interface TableColumn<T extends object = object> {
  title?: JSX.Element | ((props: { sortOrder?: TableSortOrder }) => JSX.Element)
  children?: TableColumn<T>[]
  dataIndex?: TableDataIndex<T>
  key?: string
  render?: (value: unknown, record: T, index: number) => TableRenderCellOutput
  width?: number | string
  align?: 'left' | 'center' | 'right'
  class?: string
  className?: string
  classList?: Record<string, boolean | undefined>
  hidden?: boolean
  responsive?: TableBreakpoint[]
  ellipsis?: boolean | TableColumnEllipsis
  rowScope?: 'row' | 'rowgroup'
  sorter?: boolean | TableCompareFn<T> | TableColumnSorter<T>
  sortOrder?: TableSortOrder
  defaultSortOrder?: TableSortOrder
  sortDirections?: TableSortOrder[]
  filters?: TableColumnFilterItem[]
  filteredValue?: TableFilterValue | null
  defaultFilteredValue?: TableFilterValue | null
  filterMultiple?: boolean
  filterIcon?: JSX.Element | ((filtered: boolean) => JSX.Element)
  onFilter?: (value: TableKey | boolean, record: T) => boolean
  onCell?: (record: T, rowIndex: number) => JSX.HTMLAttributes<HTMLTableCellElement>
  onHeaderCell?: (column: TableColumn<T>) => JSX.HTMLAttributes<HTMLTableCellElement>
}

export interface TableProps<T extends object = object> extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'children' | 'onChange' | 'title'
> {
  columns?: TableColumn<T>[]
  dataSource?: T[]
  rowKey?: keyof T | string | ((record: T, index: number) => string | number)
  loading?: boolean | TableLoadingConfig
  emptyText?: JSX.Element
  locale?: TableLocale
  size?: ComponentSize
  bordered?: boolean
  showHeader?: boolean
  pagination?: false | TablePaginationConfig
  rowSelection?: TableRowSelection<T>
  expandable?: TableExpandableConfig<T>
  scroll?: TableScrollConfig
  virtual?: boolean
  summary?: (currentData: T[]) => JSX.Element
  title?: (currentData: T[]) => JSX.Element
  footer?: (currentData: T[]) => JSX.Element
  tableLayout?: TableLayout
  className?: string
  onRow?: (record: T, index: number) => JSX.HTMLAttributes<HTMLTableRowElement>
  rowClassName?: string | ((record: T, index: number) => string)
  onHeaderRow?: (
    columns: TableColumn<T>[],
    index: number,
  ) => JSX.HTMLAttributes<HTMLTableRowElement>
  onChange?: (
    pagination: TableChangePagination,
    filters: Record<string, TableFilterValue | null>,
    sorter: TableSorterResult<T>,
    extra: TableCurrentDataSource<T>,
  ) => void
}
