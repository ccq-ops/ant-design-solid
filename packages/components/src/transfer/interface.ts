import type { JSX } from 'solid-js'

export interface TransferItem {
  key: string
  title: JSX.Element
  description?: JSX.Element
  disabled?: boolean
}

export type TransferDirection = 'left' | 'right'

export interface TransferProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  dataSource?: TransferItem[]
  targetKeys?: string[]
  defaultTargetKeys?: string[]
  selectedKeys?: string[]
  defaultSelectedKeys?: string[]
  disabled?: boolean
  showSearch?: boolean
  titles?: [JSX.Element, JSX.Element]
  operations?: [JSX.Element, JSX.Element]
  filterOption?: (inputValue: string, item: TransferItem) => boolean
  prefixCls?: string
  onChange?: (targetKeys: string[], direction: TransferDirection, moveKeys: string[]) => void
  onSelectChange?: (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => void
}
