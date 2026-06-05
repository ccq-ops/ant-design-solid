import { CaretDownOutlined, CaretRightOutlined } from '@ant-design-solid/icons'
import { For, Show, createMemo, createSignal, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { TreeDataNode, TreeKey, TreeProps } from './interface'
import { useTreeStyle } from './tree.style'

interface VisibleNode {
  node: TreeDataNode
  depth: number
}

function includesKey(keys: TreeKey[], key: TreeKey): boolean {
  return keys.some((item) => item === key)
}

function flattenVisible(nodes: TreeDataNode[], expandedKeys: TreeKey[], depth = 0): VisibleNode[] {
  const result: VisibleNode[] = []
  for (const node of nodes) {
    result.push({ node, depth })
    if (node.children?.length && includesKey(expandedKeys, node.key))
      result.push(...flattenVisible(node.children, expandedKeys, depth + 1))
  }
  return result
}

function findNodes(nodes: TreeDataNode[], keys: TreeKey[]): TreeDataNode[] {
  const result: TreeDataNode[] = []
  for (const node of nodes) {
    if (includesKey(keys, node.key)) result.push(node)
    if (node.children?.length) result.push(...findNodes(node.children, keys))
  }
  return result
}

export function Tree(props: TreeProps) {
  const [local, rest] = splitProps(props, [
    'treeData',
    'expandedKeys',
    'defaultExpandedKeys',
    'selectedKeys',
    'defaultSelectedKeys',
    'checkedKeys',
    'defaultCheckedKeys',
    'selectable',
    'checkable',
    'disabled',
    'showLine',
    'blockNode',
    'prefixCls',
    'class',
    'onExpand',
    'onSelect',
    'onCheck',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-tree`
  const [, hashId] = useTreeStyle(prefixCls())
  const [innerExpandedKeys, setInnerExpandedKeys] = createSignal<TreeKey[]>(
    local.defaultExpandedKeys ?? [],
  )
  const [innerSelectedKeys, setInnerSelectedKeys] = createSignal<TreeKey[]>(
    local.defaultSelectedKeys ?? [],
  )
  const [innerCheckedKeys, setInnerCheckedKeys] = createSignal<TreeKey[]>(
    local.defaultCheckedKeys ?? [],
  )

  const treeData = () => local.treeData ?? []
  const expandedKeys = () => local.expandedKeys ?? innerExpandedKeys()
  const selectedKeys = () => local.selectedKeys ?? innerSelectedKeys()
  const checkedKeys = () => local.checkedKeys ?? innerCheckedKeys()
  const selectable = () => local.selectable !== false
  const disabled = () => Boolean(local.disabled)
  const visibleNodes = createMemo(() => flattenVisible(treeData(), expandedKeys()))

  function setExpanded(nextKeys: TreeKey[], node: TreeDataNode, expanded: boolean): void {
    if (!('expandedKeys' in props)) setInnerExpandedKeys(nextKeys)
    local.onExpand?.(nextKeys, { expanded, node })
  }

  function toggleExpand(event: MouseEvent, node: TreeDataNode): void {
    event.stopPropagation()
    if (disabled() || node.disabled) return
    const expanded = !includesKey(expandedKeys(), node.key)
    const nextKeys = expanded
      ? [...expandedKeys(), node.key]
      : expandedKeys().filter((item) => item !== node.key)
    setExpanded(nextKeys, node, expanded)
  }

  function selectNode(node: TreeDataNode): void {
    if (disabled() || node.disabled || !selectable() || node.selectable === false) return
    const selected = !includesKey(selectedKeys(), node.key)
    const nextKeys = selected ? [node.key] : []
    if (!('selectedKeys' in props)) setInnerSelectedKeys(nextKeys)
    local.onSelect?.(nextKeys, { selected, selectedNodes: findNodes(treeData(), nextKeys), node })
  }

  function checkNode(event: MouseEvent, node: TreeDataNode): void {
    event.stopPropagation()
    if (disabled() || node.disabled || node.disableCheckbox) return
    const checked = !includesKey(checkedKeys(), node.key)
    const nextKeys = checked
      ? [...checkedKeys(), node.key]
      : checkedKeys().filter((item) => item !== node.key)
    if (!('checkedKeys' in props)) setInnerCheckedKeys(nextKeys)
    local.onCheck?.(nextKeys, { checked, checkedNodes: findNodes(treeData(), nextKeys), node })
  }

  return (
    <ul
      {...rest}
      role="tree"
      class={classNames(
        prefixCls(),
        local.showLine && `${prefixCls()}-line`,
        local.blockNode && `${prefixCls()}-block-node`,
        disabled() && `${prefixCls()}-disabled`,
        hashId(),
        local.class,
      )}
    >
      <For each={visibleNodes()}>
        {({ node, depth }) => {
          const nodeDisabled = () => disabled() || Boolean(node.disabled)
          const expanded = () => includesKey(expandedKeys(), node.key)
          const selected = () => includesKey(selectedKeys(), node.key)
          const checked = () => includesKey(checkedKeys(), node.key)
          const nodeCheckable = () => local.checkable && node.checkable !== false
          return (
            <li
              role="treeitem"
              aria-expanded={node.children?.length ? expanded() : undefined}
              aria-selected={selectable() ? selected() : undefined}
              aria-disabled={nodeDisabled()}
              class={classNames(
                `${prefixCls()}-node`,
                selected() && `${prefixCls()}-node-selected`,
                nodeDisabled() && `${prefixCls()}-node-disabled`,
              )}
              style={{ 'padding-left': `${8 + depth * 20}px` }}
              onClick={() => selectNode(node)}
            >
              <Show
                when={node.children?.length}
                fallback={<span class={`${prefixCls()}-indent`} aria-hidden="true" />}
              >
                <button
                  type="button"
                  aria-label={`${expanded() ? 'collapse' : 'expand'} ${node.title}`}
                  disabled={nodeDisabled()}
                  class={classNames(
                    `${prefixCls()}-switcher`,
                    nodeDisabled() && `${prefixCls()}-switcher-disabled`,
                  )}
                  onClick={(event) => toggleExpand(event, node)}
                >
                  {expanded() ? <CaretDownOutlined /> : <CaretRightOutlined />}
                </button>
              </Show>
              <Show when={nodeCheckable()}>
                <input
                  type="checkbox"
                  aria-label={`check ${node.title}`}
                  class={`${prefixCls()}-checkbox`}
                  checked={checked()}
                  disabled={nodeDisabled() || node.disableCheckbox}
                  onClick={(event) => checkNode(event, node)}
                  onChange={() => undefined}
                />
              </Show>
              <span class={`${prefixCls()}-title`}>{node.title}</span>
            </li>
          )
        }}
      </For>
    </ul>
  )
}
