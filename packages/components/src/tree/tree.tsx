import {
  CaretDownOutlined,
  CaretRightOutlined,
  HolderOutlined,
  LoadingOutlined,
} from '@ant-design-solid/icons'
import {
  For,
  Show,
  children,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  splitProps,
  useContext,
} from 'solid-js'
import type { Accessor } from 'solid-js'
import type { JSX } from 'solid-js'
import { createVirtualizer } from '@tanstack/solid-virtual'
import { Motion } from 'solid-motionone'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type {
  TreeCheckedKeys,
  TreeDataNode,
  TreeFieldNames,
  TreeIcon,
  TreeKey,
  TreeNodeProps,
  TreeNodeRenderProps,
  TreeProps,
  TreeRef,
} from './interface'
import { useTreeStyle } from './tree.style'

interface VisibleNode {
  key: TreeKey
  node: TreeDataNode
  depth: number
}

interface TreeNames {
  title: string
  key: string
  children: string
}

interface TreeEntity {
  children: TreeKey[]
  disabled: boolean
  disableCheckbox: boolean
  key: TreeKey
  node: TreeDataNode
  parent?: TreeKey
}

interface TreeNodeContextValue {
  enabled: true
}

interface TreeVirtualItem {
  index: number
  start: number
}

const TREE_NODE_MARK = Symbol('ant-design-solid-tree-node')
const TreeNodeContext = createContext<TreeNodeContextValue>()
const TREE_VIRTUAL_ITEM_HEIGHT = 24

type TreeNodeMarker = HTMLSpanElement & {
  [TREE_NODE_MARK]: Accessor<TreeDataNode>
}

function isTreeNodeMarker(node: unknown): node is TreeNodeMarker {
  return Boolean(node && typeof node === 'object' && TREE_NODE_MARK in node)
}

function getChildrenTreeData(childNodes: unknown[]): TreeDataNode[] {
  return childNodes.filter(isTreeNodeMarker).map((node) => node[TREE_NODE_MARK]())
}

export function TreeNode(props: TreeNodeProps) {
  const context = useContext(TreeNodeContext)
  if (!context) return null

  const resolvedChildren = children(() => (
    <TreeNodeContext.Provider value={context}>{props.children}</TreeNodeContext.Provider>
  ))
  const node = () => {
    const { children: _children, ...rest } = props
    const childNodes = getChildrenTreeData(resolvedChildren.toArray())
    return {
      ...rest,
      ...(childNodes.length ? { children: childNodes } : {}),
    }
  }

  return (
    <span
      ref={(element) => {
        ;(element as TreeNodeMarker)[TREE_NODE_MARK] = node
      }}
      style={{ display: 'none' }}
      aria-hidden="true"
    />
  )
}

function names(fieldNames?: TreeFieldNames): TreeNames {
  return {
    title: fieldNames?.title ?? 'title',
    key: fieldNames?.key ?? 'key',
    children: fieldNames?.children ?? 'children',
  }
}

function keyOf(node: TreeDataNode, namesInput: TreeNames): TreeKey {
  return node[namesInput.key] as TreeKey
}

function titleOf(node: TreeDataNode, namesInput: TreeNames) {
  return node[namesInput.title] as TreeDataNode['title']
}

function childrenOf(node: TreeDataNode, namesInput: TreeNames): TreeDataNode[] {
  return ((node[namesInput.children] as TreeDataNode[] | undefined) ?? []) as TreeDataNode[]
}

function includesKey(keys: TreeKey[], key?: TreeKey): boolean {
  if (key === undefined) return false
  return keys.some((item) => item === key)
}

function uniqueKeys(keys: TreeKey[]): TreeKey[] {
  return Array.from(new Set(keys))
}

function flattenVisible(
  nodes: TreeDataNode[],
  expandedKeys: TreeKey[],
  namesInput: TreeNames,
  previousItems: Map<TreeKey, VisibleNode> = new Map(),
  depth = 0,
): VisibleNode[] {
  const result: VisibleNode[] = []
  for (const node of nodes) {
    const key = keyOf(node, namesInput)
    const previousItem = previousItems.get(key)
    result.push(
      previousItem?.node === node && previousItem.depth === depth
        ? previousItem
        : { depth, key, node },
    )
    const children = childrenOf(node, namesInput)
    if (children.length && includesKey(expandedKeys, key))
      result.push(...flattenVisible(children, expandedKeys, namesInput, previousItems, depth + 1))
  }
  return result
}

