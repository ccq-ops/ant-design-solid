import type { JSX } from 'solid-js'
import type { MotionComponentProps } from 'solid-motionone'
import type { OptionValue } from '../shared/options'

export type TreeKey = OptionValue

export interface TreeDataNode {
  title?: JSX.Element
  key?: TreeKey
  disabled?: boolean
  disableCheckbox?: boolean
  selectable?: boolean
  checkable?: boolean
  icon?: TreeIcon
  isLeaf?: boolean
  children?: TreeDataNode[]
  [key: string]: unknown
}

export interface TreeFieldNames {
  title?: string
  key?: string
  children?: string
}

export interface TreeNodeRenderProps {
  checked: boolean
  disabled: boolean
  disableCheckbox: boolean
  expanded: boolean
  halfChecked: boolean
  isLeaf: boolean
  key: TreeKey
  node: TreeDataNode
  selected: boolean
  title: JSX.Element
}

export type TreeSemanticSlot = 'root' | 'item' | 'itemIcon' | 'itemTitle' | 'itemSwitcher'
export type TreeSemanticInfo = { props: TreeProps }
export type TreeSemanticClassNames =
  | Partial<Record<TreeSemanticSlot, string>>
  | ((info: TreeSemanticInfo) => Partial<Record<TreeSemanticSlot, string>>)
export type TreeSemanticStyles =
  | Partial<Record<TreeSemanticSlot, JSX.CSSProperties>>
  | ((info: TreeSemanticInfo) => Partial<Record<TreeSemanticSlot, JSX.CSSProperties>>)

export interface TreeExpandInfo {
  expanded: boolean
  node: TreeDataNode
  event?: MouseEvent
}

export interface TreeSelectInfo {
  selected: boolean
  selectedNodes: TreeDataNode[]
  node: TreeDataNode
  event?: MouseEvent
}

export interface TreeCheckInfo {
  checked: boolean
  checkedNodes: TreeDataNode[]
  event?: MouseEvent
  halfCheckedKeys: TreeKey[]
  node: TreeDataNode
}

export interface TreeLoadInfo {
  event?: MouseEvent
  node: TreeDataNode
}

export interface TreeDragInfo {
  event: DragEvent
  node: TreeDataNode
}

export interface TreeDragEnterInfo extends TreeDragInfo {
  expandedKeys: TreeKey[]
}

export interface TreeDropInfo extends TreeDragInfo {
  dragNode?: TreeDataNode
  dragNodesKeys: TreeKey[]
  dropPosition: number
}

export interface TreeCheckedKeys {
  checked: TreeKey[]
  halfChecked: TreeKey[]
}

export type TreeIcon = JSX.Element | ((props: TreeNodeRenderProps) => JSX.Element)

export type TreeShowLine =
  | boolean
  | {
      showLeafIcon?: boolean | TreeIcon
    }

export type TreeDraggable =
  | boolean
  | ((node: TreeDataNode) => boolean)
  | {
      icon?: JSX.Element | false
      nodeDraggable?: (node: TreeDataNode) => boolean
    }

export type DirectoryTreeExpandAction = false | 'click' | 'doubleClick'

export interface TreeScrollToOptions {
  align?: 'top' | 'bottom' | 'auto'
  key: TreeKey
  offset?: number
}

export interface TreeRef {
  scrollTo: (options: TreeScrollToOptions) => void
}

export interface TreeNodeProps extends Omit<TreeDataNode, 'children'> {
  children?: JSX.Element
}

export interface TreeProps extends Omit<
  JSX.HTMLAttributes<HTMLUListElement>,
  | 'draggable'
  | 'onDragEnd'
  | 'onDragEnter'
  | 'onDragLeave'
  | 'onDragOver'
  | 'onDragStart'
  | 'onDrop'
  | 'onLoad'
  | 'ref'
  | 'onSelect'
> {
  allowDrop?: (info: { dropNode: TreeDataNode; dropPosition: number }) => boolean
  classNames?: TreeSemanticClassNames
  styles?: TreeSemanticStyles
  treeData?: TreeDataNode[]
  children?: JSX.Element
  expandedKeys?: TreeKey[]
  autoExpandParent?: boolean
  defaultExpandAll?: boolean
  defaultExpandParent?: boolean
  defaultExpandedKeys?: TreeKey[]
  selectedKeys?: TreeKey[]
  defaultSelectedKeys?: TreeKey[]
  checkedKeys?: TreeKey[] | TreeCheckedKeys
  defaultCheckedKeys?: TreeKey[]
  selectable?: boolean
  checkable?: boolean
  checkStrictly?: boolean
  disabled?: boolean
  draggable?: TreeDraggable
  fieldNames?: TreeFieldNames
  filterTreeNode?: (node: TreeDataNode) => boolean
  height?: number
  icon?: TreeIcon
  loadData?: (node: TreeDataNode) => Promise<unknown> | unknown
  loadedKeys?: TreeKey[]
  motion?: MotionComponentProps | false
  multiple?: boolean
  rootStyle?: JSX.CSSProperties
  showIcon?: boolean
  showLine?: TreeShowLine
  blockNode?: boolean
  prefixCls?: string
  switcherIcon?: TreeIcon
  switcherLoadingIcon?: JSX.Element
  titleRender?: (node: TreeDataNode) => JSX.Element
  virtual?: boolean
  expandAction?: DirectoryTreeExpandAction
  ref?: TreeRef | ((ref: TreeRef) => void)
  onExpand?: (expandedKeys: TreeKey[], info: TreeExpandInfo) => void
  onSelect?: (selectedKeys: TreeKey[], info: TreeSelectInfo) => void
  onCheck?: (checkedKeys: TreeKey[] | TreeCheckedKeys, info: TreeCheckInfo) => void
  onDoubleClick?: (event: MouseEvent, node: TreeDataNode) => void
  onDragEnd?: (info: TreeDragInfo) => void
  onDragEnter?: (info: TreeDragEnterInfo) => void
  onDragLeave?: (info: TreeDragInfo) => void
  onDragOver?: (info: TreeDragInfo) => void
  onDragStart?: (info: TreeDragInfo) => void
  onDrop?: (info: TreeDropInfo) => void
  onLoad?: (loadedKeys: TreeKey[], info: TreeLoadInfo) => void
  onRightClick?: (info: { event: MouseEvent; node: TreeDataNode }) => void
}

export interface DirectoryTreeProps extends TreeProps {
  expandAction?: DirectoryTreeExpandAction
}
