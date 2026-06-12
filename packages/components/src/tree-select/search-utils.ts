import type { NormalizedTreeSelectNode, TreeSelectProps, TreeSelectSearchConfig } from './interface'

export interface NormalizedTreeSelectSearch {
  autoClearSearchValue?: boolean
  enabled: boolean
  filterTreeNode?: boolean | ((inputValue: string, treeNode: NormalizedTreeSelectNode) => boolean)
  searchValue?: string
  treeNodeFilterProp?: string
  onSearch?: (value: string) => void
}

export function normalizeTreeSelectSearch(
  props: Pick<
    TreeSelectProps,
    | 'autoClearSearchValue'
    | 'filterTreeNode'
    | 'multiple'
    | 'onSearch'
    | 'searchValue'
    | 'showSearch'
    | 'treeCheckable'
    | 'treeNodeFilterProp'
  >,
): NormalizedTreeSelectSearch {
  const objectConfig =
    typeof props.showSearch === 'object' ? (props.showSearch as TreeSelectSearchConfig) : {}
  return {
    autoClearSearchValue: props.autoClearSearchValue ?? objectConfig.autoClearSearchValue ?? true,
    enabled: Boolean(props.showSearch) || Boolean(props.multiple) || Boolean(props.treeCheckable),
    filterTreeNode: props.filterTreeNode ?? objectConfig.filterTreeNode,
    onSearch: props.onSearch ?? objectConfig.onSearch,
    searchValue: props.searchValue ?? objectConfig.searchValue,
    treeNodeFilterProp: props.treeNodeFilterProp ?? objectConfig.treeNodeFilterProp ?? 'value',
  }
}

function nodeText(value: unknown): string {
  if (value === undefined || value === null) return ''
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    return String(value)
  return ''
}

function defaultMatch(
  inputValue: string,
  node: NormalizedTreeSelectNode,
  treeNodeFilterProp: string,
): boolean {
  return nodeText(node[treeNodeFilterProp]).toLowerCase().includes(inputValue.toLowerCase())
}

function matchesNode(
  node: NormalizedTreeSelectNode,
  inputValue: string,
  config: Pick<NormalizedTreeSelectSearch, 'filterTreeNode' | 'treeNodeFilterProp'>,
): boolean {
  if (typeof config.filterTreeNode === 'function') return config.filterTreeNode(inputValue, node)
  if (config.filterTreeNode === false) return true
  return defaultMatch(inputValue, node, config.treeNodeFilterProp ?? 'value')
}

export function filterTreeDataBySearch(
  treeData: NormalizedTreeSelectNode[],
  searchValue: string,
  config: Pick<NormalizedTreeSelectSearch, 'enabled' | 'filterTreeNode' | 'treeNodeFilterProp'>,
): NormalizedTreeSelectNode[] {
  if (!config.enabled || !searchValue) return treeData

  function filter(nodes: NormalizedTreeSelectNode[]): NormalizedTreeSelectNode[] {
    const result: NormalizedTreeSelectNode[] = []
    for (const node of nodes) {
      const children = filter(node.children ?? [])
      if (matchesNode(node, searchValue, config) || children.length) {
        result.push({
          ...node,
          children,
        })
      }
    }
    return result
  }

  return filter(treeData)
}
