import type { JSX } from 'solid-js'
import type { OptionValue } from '../shared/options'

export type TreeKey = OptionValue

export interface TreeDataNode {
  title: JSX.Element
  key: TreeKey
  disabled?: boolean
  disableCheckbox?: boolean
  selectable?: boolean
  checkable?: boolean
  children?: TreeDataNode[]
}

export interface TreeExpandInfo {
  expanded: boolean
  node: TreeDataNode
}

export interface TreeSelectInfo {
  selected: boolean
  selectedNodes: TreeDataNode[]
  node: TreeDataNode
}

export interface TreeCheckInfo {
  checked: boolean
  checkedNodes: TreeDataNode[]
  node: TreeDataNode
}

export interface TreeProps extends Omit<JSX.HTMLAttributes<HTMLUListElement>, 'onSelect'> {
  treeData?: TreeDataNode[]
  expandedKeys?: TreeKey[]
  defaultExpandedKeys?: TreeKey[]
  selectedKeys?: TreeKey[]
  defaultSelectedKeys?: TreeKey[]
  checkedKeys?: TreeKey[]
  defaultCheckedKeys?: TreeKey[]
  selectable?: boolean
  checkable?: boolean
  disabled?: boolean
  showLine?: boolean
  blockNode?: boolean
  prefixCls?: string
  onExpand?: (expandedKeys: TreeKey[], info: TreeExpandInfo) => void
  onSelect?: (selectedKeys: TreeKey[], info: TreeSelectInfo) => void
  onCheck?: (checkedKeys: TreeKey[], info: TreeCheckInfo) => void
}
