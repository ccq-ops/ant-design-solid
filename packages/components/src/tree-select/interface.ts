import type { JSX } from 'solid-js'
import type { OptionValue } from '../shared/options'
import type { TreeDataNode, TreeIcon, TreeKey, TreeShowLine } from '../tree/interface'

export type TreeSelectRawValue = OptionValue
export type TreeSelectShowCheckedStrategy = 'SHOW_ALL' | 'SHOW_PARENT' | 'SHOW_CHILD'
export type TreeSelectPlacement = 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'
export type TreeSelectSize = 'large' | 'middle' | 'small'
export type TreeSelectStatus = 'error' | 'warning'
export type TreeSelectVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'

export const SHOW_ALL = 'SHOW_ALL' satisfies TreeSelectShowCheckedStrategy
export const SHOW_PARENT = 'SHOW_PARENT' satisfies TreeSelectShowCheckedStrategy
export const SHOW_CHILD = 'SHOW_CHILD' satisfies TreeSelectShowCheckedStrategy

export interface TreeSelectLabeledValue {
  halfChecked?: TreeSelectRawValue[]
  label: JSX.Element
  value: TreeSelectRawValue
}

export type TreeSelectValue =
  | TreeSelectRawValue
  | TreeSelectRawValue[]
  | TreeSelectLabeledValue
  | TreeSelectLabeledValue[]
  | undefined

export interface TreeSelectNode {
  title?: JSX.Element
  value?: TreeSelectRawValue
  key?: TreeKey
  disabled?: boolean
  disableCheckbox?: boolean
  selectable?: boolean
  checkable?: boolean
  icon?: TreeIcon
  isLeaf?: boolean
  children?: TreeSelectNode[]
  [key: string]: unknown
}

export interface TreeSelectFieldNames {
  label?: string
  value?: string
  children?: string
}

export interface TreeSelectSimpleModeConfig {
  id?: string
  pId?: string
  rootPId?: TreeSelectRawValue
}

export interface TreeSelectSearchConfig {
  autoClearSearchValue?: boolean
  filterTreeNode?: boolean | ((inputValue: string, treeNode: TreeSelectNode) => boolean)
  searchValue?: string
  treeNodeFilterProp?: string
  onSearch?: (value: string) => void
}

export interface TreeSelectRef {
  blur: () => void
  focus: () => void
}

export interface TreeSelectChangeExtra {
  allCheckedNodes?: TreeSelectNode[]
  checked?: boolean
  checkedNodes?: TreeSelectNode[]
  halfCheckedKeys?: TreeSelectRawValue[]
  selected?: boolean
  triggerNode?: TreeSelectNode
  triggerValue?: TreeSelectRawValue
}

export interface TreeSelectSelectExtra {
  selected: boolean
}

export interface TreeSelectTagRenderProps {
  label: JSX.Element
  value: TreeSelectRawValue
  disabled: boolean
  closable: boolean
  onClose: () => void
}

export type TreeSelectSemanticSlot =
  | 'root'
  | 'selector'
  | 'prefix'
  | 'suffix'
  | 'content'
  | 'placeholder'
  | 'item'
  | 'itemContent'
  | 'itemRemove'
  | 'popup'
  | 'popup.root'
  | 'popup.item'
  | 'popup.itemTitle'
  | 'popup.itemSwitcher'

export type TreeSelectSemanticClassNames = Partial<Record<TreeSelectSemanticSlot, string>>
export type TreeSelectSemanticStyles = Partial<Record<TreeSelectSemanticSlot, JSX.CSSProperties>>

export interface NormalizedTreeSelectNode extends TreeSelectNode {
  children?: NormalizedTreeSelectNode[]
  key: TreeKey
  title: JSX.Element
  value: TreeSelectRawValue
}

export interface TreeSelectTreeEntity {
  children: TreeSelectTreeEntity[]
  key: TreeKey
  node: NormalizedTreeSelectNode
  parent?: TreeSelectTreeEntity
  value: TreeSelectRawValue
}

