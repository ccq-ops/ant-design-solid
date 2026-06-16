import { FileOutlined, FolderOpenOutlined, FolderOutlined } from '@ant-design-solid/solid-icons'
import { createMemo, createSignal, splitProps } from 'solid-js'
import type { DirectoryTreeProps, TreeDataNode, TreeKey, TreeNodeRenderProps } from './interface'
import { Tree } from './tree'

function includesKey(keys: TreeKey[], key?: TreeKey): boolean {
  if (key === undefined) return false
  return keys.some((item) => item === key)
}

function flatten(nodes: TreeDataNode[]): TreeDataNode[] {
  const result: TreeDataNode[] = []
  for (const node of nodes) {
    result.push(node)
    if (node.children?.length) result.push(...flatten(node.children))
  }
  return result
}

function directoryIcon(props: TreeNodeRenderProps) {
  if (props.isLeaf) return <FileOutlined />
  return props.expanded ? <FolderOpenOutlined /> : <FolderOutlined />
}

export function DirectoryTree(props: DirectoryTreeProps) {
  const [local, rest] = splitProps(props, [
    'class',
    'expandAction',
    'multiple',
    'onSelect',
    'selectedKeys',
    'defaultSelectedKeys',
    'showIcon',
    'treeData',
  ])
  const [innerSelectedKeys, setInnerSelectedKeys] = createSignal<TreeKey[]>(
    local.defaultSelectedKeys ?? [],
  )
  const [lastSelectedKey, setLastSelectedKey] = createSignal<TreeKey>()
  const [cachedSelectedKeys, setCachedSelectedKeys] = createSignal<TreeKey[]>([])
  const selectedKeys = () => local.selectedKeys ?? innerSelectedKeys()
  const flatNodes = createMemo(() => flatten(local.treeData ?? []))

  function rangeKeys(startKey: TreeKey, endKey?: TreeKey): TreeKey[] {
    if (endKey === undefined) return [startKey]
    const nodes = flatNodes()
    const startIndex = nodes.findIndex((node) => node.key === startKey)
    const endIndex = nodes.findIndex((node) => node.key === endKey)
    if (startIndex < 0 || endIndex < 0) return [startKey]
    const from = Math.min(startIndex, endIndex)
    const to = Math.max(startIndex, endIndex)
    return nodes
      .slice(from, to + 1)
      .map((node) => node.key)
      .filter((key): key is TreeKey => key !== undefined)
  }

  const onSelect: DirectoryTreeProps['onSelect'] = (keys, info) => {
    const key = info.node.key
    if (key === undefined) return

    const event = info.event
    let nextKeys: TreeKey[]
    if (local.multiple && (event?.ctrlKey || event?.metaKey)) {
      nextKeys = keys
      setLastSelectedKey(key)
      setCachedSelectedKeys(nextKeys)
    } else if (local.multiple && event?.shiftKey) {
      nextKeys = Array.from(
        new Set([...cachedSelectedKeys(), ...rangeKeys(key, lastSelectedKey())]),
      )
    } else {
      nextKeys = [key]
      setLastSelectedKey(key)
      setCachedSelectedKeys(nextKeys)
    }

    if (!('selectedKeys' in props)) setInnerSelectedKeys(nextKeys)
    local.onSelect?.(nextKeys, {
      ...info,
      selected: true,
      selectedNodes: flatNodes().filter((node) => includesKey(nextKeys, node.key)),
    })
  }

  return (
    <Tree
      {...rest}
      blockNode
      class={local.class ? `ads-tree-directory ${local.class}` : 'ads-tree-directory'}
      expandAction={local.expandAction ?? 'click'}
      icon={directoryIcon}
      multiple={local.multiple}
      onSelect={onSelect}
      selectedKeys={selectedKeys()}
      showIcon={local.showIcon ?? true}
      treeData={local.treeData}
    />
  )
}