function findNodes(nodes: TreeDataNode[], keys: TreeKey[], namesInput: TreeNames): TreeDataNode[] {
  const result: TreeDataNode[] = []
  for (const node of nodes) {
    if (includesKey(keys, keyOf(node, namesInput))) result.push(node)
    const children = childrenOf(node, namesInput)
    if (children.length) result.push(...findNodes(children, keys, namesInput))
  }
  return result
}

function createEntities(nodes: TreeDataNode[], namesInput: TreeNames) {
  const entities = new Map<TreeKey, TreeEntity>()
  const orderedKeys: TreeKey[] = []

  function walk(items: TreeDataNode[], parent?: TreeKey): void {
    for (const node of items) {
      const key = keyOf(node, namesInput)
      if (key === undefined) continue
      const children = childrenOf(node, namesInput)
      orderedKeys.push(key)
      entities.set(key, {
        children: children
          .map((child) => keyOf(child, namesInput))
          .filter((childKey): childKey is TreeKey => childKey !== undefined),
        disabled: Boolean(node.disabled),
        disableCheckbox: Boolean(node.disableCheckbox),
        key,
        node,
        parent,
      })
      walk(children, key)
    }
  }

  walk(nodes)
  return { entities, orderedKeys }
}

function withParentKeys(keys: TreeKey[], entities: Map<TreeKey, TreeEntity>): TreeKey[] {
  const next = new Set<TreeKey>(keys)
  for (const key of keys) {
    let parent = entities.get(key)?.parent
    while (parent !== undefined) {
      next.add(parent)
      parent = entities.get(parent)?.parent
    }
  }
  return Array.from(next)
}

function initialExpandedKeys(
  treeData: TreeDataNode[],
  namesInput: TreeNames,
  props: TreeProps,
): TreeKey[] {
  const { entities, orderedKeys } = createEntities(treeData, namesInput)
  if (props.defaultExpandAll) return orderedKeys
  const defaultKeys = props.defaultExpandedKeys ?? []
  if (props.defaultExpandParent ?? true) return withParentKeys(defaultKeys, entities)
  return defaultKeys
}

function normalizeCheckedKeys(keys?: TreeKey[] | TreeCheckedKeys): TreeCheckedKeys {
  if (!keys) return { checked: [], halfChecked: [] }
  if (Array.isArray(keys)) return { checked: keys, halfChecked: [] }
  return keys
}

function isCheckBlocked(entity?: TreeEntity): boolean {
  return !entity || entity.disabled || entity.disableCheckbox
}

function collectEnabledDescendantKeys(key: TreeKey, entities: Map<TreeKey, TreeEntity>): TreeKey[] {
  const entity = entities.get(key)
  if (!entity) return []
  const keys: TreeKey[] = []
  for (const childKey of entity.children) {
    const child = entities.get(childKey)
    if (isCheckBlocked(child)) continue
    keys.push(childKey, ...collectEnabledDescendantKeys(childKey, entities))
  }
  return keys
}

function collectAncestorKeys(key: TreeKey, entities: Map<TreeKey, TreeEntity>): TreeKey[] {
  const keys: TreeKey[] = []
  let parent = entities.get(key)?.parent
  while (parent !== undefined) {
    keys.push(parent)
    parent = entities.get(parent)?.parent
  }
  return keys
}

function getCheckState(
  checkedKeys: TreeKey[],
  entities: Map<TreeKey, TreeEntity>,
): TreeCheckedKeys {
  const checked = new Set(checkedKeys)
  const halfChecked = new Set<TreeKey>()

  const visit = (key: TreeKey): boolean | 'half' => {
    const entity = entities.get(key)
    if (!entity) return checked.has(key)

    const childStates = entity.children
      .map((childKey) => entities.get(childKey))
      .filter((child): child is TreeEntity => child !== undefined && !child.disabled)
      .map((child) => visit(child.key))

    const selfChecked = checked.has(key)
    if (!childStates.length) return selfChecked

    const allChildrenChecked = childStates.every((state) => state === true)
    const anyChildChecked = childStates.some((state) => state === true || state === 'half')

    if (allChildrenChecked && selfChecked) return true
    if (allChildrenChecked && !entity.disabled && !entity.disableCheckbox) {
      checked.add(key)
      return true
    }
    if (anyChildChecked || selfChecked) {
      halfChecked.add(key)
      return 'half'
    }
    return false
  }

  for (const [key, entity] of entities) {
    if (entity.parent === undefined) visit(key)
  }

  return {
    checked: Array.from(checked),
    halfChecked: Array.from(halfChecked).filter((key) => !checked.has(key)),
  }
}