export interface TreeSelectProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'onSelect' | 'ref' | 'prefix'
> {
  ref?: TreeSelectRef | { current?: TreeSelectRef } | ((ref: TreeSelectRef) => void)
  treeData?: TreeSelectNode[]
  children?: JSX.Element
  value?: TreeSelectValue
  defaultValue?: TreeSelectValue
  open?: boolean
  defaultOpen?: boolean
  placeholder?: JSX.Element
  disabled?: boolean
  allowClear?: boolean | { clearIcon?: JSX.Element }
  autoClearSearchValue?: boolean
  bordered?: boolean
  classNames?: TreeSelectSemanticClassNames
  defaultExpandedKeys?: TreeSelectRawValue[]
  dropdownClassName?: string
  dropdownMatchSelectWidth?: boolean | number
  dropdownRender?: (originNode: JSX.Element) => JSX.Element
  dropdownStyle?: JSX.CSSProperties
  fieldNames?: TreeSelectFieldNames
  filterTreeNode?: boolean | ((inputValue: string, treeNode: TreeSelectNode) => boolean)
  labelInValue?: boolean
  listHeight?: number
  loadData?: (node: TreeSelectNode) => Promise<unknown> | unknown
  maxCount?: number
  maxTagCount?: number | 'responsive'
  maxTagPlaceholder?: JSX.Element | ((omittedValues: TreeSelectNode[]) => JSX.Element)
  maxTagTextLength?: number
  multiple?: boolean
  notFoundContent?: JSX.Element
  placement?: TreeSelectPlacement
  popupClassName?: string
  popupMatchSelectWidth?: boolean | number
  popupRender?: (originNode: JSX.Element) => JSX.Element
  prefix?: JSX.Element
  prefixCls?: string
  searchValue?: string
  showArrow?: boolean
  showCheckedStrategy?: TreeSelectShowCheckedStrategy
  showSearch?: boolean | TreeSelectSearchConfig
  size?: TreeSelectSize
  status?: TreeSelectStatus
  styles?: TreeSelectSemanticStyles
  suffixIcon?: JSX.Element | null
  switcherIcon?: TreeIcon
  tagRender?: (props: TreeSelectTagRenderProps) => JSX.Element
  treeCheckable?: boolean
  treeCheckStrictly?: boolean
  treeDataSimpleMode?: boolean | TreeSelectSimpleModeConfig
  treeDefaultExpandAll?: boolean
  treeDefaultExpandedKeys?: TreeSelectRawValue[]
  treeExpandAction?: false | 'click' | 'doubleClick'
  treeExpandedKeys?: TreeSelectRawValue[]
  treeIcon?: boolean
  treeLine?: TreeShowLine
  treeLoadedKeys?: TreeSelectRawValue[]
  treeNodeFilterProp?: string
  treeNodeLabelProp?: string
  treeTitleRender?: (nodeData: TreeSelectNode) => JSX.Element
  variant?: TreeSelectVariant
  virtual?: boolean
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement | ShadowRoot
  onChange?: (
    value: TreeSelectValue,
    label: JSX.Element | JSX.Element[] | undefined,
    extra: TreeSelectChangeExtra,
  ) => void
  onDropdownVisibleChange?: (open: boolean) => void
  onOpenChange?: (open: boolean) => void
  onPopupScroll?: JSX.EventHandler<HTMLDivElement, UIEvent>
  onSearch?: (value: string) => void
  onSelect?: (
    value: TreeSelectRawValue | TreeSelectLabeledValue,
    node: TreeSelectNode,
    extra: TreeSelectSelectExtra,
  ) => void
  onTreeExpand?: (expandedKeys: TreeSelectRawValue[]) => void
}

export interface TreeSelectNodeProps extends Omit<TreeSelectNode, 'children'> {
  children?: JSX.Element
}

export type TreeSelectTreeDataNode = TreeDataNode
