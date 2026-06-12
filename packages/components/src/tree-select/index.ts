import { TreeSelect as TreeSelectBase } from './tree-select'
import { SHOW_ALL, SHOW_CHILD, SHOW_PARENT } from './interface'
import { TreeSelectTreeNode } from './tree-data-utils'

export const TreeSelect = Object.assign(TreeSelectBase, {
  SHOW_ALL,
  SHOW_CHILD,
  SHOW_PARENT,
  TreeNode: TreeSelectTreeNode,
})

export { SHOW_ALL, SHOW_CHILD, SHOW_PARENT }
export type {
  TreeSelectChangeExtra,
  TreeSelectFieldNames,
  TreeSelectLabeledValue,
  TreeSelectNode,
  TreeSelectNodeProps,
  TreeSelectProps,
  TreeSelectRef,
  TreeSelectSearchConfig,
  TreeSelectSelectExtra,
  TreeSelectSemanticClassNames,
  TreeSelectSemanticStyles,
  TreeSelectTagRenderProps,
  TreeSelectValue,
} from './interface'