function renderIcon(icon: TreeIcon | undefined, props: TreeNodeRenderProps) {
  if (!icon) return null
  return typeof icon === 'function' ? icon(props) : icon
}

function semanticClassNames(props: TreeProps) {
  return typeof props.classNames === 'function'
    ? props.classNames({ props })
    : (props.classNames ?? {})
}

function semanticStyles(props: TreeProps) {
  return typeof props.styles === 'function' ? props.styles({ props }) : (props.styles ?? {})
}

function defaultMotion() {
  return {
    transition: { duration: 0.16 },
  }
}

export function Tree(props: TreeProps) {
  const [local, rest] = splitProps(props, [
    'children',
    'treeData',
    'allowDrop',
    'classNames',
    'styles',
    'expandedKeys',
    'autoExpandParent',
    'defaultExpandAll',
    'defaultExpandParent',
    'defaultExpandedKeys',
    'selectedKeys',
    'defaultSelectedKeys',
    'checkedKeys',
    'defaultCheckedKeys',
    'selectable',
    'checkable',
    'checkStrictly',
    'disabled',
    'draggable',
    'fieldNames',
    'filterTreeNode',
    'height',
    'icon',
    'loadData',
    'loadedKeys',
    'motion',
    'multiple',
    'rootStyle',
    'showIcon',
    'showLine',
    'blockNode',
    'prefixCls',
    'switcherIcon',
    'switcherLoadingIcon',
    'titleRender',
    'virtual',
    'expandAction',
    'class',
    'onExpand',
    'onSelect',
    'onCheck',
    'onDoubleClick',
    'onDragEnd',
    'onDragEnter',
    'onDragLeave',
    'onDragOver',
    'onDragStart',
    'onDrop',
    'onLoad',
    'onRightClick',
    'ref',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-tree`
  const [, hashId] = useTreeStyle(prefixCls())
  let rootRef: HTMLUListElement | undefined
  const treeNodeContext: TreeNodeContextValue = { enabled: true }
  const resolvedChildren = children(() => (
    <Show when={local.treeData === undefined}>
      <TreeNodeContext.Provider value={treeNodeContext}>{local.children}</TreeNodeContext.Provider>
    </Show>
  ))
  const childrenTreeData = createMemo(() => getChildrenTreeData(resolvedChildren.toArray()))
  const treeData = () => local.treeData ?? childrenTreeData()
  const treeNames = createMemo(() => names(local.fieldNames))
  const entityInfo = createMemo(() => createEntities(treeData(), treeNames()))
  const mergedClassNames = createMemo(() => semanticClassNames(props))
  const mergedStyles = createMemo(() => semanticStyles(props))
  const [innerExpandedKeys, setInnerExpandedKeys] = createSignal<TreeKey[]>(
    initialExpandedKeys(treeData(), treeNames(), props),
  )
  const [innerSelectedKeys, setInnerSelectedKeys] = createSignal<TreeKey[]>(
    local.defaultSelectedKeys ?? [],
  )
  const [innerCheckedKeys, setInnerCheckedKeys] = createSignal<TreeKey[]>(
    local.defaultCheckedKeys ?? [],
  )
  const [innerLoadedKeys, setInnerLoadedKeys] = createSignal<TreeKey[]>([])
  const [loadingKeys, setLoadingKeys] = createSignal<TreeKey[]>([])
  const [dragNode, setDragNode] = createSignal<TreeDataNode>()

  const expandedKeys = () => {
    const keys = local.expandedKeys ?? innerExpandedKeys()
    if (local.autoExpandParent) return withParentKeys(keys, entityInfo().entities)
    return keys
  }
  const selectedKeys = () => local.selectedKeys ?? innerSelectedKeys()
  const loadedKeys = () => local.loadedKeys ?? innerLoadedKeys()
  const checkedState = () => {
    const checked = normalizeCheckedKeys(local.checkedKeys ?? innerCheckedKeys())
    if (local.checkStrictly) return checked
    return getCheckState(checked.checked, entityInfo().entities)
  }
  const selectable = () => local.selectable !== false
  const disabled = () => Boolean(local.disabled)
  const visibleNodes = createMemo<VisibleNode[]>((previousItems) => {
    const previousMap = new Map(previousItems.map((item) => [item.key, item]))
    return flattenVisible(treeData(), expandedKeys(), treeNames(), previousMap)
  }, [])
  const virtualEnabled = () => local.virtual !== false && local.height !== undefined
  const virtualizer = createVirtualizer<HTMLUListElement, HTMLLIElement>({
    get count() {
      return visibleNodes().length
    },
    getScrollElement: () => rootRef ?? null,
    estimateSize: () => TREE_VIRTUAL_ITEM_HEIGHT,
    getItemKey: (index) => String(visibleNodes()[index]?.key ?? index),
    overscan: 4,
    get enabled() {
      return virtualEnabled()
    },
    initialRect: {
      width: 0,
      height: local.height ?? 0,
    },
  })
  createEffect(() => {
    if (!virtualEnabled()) return
    visibleNodes()
    virtualizer.measure()
  })
  const virtualItems = createMemo<TreeVirtualItem[]>(() => {
    if (!virtualEnabled()) return []

    const visibleCount = visibleNodes().length
    const measuredItems = virtualizer.getVirtualItems().filter((item) => item.index < visibleCount)
    if (measuredItems.length) {
      return measuredItems.map((item) => ({
        index: item.index,
        start: item.start,
      }))
    }

    const height = local.height ?? 0
    const fallbackCount = Math.min(visibleCount, Math.ceil(height / TREE_VIRTUAL_ITEM_HEIGHT) + 8)
    return Array.from({ length: fallbackCount }, (_, index) => ({
      index,
      start: index * TREE_VIRTUAL_ITEM_HEIGHT,
    }))
  })
  const virtualTotalHeight = () => visibleNodes().length * TREE_VIRTUAL_ITEM_HEIGHT
  const rootStyle = (): JSX.CSSProperties => ({
    ...(local.height !== undefined ? { height: `${local.height}px`, overflow: 'auto' } : {}),
    ...(virtualEnabled() ? { position: 'relative' } : {}),
    ...local.rootStyle,
    ...(typeof rest.style === 'object' ? rest.style : {}),
  })
  const api: TreeRef = {
    scrollTo: ({ align = 'auto', key, offset = 0 }) => {
      const target = rootRef?.querySelector<HTMLElement>(`[data-tree-key="${String(key)}"]`)
      if (!target && virtualEnabled()) {
        const index = visibleNodes().findIndex((item) => item.key === key)
        if (index === -1) return
        const virtualAlign = align === 'top' ? 'start' : align === 'bottom' ? 'end' : 'auto'
        virtualizer.scrollToIndex(index, { align: virtualAlign })
        if (rootRef && offset) rootRef.scrollTop += offset
        return
      }
      if (!target) return
      const block = align === 'top' ? 'start' : align === 'bottom' ? 'end' : 'nearest'
      target.scrollIntoView({ block })
      if (rootRef && offset) rootRef.scrollTop += offset
    },
  }

  createEffect(() => {
    const ref = local.ref
    if (typeof ref === 'function') ref(api)
    else if (ref && typeof ref === 'object') Object.assign(ref, api)
  })

  function setExpanded(
    nextKeys: TreeKey[],
    node: TreeDataNode,
    expanded: boolean,
    event: MouseEvent,
  ): void {
    if (!('expandedKeys' in props)) setInnerExpandedKeys(nextKeys)
    local.onExpand?.(nextKeys, { event, expanded, node })
  }

  function toggleExpand(event: MouseEvent, node: TreeDataNode): void {
    event.stopPropagation()
    if (disabled() || node.disabled) return
    const key = keyOf(node, treeNames())
    const expanded = !includesKey(expandedKeys(), key)
    const nextKeys = expanded
      ? uniqueKeys([...expandedKeys(), key])
      : expandedKeys().filter((item) => item !== key)
    setExpanded(nextKeys, node, expanded, event)
    if (expanded) void loadNode(node, event)
  }

  function selectNode(event: MouseEvent, node: TreeDataNode): void {
    if (disabled() || node.disabled || !selectable() || node.selectable === false) return
    const key = keyOf(node, treeNames())
    const selected = !includesKey(selectedKeys(), key)
    const nextKeys = local.multiple
      ? selected
        ? uniqueKeys([...selectedKeys(), key])
        : selectedKeys().filter((item) => item !== key)
      : selected
        ? [key]
        : []
    if (!('selectedKeys' in props)) setInnerSelectedKeys(nextKeys)
    local.onSelect?.(nextKeys, {
      event,
      selected,
      selectedNodes: findNodes(treeData(), nextKeys, treeNames()),
      node,
    })
  }

  function shouldExpandByClick(event: MouseEvent, node: TreeDataNode): boolean {
    if (!childrenOf(node, treeNames()).length && !canAsyncExpand(node)) return false
    return local.expandAction === 'click' && event.detail === 1
  }

  function clickNode(event: MouseEvent, node: TreeDataNode): void {
    selectNode(event, node)
    if (shouldExpandByClick(event, node)) toggleExpand(event, node)
  }

  function checkNode(event: MouseEvent, node: TreeDataNode): void {
    event.stopPropagation()
    if (disabled() || node.disabled || node.disableCheckbox) return
    const key = keyOf(node, treeNames())
    const current = checkedState()
    const checked = !includesKey(current.checked, key)
    let nextState: TreeCheckedKeys

    if (local.checkStrictly) {
      nextState = {
        checked: checked
          ? uniqueKeys([...current.checked, key])
          : current.checked.filter((item) => item !== key),
        halfChecked: current.halfChecked,
      }
    } else {
      const affectedKeys = [key, ...collectEnabledDescendantKeys(key, entityInfo().entities)]
      const checkedSet = new Set(current.checked)
      for (const affectedKey of affectedKeys) {
        if (checked) checkedSet.add(affectedKey)
        else checkedSet.delete(affectedKey)
      }
      if (!checked) {
        for (const ancestorKey of collectAncestorKeys(key, entityInfo().entities)) {
          checkedSet.delete(ancestorKey)
        }
      }
      nextState = getCheckState(Array.from(checkedSet), entityInfo().entities)
    }

    if (!('checkedKeys' in props)) setInnerCheckedKeys(nextState.checked)
    const callbackKeys = local.checkStrictly ? nextState : nextState.checked
    local.onCheck?.(callbackKeys, {
      checked,
      checkedNodes: findNodes(treeData(), nextState.checked, treeNames()),
      event,
      halfCheckedKeys: nextState.halfChecked,
      node,
    })
  }

  function titleNode(node: TreeDataNode) {
    return local.titleRender?.(node) ?? titleOf(node, treeNames())
  }

  function nodeRenderProps(node: TreeDataNode): TreeNodeRenderProps {
    const key = keyOf(node, treeNames())
    const children = childrenOf(node, treeNames())
    const state = checkedState()
    return {
      checked: includesKey(state.checked, key),
      disabled: disabled() || Boolean(node.disabled),
      disableCheckbox: Boolean(node.disableCheckbox),
      expanded: includesKey(expandedKeys(), key),
      halfChecked: includesKey(state.halfChecked, key),
      isLeaf: node.isLeaf ?? children.length === 0,
      key,
      node,
      selected: includesKey(selectedKeys(), key),
      title: titleOf(node, treeNames()),
    }
  }

  function leafIcon(propsInput: TreeNodeRenderProps) {
    if (!local.showLine || local.showLine === true) return null
    const showLeafIcon = local.showLine.showLeafIcon
    if (showLeafIcon === false) return null
    if (showLeafIcon === true || showLeafIcon === undefined) return null
    return renderIcon(showLeafIcon, propsInput)
  }

  function canAsyncExpand(node: TreeDataNode): boolean {
    return Boolean(local.loadData && node.isLeaf === false)
  }

  function isExpandable(node: TreeDataNode): boolean {
    return childrenOf(node, treeNames()).length > 0 || canAsyncExpand(node)
  }

  function isLoading(key: TreeKey): boolean {
    return includesKey(loadingKeys(), key)
  }

  async function loadNode(node: TreeDataNode, event?: MouseEvent): Promise<void> {
    if (!local.loadData) return
    const key = keyOf(node, treeNames())
    if (includesKey(loadedKeys(), key) || includesKey(loadingKeys(), key)) return

    setLoadingKeys((keys) => uniqueKeys([...keys, key]))
    await local.loadData(node)
    const nextLoadedKeys = uniqueKeys([...loadedKeys(), key])
    if (!('loadedKeys' in props)) setInnerLoadedKeys(nextLoadedKeys)
    setLoadingKeys((keys) => keys.filter((item) => item !== key))
    local.onLoad?.(nextLoadedKeys, { event, node })
  }

  function draggable(node: TreeDataNode): boolean {
    if (!local.draggable || disabled() || node.disabled) return false
    if (typeof local.draggable === 'function') return local.draggable(node)
    if (typeof local.draggable === 'object') return local.draggable.nodeDraggable?.(node) ?? true
    return true
  }

  function dragIcon() {
    if (!local.draggable || local.draggable === true || typeof local.draggable === 'function')
      return <HolderOutlined />
    if (local.draggable.icon === false) return null
    return local.draggable.icon ?? <HolderOutlined />
  }

  function dragNodeKeys(node: TreeDataNode): TreeKey[] {
    return [
      keyOf(node, treeNames()),
      ...collectEnabledDescendantKeys(keyOf(node, treeNames()), entityInfo().entities),
    ]
  }

  function dragStart(event: DragEvent, node: TreeDataNode): void {
    setDragNode(node)
    local.onDragStart?.({ event, node })
  }

  function dragEnter(event: DragEvent, node: TreeDataNode): void {
    local.onDragEnter?.({ event, expandedKeys: expandedKeys(), node })
  }

  function dragOver(event: DragEvent, node: TreeDataNode): void {
    if (local.allowDrop?.({ dropNode: node, dropPosition: 0 }) === false) return
    event.preventDefault()
    local.onDragOver?.({ event, node })
  }

  function drop(event: DragEvent, node: TreeDataNode): void {
    if (local.allowDrop?.({ dropNode: node, dropPosition: 0 }) === false) return
    event.preventDefault()
    const draggedNode = dragNode()
    local.onDrop?.({
      dragNode: draggedNode,
      dragNodesKeys: draggedNode ? dragNodeKeys(draggedNode) : [],
      dropPosition: 0,
      event,
      node,
    })
  }

  function renderTreeNode(item: VisibleNode, virtualStart?: number): JSX.Element {
    const node = item.node
    const key = () => item.key
    const nodeDisabled = () => disabled() || Boolean(node.disabled)
    const expanded = () => includesKey(expandedKeys(), key())
    const selected = () => includesKey(selectedKeys(), key())
    const checked = () => includesKey(checkedState().checked, key())
    const halfChecked = () => includesKey(checkedState().halfChecked, key())
    const nodeCheckable = () => local.checkable && node.checkable !== false
    const renderProps = () => nodeRenderProps(node)
    const filtered = () => Boolean(local.filterTreeNode?.(node))
    const itemStyle = (): JSX.CSSProperties => ({
      'padding-left': `${8 + item.depth * 20}px`,
      ...(virtualStart !== undefined
        ? {
            position: 'absolute',
            top: `${virtualStart}px`,
            left: '0',
            right: '0',
          }
        : {}),
      ...mergedStyles().item,
    })
    return (
      <Motion.li
        {...(local.motion === false ? {} : { ...defaultMotion(), ...local.motion })}
        role="treeitem"
        data-tree-key={String(key())}
        aria-expanded={isExpandable(node) ? expanded() : undefined}
        aria-selected={selectable() ? selected() : undefined}
        aria-disabled={nodeDisabled()}
        draggable={draggable(node)}
        class={classNames(
          `${prefixCls()}-node`,
          local.motion !== false && `${prefixCls()}-motion-node`,
          mergedClassNames().item,
          selected() && `${prefixCls()}-node-selected`,
          nodeDisabled() && `${prefixCls()}-node-disabled`,
          filtered() && `${prefixCls()}-node-filtered`,
        )}
        style={itemStyle()}
        onClick={(event) => clickNode(event, node)}
        onDblClick={(event) => {
          local.onDoubleClick?.(event, node)
          if (local.expandAction === 'doubleClick') toggleExpand(event, node)
        }}
        onContextMenu={(event) => local.onRightClick?.({ event, node })}
        onDragEnd={(event) => local.onDragEnd?.({ event, node })}
        onDragEnter={(event) => dragEnter(event, node)}
        onDragLeave={(event) => local.onDragLeave?.({ event, node })}
        onDragOver={(event) => dragOver(event, node)}
        onDragStart={(event) => dragStart(event, node)}
        onDrop={(event) => drop(event, node)}
      >
        <Show
          when={isExpandable(node)}
          fallback={
            <span class={`${prefixCls()}-indent`} aria-hidden="true">
              {leafIcon(renderProps())}
            </span>
          }
        >
          <button
            type="button"
            aria-label={`${expanded() ? 'collapse' : 'expand'} ${titleOf(node, treeNames())}`}
            disabled={nodeDisabled()}
            class={classNames(
              `${prefixCls()}-switcher`,
              mergedClassNames().itemSwitcher,
              nodeDisabled() && `${prefixCls()}-switcher-disabled`,
            )}
            style={mergedStyles().itemSwitcher}
            onClick={(event) => toggleExpand(event, node)}
          >
            <Show
              when={isLoading(key())}
              fallback={
                renderIcon(local.switcherIcon, renderProps()) ??
                (expanded() ? <CaretDownOutlined /> : <CaretRightOutlined />)
              }
            >
              <span class={`${prefixCls()}-switcher-loading-icon`}>
                {local.switcherLoadingIcon ?? <LoadingOutlined />}
              </span>
            </Show>
          </button>
        </Show>
        <Show when={nodeCheckable()}>
          <input
            type="checkbox"
            aria-label={`check ${titleOf(node, treeNames())}`}
            class={`${prefixCls()}-checkbox`}
            checked={checked()}
            ref={(element) => {
              element.indeterminate = halfChecked()
            }}
            disabled={nodeDisabled() || node.disableCheckbox}
            onClick={(event) => checkNode(event, node)}
            onChange={() => undefined}
          />
        </Show>
        <Show when={draggable(node) && dragIcon()}>
          <span class={`${prefixCls()}-drag-icon`} aria-hidden="true">
            {dragIcon()}
          </span>
        </Show>
        <Show when={local.showIcon}>
          <span
            class={classNames(`${prefixCls()}-icon`, mergedClassNames().itemIcon)}
            style={mergedStyles().itemIcon}
          >
            {renderIcon(node.icon ?? local.icon, renderProps())}
          </span>
        </Show>
        <span
          class={classNames(`${prefixCls()}-title`, mergedClassNames().itemTitle)}
          style={mergedStyles().itemTitle}
        >
          {titleNode(node)}
        </span>
      </Motion.li>
    )
  }

  return (
    <ul
      {...rest}
      role="tree"
      data-virtual={virtualEnabled() ? 'true' : undefined}
      ref={(element) => {
        rootRef = element
      }}
      class={classNames(
        prefixCls(),
        mergedClassNames().root,
        local.showLine && `${prefixCls()}-line`,
        local.blockNode && `${prefixCls()}-block-node`,
        disabled() && `${prefixCls()}-disabled`,
        hashId(),
        local.class,
      )}
      style={rootStyle()}
    >
      <Show
        when={virtualEnabled()}
        fallback={<For each={visibleNodes()}>{(item) => renderTreeNode(item)}</For>}
      >
        <li
          aria-hidden="true"
          class={`${prefixCls()}-virtual-holder`}
          style={{
            height: `${virtualTotalHeight()}px`,
            'list-style': 'none',
            padding: '0',
            margin: '0',
            'pointer-events': 'none',
          }}
        />
        <For each={virtualItems()}>
          {(virtualItem) => {
            const item = () => visibleNodes()[virtualItem.index]
            return (
              <Show when={item()}>
                {(visibleItem) => renderTreeNode(visibleItem(), virtualItem.start)}
              </Show>
            )
          }}
        </For>
      </Show>
    </ul>
  )
}
