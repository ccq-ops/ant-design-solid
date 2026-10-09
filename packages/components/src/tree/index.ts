import { DirectoryTree } from './directory-tree'
import { Tree as InternalTree, TreeNode } from './tree'
import { useTree } from './use-tree'

export const Tree = Object.assign(InternalTree, {
  DirectoryTree,
  TreeNode,
  useTree,
})

export { DirectoryTree, TreeNode, useTree }
export type {
  DirectoryTreeExpandAction,
  DirectoryTreeProps,
  TreeCheckInfo,
  TreeCheckedKeys,
  TreeDataNode,
  TreeDragEnterInfo,
  TreeDragInfo,
  TreeDraggable,
  TreeDropInfo,
  TreeExpandInfo,
  TreeFieldNames,
  TreeIcon,
  TreeKey,
  TreeLoadInfo,
  TreeNodeProps,
  TreeNodeRenderProps,
  TreeProps,
  TreeRef,
  TreeScrollToOptions,
  TreeSelectInfo,
  TreeSemanticClassNames,
  TreeSemanticSlot,
  TreeSemanticStyles,
  TreeShowLine,
} from './interface'
export type { TreeDataEntity, TreeInstance, TreeUseTreeConfig } from './use-tree'
