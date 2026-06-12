import { children, createContext, useContext } from 'solid-js'
import type { Accessor, JSX } from 'solid-js'
import type { TreeKey } from '../tree/interface'
import type {
  NormalizedTreeSelectNode,
  TreeSelectFieldNames,
  TreeSelectNode,
  TreeSelectNodeProps,
  TreeSelectRawValue,
  TreeSelectSimpleModeConfig,
  TreeSelectTreeEntity,
} from './interface'

interface TreeSelectNames {
  children: string
  label: string
  value: string
}

interface NormalizeOptions {
  fieldNames?: TreeSelectFieldNames
  treeDataSimpleMode?: boolean | TreeSelectSimpleModeConfig
}

interface TreeNodeContextValue {
  enabled: true
}

const TREE_SELECT_NODE_MARK = Symbol('ant-design-solid-tree-select-node')
const TreeSelectNodeContext = createContext<TreeNodeContextValue>()

type TreeSelectNodeMarker = HTMLSpanElement & {
  [TREE_SELECT_NODE_MARK]: Accessor<TreeSelectNode>
}

function isTreeSelectNodeMarker(node: unknown): node is TreeSelectNodeMarker {
  return Boolean(node && typeof node === 'object' && TREE_SELECT_NODE_MARK in node)
}

function getChildrenTreeData(childNodes: unknown[]): TreeSelectNode[] {
  return childNodes.filter(isTreeSelectNodeMarker).map((node) => node[TREE_SELECT_NODE_MARK]())
}

export function TreeSelectTreeNode(props: TreeSelectNodeProps) {
  const context = useContext(TreeSelectNodeContext)
  if (!context) return null

  const resolvedChildren = children(() => (
    <TreeSelectNodeContext.Provider value={context}>
      {props.children}
    </TreeSelectNodeContext.Provider>
  ))
  const node = () => {
    const { children: _children, ...rest } = props
    const childNodes = getChildrenTreeData(resolvedChildren.toArray())
    return {
      ...rest,
      ...(childNodes.length ? { children: childNodes } : {}),
    } as TreeSelectNode
  }

  return (
    <span
      ref={(element) => {
        ;(element as TreeSelectNodeMarker)[TREE_SELECT_NODE_MARK] = node
      }}
      style={{ display: 'none' }}
      aria-hidden="true"
    />
  )
}

export function collectTreeSelectChildren(childrenInput: JSX.Element): TreeSelectNode[] {
  const context: TreeNodeContextValue = { enabled: true }
  const resolvedChildren = children(() => (
    <TreeSelectNodeContext.Provider value={context}>{childrenInput}</TreeSelectNodeContext.Provider>
  ))
  return getChildrenTreeData(resolvedChildren.toArray())
}

export function treeSelectNames(fieldNames?: TreeSelectFieldNames): TreeSelectNames {
  return {
    children: fieldNames?.children ?? 'children',
    label: fieldNames?.label ?? 'title',
    value: fieldNames?.value ?? 'value',
  }
}

function simpleModeConfig(
  treeDataSimpleMode: boolean | TreeSelectSimpleModeConfig | undefined,
): Required<TreeSelectSimpleModeConfig> {
  const config = typeof treeDataSimpleMode === 'object' ? treeDataSimpleMode : {}
  return {
    id: config.id ?? 'id',
    pId: config.pId ?? 'pId',
    rootPId: config.rootPId ?? 0,
  }
}

function convertSimpleMode(
  treeData: TreeSelectNode[],
  configInput: boolean | TreeSelectSimpleModeConfig | undefined,
): TreeSelectNode[] {
  if (!configInput) return treeData
  const config = simpleModeConfig(configInput)
  const nodeMap = new Map<unknown, TreeSelectNode>()
  const roots: TreeSelectNode[] = []

  treeData.forEach((item) => {
    nodeMap.set(item[config.id], { ...item, children: [] })
  })

  treeData.forEach((item) => {
    const node = nodeMap.get(item[config.id])
    if (!node) return
    const parentId = item[config.pId]
    const parent = nodeMap.get(parentId)
    if (parent && parentId !== config.rootPId) {
      parent.children = [...(parent.children ?? []), node]
    } else {
      roots.push(node)
    }
  })

  function trimEmptyChildren(nodes: TreeSelectNode[]): TreeSelectNode[] {
    return nodes.map((node) => {
      const children = trimEmptyChildren(node.children ?? [])
      const next = { ...node }
      if (children.length) next.children = children
      else delete next.children
      return next
    })
  }

  return trimEmptyChildren(roots)
}

export function normalizeTreeData(
  treeData: TreeSelectNode[] | undefined,
  options: NormalizeOptions = {},
): NormalizedTreeSelectNode[] {
  const names = treeSelectNames(options.fieldNames)
  const source = convertSimpleMode(treeData ?? [], options.treeDataSimpleMode)

  function normalize(nodes: TreeSelectNode[]): NormalizedTreeSelectNode[] {
    return nodes.map((node) => {
      const value = node[names.value] as TreeSelectRawValue
      const title = node[names.label] as JSX.Element
      const rawChildren = (node[names.children] as TreeSelectNode[] | undefined) ?? []
      return {
        ...node,
        children: normalize(rawChildren),
        key: (node.key ?? value) as TreeKey,
        title,
        value,
      }
    })
  }

  return normalize(source)
}

export function buildTreeEntities(treeData: NormalizedTreeSelectNode[]): TreeSelectTreeEntity[] {
  const result: TreeSelectTreeEntity[] = []

  function walk(
    nodes: NormalizedTreeSelectNode[],
    parent?: TreeSelectTreeEntity,
  ): TreeSelectTreeEntity[] {
    return nodes.map((node) => {
      const entity: TreeSelectTreeEntity = {
        children: [],
        key: node.key,
        node,
        parent,
        value: node.value,
      }
      result.push(entity)
      entity.children = walk(node.children ?? [], entity)
      return entity
    })
  }

  walk(treeData)
  return result
}

export function findEntityByValue(
  entities: TreeSelectTreeEntity[],
  value: TreeSelectRawValue | undefined,
): TreeSelectTreeEntity | undefined {
  if (value === undefined) return undefined
  return entities.find((entity) => entity.value === value)
}

export function findEntityByKey(
  entities: TreeSelectTreeEntity[],
  key: TreeKey | undefined,
): TreeSelectTreeEntity | undefined {
  if (key === undefined) return undefined
  return entities.find((entity) => entity.key === key)
}

export function getEntityLabel(
  entity: TreeSelectTreeEntity | undefined,
  treeNodeLabelProp = 'title',
): JSX.Element | undefined {
  if (!entity) return undefined
  return entity.node[treeNodeLabelProp] as JSX.Element | undefined
}

export function entityPath(entity: TreeSelectTreeEntity | undefined): TreeSelectTreeEntity[] {
  const path: TreeSelectTreeEntity[] = []
  let current = entity
  while (current) {
    path.unshift(current)
    current = current.parent
  }
  return path
}
