import { createMemo } from 'solid-js'
import type { TreeDataNode, TreeFieldNames, TreeKey } from './interface'

export interface TreeUseTreeConfig {
  fieldNames?: TreeFieldNames
}

export interface TreeDataEntity<T extends TreeDataNode = TreeDataNode> {
  node: T
  nodes: T[]
  index: number
  key: TreeKey
  pos: string
  parent?: TreeDataEntity<T>
  children?: TreeDataEntity<T>[]
  level: number
}

export interface TreeInstance<T extends TreeDataNode = TreeDataNode> {
  getPath: (key: TreeKey) => TreeDataEntity<T>[]
}

function fieldNames(config?: TreeUseTreeConfig): Required<TreeFieldNames> {
  return {
    title: config?.fieldNames?.title ?? 'title',
    key: config?.fieldNames?.key ?? 'key',
    children: config?.fieldNames?.children ?? 'children',
  }
}

export function useTree<T extends TreeDataNode = TreeDataNode>(
  treeData: T[],
  config: TreeUseTreeConfig = {},
): TreeInstance<T> {
  const entities = createMemo(() => {
    const names = fieldNames(config)
    const result = new Map<TreeKey, TreeDataEntity<T>>()

    const walk = (
      nodes: T[],
      parent: TreeDataEntity<T> | undefined,
      parentNodes: T[],
      parentPos: string,
    ) => {
      nodes.forEach((node, index) => {
        const key = node[names.key] as TreeKey
        if (key === undefined) return
        const nodesPath = [...parentNodes, node]
        const entity: TreeDataEntity<T> = {
          node,
          nodes: nodesPath,
          index,
          key,
          pos: parentPos ? `${parentPos}-${index}` : String(index),
          parent,
          level: parent ? parent.level + 1 : 0,
        }
        result.set(key, entity)
        const children = (node[names.children] as T[] | undefined) ?? []
        if (children.length) {
          walk(children, entity, nodesPath, entity.pos)
          entity.children = children
            .map((child) => result.get(child[names.key] as TreeKey))
            .filter((child): child is TreeDataEntity<T> => Boolean(child))
        }
      })
    }

    walk(treeData, undefined, [], '')
    return result
  })

  return {
    getPath(key) {
      const path: TreeDataEntity<T>[] = []
      let entity = entities().get(key)
      while (entity) {
        path.unshift(entity)
        entity = entity.parent
      }
      return path
    },
  }
}
