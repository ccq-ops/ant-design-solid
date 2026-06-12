import type { JSX } from 'solid-js'

export type TransferKey = string | number
export type TransferDirection = 'left' | 'right'
export type TransferStatus = '' | 'error' | 'warning'

export interface TransferRenderResultObject {
  label: JSX.Element
  value: string
}

export type TransferRenderResult = JSX.Element | TransferRenderResultObject | string | number | null

export interface TransferItem {
  key?: TransferKey
  title?: JSX.Element
  description?: JSX.Element
  disabled?: boolean
  [name: string]: unknown
}

export interface TransferListStyleInfo {
  direction: TransferDirection
}

export type TransferSelectAllLabel =
  | JSX.Element
  | ((info: { selectedCount: number; totalCount: number }) => JSX.Element)

export interface TransferLocale {
  titles?: JSX.Element[]
  notFoundContent?: JSX.Element | JSX.Element[]
  searchPlaceholder?: string
  itemUnit?: string
  itemsUnit?: string
  remove?: string
  selectAll?: string
  deselectAll?: string
  selectCurrent?: string
  selectInvert?: string
  removeAll?: string
  removeCurrent?: string
}

export interface TransferSearchOption {
  placeholder?: string
  defaultValue?: string
}

export type TransferPagination =
  | boolean
  | {
      pageSize?: number
      simple?: boolean
      showSizeChanger?: boolean
      showLessItems?: boolean
    }

export type TransferSemanticSlot =
  | 'root'
  | 'section'
  | 'header'
  | 'title'
  | 'body'
  | 'list'
  | 'item'
  | 'itemIcon'
  | 'itemContent'
  | 'footer'
  | 'actions'

export type TransferSectionSemanticSlot = Exclude<TransferSemanticSlot, 'root' | 'actions'>

export type TransferSemanticClassNames = Partial<Record<TransferSemanticSlot, string>> & {
  source?: Partial<Record<TransferSectionSemanticSlot, string>>
  target?: Partial<Record<TransferSectionSemanticSlot, string>>
}

export type TransferSemanticStyles = Partial<Record<TransferSemanticSlot, JSX.CSSProperties>> & {
  source?: Partial<Record<TransferSectionSemanticSlot, JSX.CSSProperties>>
  target?: Partial<Record<TransferSectionSemanticSlot, JSX.CSSProperties>>
}

export interface TransferListProps<RecordType extends TransferItem = TransferItem> {
  direction: TransferDirection
  items: RecordType[]
  filteredItems?: RecordType[]
  selectedKeys: TransferKey[]
  disabled?: boolean
  prefixCls?: string
  classNames?: TransferSemanticClassNames
  styles?: TransferSemanticStyles
  render?: (item: RecordType) => TransferRenderResult
  onItemSelect: (key: TransferKey, selected: boolean) => void
  onScroll?: JSX.EventHandler<HTMLUListElement, Event>
}

export interface TransferCustomListBodyProps<RecordType extends TransferItem = TransferItem> {
  direction: TransferDirection
  items: RecordType[]
  filteredItems: RecordType[]
  selectedKeys: TransferKey[]
  disabled: boolean
  onItemSelect: (key: TransferKey, selected: boolean) => void
  onItemSelectAll: (keys: TransferKey[], selected: boolean) => void
}

export interface TransferSearchProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> {
  onChange?: (value: string) => void
}

export interface TransferOperationProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  direction?: TransferDirection
}

export interface TransferProps<RecordType extends TransferItem = TransferItem> extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'onScroll' | 'children'
> {
  dataSource?: RecordType[]
  targetKeys?: TransferKey[]
  defaultTargetKeys?: TransferKey[]
  selectedKeys?: TransferKey[]
  defaultSelectedKeys?: TransferKey[]
  disabled?: boolean
  showSearch?: boolean | TransferSearchOption
  titles?: JSX.Element[]
  /** @deprecated Use actions instead. */
  operations?: JSX.Element[]
  actions?: JSX.Element[]
  render?: (item: RecordType) => TransferRenderResult
  filterOption?: (inputValue: string, item: RecordType, direction: TransferDirection) => boolean
  prefixCls?: string
  listStyle?: ((style: TransferListStyleInfo) => JSX.CSSProperties) | JSX.CSSProperties
  operationStyle?: JSX.CSSProperties
  classNames?: TransferSemanticClassNames
  styles?: TransferSemanticStyles
  locale?: Partial<TransferLocale>
  footer?: (
    props: TransferListProps<RecordType>,
    info?: { direction: TransferDirection },
  ) => JSX.Element
  rowKey?: (record: RecordType) => TransferKey
  children?: (props: TransferCustomListBodyProps<RecordType>) => JSX.Element
  showSelectAll?: boolean
  selectAllLabels?: TransferSelectAllLabel[]
  oneWay?: boolean
  pagination?: TransferPagination
  status?: TransferStatus
  selectionsIcon?: JSX.Element
  onChange?: (
    targetKeys: TransferKey[],
    direction: TransferDirection,
    moveKeys: TransferKey[],
  ) => void
  onSelectChange?: (sourceSelectedKeys: TransferKey[], targetSelectedKeys: TransferKey[]) => void
  onSearch?: (direction: TransferDirection, value: string) => void
  onScroll?: (direction: TransferDirection, e: Event) => void
}
