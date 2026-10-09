import { createVirtualizer } from '@tanstack/solid-virtual'
import { For, Show, createEffect, createMemo, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { getComponentToken } from '@solid-ant-design/theme'
import { useConfig, useToken } from '../config-provider'
import { classNames } from '../shared/class-names'
import type {
  ListyGroup,
  ListyKey,
  ListyProps,
  ListyRef,
  ListyRowKey,
  ListyScrollAlign,
  ListyScrollToConfig,
  ListySemanticClassNamesMap,
  ListySemanticStylesMap,
} from './interface'
import { useListyStyle } from './listy.style'

type ListyRow<T, K extends ListyKey> =
  | {
      type: 'group'
      taggedKey: string
      groupKey: K
      groupItems: T[]
    }
  | {
      type: 'item'
      taggedKey: string
      item: T
      index: number
      groupKey?: K
    }

function taggedKey(type: 'item' | 'group', key: ListyKey) {
  return `${type}:${String(key)}`
}

function itemKey<T>(rowKey: ListyRowKey<T>, item: T): ListyKey {
  return typeof rowKey === 'function' ? rowKey(item) : (item[rowKey] as ListyKey)
}

function flattenRows<T, K extends ListyKey>(
  items: T[],
  rowKey: ListyRowKey<T>,
  group?: ListyGroup<T, K>,
): ListyRow<T, K>[] {
  if (!group) {
    return items.map((item, index) => ({
      type: 'item',
      taggedKey: taggedKey('item', itemKey(rowKey, item)),
      item,
      index,
    }))
  }

  const groups = new Map<K, Array<{ item: T; index: number }>>()
  items.forEach((item, index) => {
    const key = group.key(item)
    const entries = groups.get(key)
    if (entries) entries.push({ item, index })
    else groups.set(key, [{ item, index }])
  })

  return Array.from(groups, ([groupKey, entries]) => {
    const groupItems = entries.map(({ item }) => item)
    return [
      {
        type: 'group' as const,
        taggedKey: taggedKey('group', groupKey),
        groupKey,
        groupItems,
      },
      ...entries.map(({ item, index }) => ({
        type: 'item' as const,
        taggedKey: taggedKey('item', itemKey(rowKey, item)),
        item,
        index,
        groupKey,
      })),
    ]
  }).flat()
}

function resolveClassNames<T, K extends ListyKey>(
  value: ListyProps<T, K>['classNames'],
  props: ListyProps<T, K>,
): ListySemanticClassNamesMap {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function resolveStyles<T, K extends ListyKey>(
  value: ListyProps<T, K>['styles'],
  props: ListyProps<T, K>,
): ListySemanticStylesMap {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function alignToVirtual(align: ListyScrollAlign | undefined) {
  if (align === 'top') return 'start' as const
  if (align === 'bottom') return 'end' as const
  return 'auto' as const
}

export function Listy<T, K extends ListyKey = ListyKey>(props: ListyProps<T, K>) {
  const [local] = splitProps(props, [
    'items',
    'sticky',
    'height',
    'group',
    'virtual',
    'prefixCls',
    'rowKey',
    'class',
    'classList',
    'rootClass',
    'rootClassName',
    'style',
    'tabIndex',
    'classNames',
    'styles',
    'onScroll',
    'itemRender',
    'ref',
  ])
  const config = useConfig()
  const token = useToken()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-listy`
  const [, hashId] = useListyStyle(prefixCls())
  const componentConfig = config.listy
  const items = () => local.items ?? []
  const rows = createMemo(() => flattenRows(items(), local.rowKey, local.group))
  const localClassNames = () => resolveClassNames(local.classNames, props)
  const configClassNames = () =>
    resolveClassNames(componentConfig().classNames as ListyProps<T, K>['classNames'], props)
  const semanticClassNames = () => ({ ...configClassNames(), ...localClassNames() })
  const localStyles = () => resolveStyles(local.styles, props)
  const configStyles = () =>
    resolveStyles(componentConfig().styles as ListyProps<T, K>['styles'], props)
  const semanticStyles = () => ({ ...configStyles(), ...localStyles() })
  const direction = () => config.direction()
  const virtualEnabled = () =>
    (local.virtual ?? config.virtual()) !== false && local.height !== undefined
  const itemHeight = () => {
    const t = token()
    const listy = getComponentToken('Listy', t)
    return t.fontHeight + listy.itemPaddingBlock * 2
  }
  const groupHeight = () => token().fontHeight + token().paddingXS * 2
  const estimatedRowSize = (index: number) =>
    rows()[index]?.type === 'group' ? groupHeight() : itemHeight()
  const estimatedRowStart = (index: number) => {
    let start = 0
    for (let current = 0; current < index; current += 1) start += estimatedRowSize(current)
    return start
  }
  const estimatedTotalSize = () =>
    rows().reduce((total, _row, index) => total + estimatedRowSize(index), 0)
  let rootRef: HTMLDivElement | undefined
  const [scrollTop, setScrollTop] = createSignal(0)

  const virtualizer = createVirtualizer<HTMLDivElement, HTMLDivElement>({
    get count() {
      return rows().length
    },
    getScrollElement: () => rootRef ?? null,
    estimateSize: estimatedRowSize,
    getItemKey: (index) => rows()[index]?.taggedKey ?? index,
    overscan: 6,
    get enabled() {
      return virtualEnabled()
    },
    initialRect: {
      width: 0,
      height: local.height ?? 0,
    },
  })

  createEffect(() => {
    rows()
    itemHeight()
    groupHeight()
    if (virtualEnabled()) virtualizer.measure()
  })

  const virtualRows = createMemo(() => {
    if (!virtualEnabled()) return []
    const measured = virtualizer.getVirtualItems().filter((item) => item.index < rows().length)
    if (measured.length) return measured
    const count = Math.min(
      rows().length,
      Math.ceil((local.height ?? 0) / Math.max(itemHeight(), 1)) + 12,
    )
    return Array.from({ length: count }, (_, index) => ({
      index,
      key: rows()[index]?.taggedKey ?? index,
      start: index * itemHeight(),
      size: itemHeight(),
      end: (index + 1) * itemHeight(),
      lane: 0,
    }))
  })

  const activeStickyGroup = createMemo(() => {
    if (!local.sticky || !local.group || !virtualEnabled()) return undefined
    const currentScrollTop = scrollTop()
    if (currentScrollTop <= 0) return undefined
    const firstIndex =
      virtualRows().find((row) => row.end > currentScrollTop)?.index ?? virtualRows()[0]?.index ?? 0
    for (let index = firstIndex; index >= 0; index -= 1) {
      const row = rows()[index]
      if (row?.type === 'group') return row
    }
    return undefined
  })

  const findRowIndex = (config: Exclude<ListyScrollToConfig, number | null | undefined>) => {
    if ('groupKey' in config) {
      return rows().findIndex((row) => row.taggedKey === taggedKey('group', config.groupKey))
    }
    if ('key' in config) {
      return rows().findIndex((row) => row.taggedKey === taggedKey('item', config.key))
    }
    return -1
  }

  const scrollTo: ListyRef['scrollTo'] = (config) => {
    if (!rootRef) return
    if (config === undefined || config === null || typeof config === 'number') {
      rootRef.scrollTop = config ?? 0
      return
    }
    if (!('key' in config) && !('groupKey' in config)) {
      rootRef.scrollTo({ top: config.top, left: config.left })
      return
    }

    const index = findRowIndex(config)
    if (index < 0) return
    const offset = config.offset ?? 0
    if (virtualEnabled()) {
      virtualizer.scrollToIndex(index, { align: alignToVirtual(config.align) })
      if (offset) queueMicrotask(() => rootRef && (rootRef.scrollTop += offset))
      return
    }

    const target = rootRef.querySelector<HTMLElement>(
      `[data-listy-key="${rows()[index]?.taggedKey}"]`,
    )
    if (!target) return
    const top =
      config.align === 'bottom'
        ? target.offsetTop - rootRef.clientHeight + target.offsetHeight
        : config.align === 'auto'
          ? rootRef.scrollTop
          : target.offsetTop
    rootRef.scrollTop = top + offset
  }

  const api: ListyRef = { scrollTo }
  createEffect(() => {
    if (typeof local.ref === 'function') local.ref(api)
    else if (local.ref) Object.assign(local.ref, api)
  })

  const handleScroll: JSX.EventHandler<HTMLDivElement, Event> = (event) => {
    setScrollTop(event.currentTarget.scrollTop)
    local.onScroll?.(event)
  }

  const renderGroupHeader = (row: Extract<ListyRow<T, K>, { type: 'group' }>, sticky = false) => (
    <div
      class={classNames(
        `${prefixCls()}-group-header`,
        sticky && `${prefixCls()}-group-header-sticky`,
        semanticClassNames().groupHeader,
      )}
      style={semanticStyles().groupHeader}
      data-listy-key={row.taggedKey}
    >
      {local.group?.title(row.groupKey, row.groupItems)}
    </div>
  )

  const renderItem = (row: Extract<ListyRow<T, K>, { type: 'item' }>) => (
    <div
      class={classNames(`${prefixCls()}-item`, semanticClassNames().item)}
      style={semanticStyles().item}
      data-listy-key={row.taggedKey}
    >
      {local.itemRender(row.item, row.index)}
    </div>
  )

  const rootStyle = (): JSX.CSSProperties => ({
    ...(local.height !== undefined
      ? virtualEnabled()
        ? { height: `${local.height}px`, 'overflow-y': 'auto' }
        : { 'max-height': `${local.height}px`, 'overflow-y': 'auto' }
      : {}),
    ...componentConfig().style,
    ...semanticStyles().root,
    ...local.style,
  })

  return (
    <div
      ref={(element) => {
        rootRef = element
      }}
      class={classNames(
        prefixCls(),
        direction() === 'rtl' && `${prefixCls()}-rtl`,
        componentConfig().class,
        semanticClassNames().root,
        local.rootClassName,
        local.rootClass,
        local.class,
        hashId(),
      )}
      classList={local.classList}
      style={rootStyle()}
      dir={direction()}
      tabIndex={local.tabIndex ?? (local.height !== undefined ? 0 : undefined)}
      onScroll={handleScroll}
    >
      <Show when={virtualEnabled()} fallback={<RawRows />}>
        <Show when={activeStickyGroup()}>
          {(row) => (
            <div class={`${prefixCls()}-group-header-holder`}>{renderGroupHeader(row(), true)}</div>
          )}
        </Show>
        <div
          class={`${prefixCls()}-virtual-holder`}
          style={{
            height: `${Math.max(virtualizer.getTotalSize(), estimatedTotalSize())}px`,
          }}
        >
          <For each={virtualRows()}>
            {(virtualRow) => {
              const row = () => rows()[virtualRow.index]
              return (
                <div
                  class={`${prefixCls()}-virtual-row`}
                  data-index={virtualRow.index}
                  style={{
                    transform: `translateY(${
                      virtualizer.getTotalSize() > 0
                        ? virtualRow.start
                        : estimatedRowStart(virtualRow.index)
                    }px)`,
                  }}
                >
                  {row()?.type === 'group'
                    ? renderGroupHeader(row() as Extract<ListyRow<T, K>, { type: 'group' }>)
                    : renderItem(row() as Extract<ListyRow<T, K>, { type: 'item' }>)}
                </div>
              )
            }}
          </For>
        </div>
      </Show>
    </div>
  )

  function RawRows() {
    if (!local.group) {
      return <For each={rows()}>{(row) => row.type === 'item' && renderItem(row)}</For>
    }

    return (
      <For each={Array.from(new Set(rows().flatMap((row) => row.groupKey ?? [])))}>
        {(groupKey) => {
          const groupRows = () => rows().filter((row) => row.groupKey === groupKey)
          const header = () =>
            rows().find(
              (row): row is Extract<ListyRow<T, K>, { type: 'group' }> =>
                row.type === 'group' && row.groupKey === groupKey,
            )
          return (
            <div class={`${prefixCls()}-group-section`}>
              <Show when={header()}>{(row) => renderGroupHeader(row(), local.sticky)}</Show>
              <For each={groupRows()}>{(row) => row.type === 'item' && renderItem(row)}</For>
            </div>
          )
        }}
      </For>
    )
  }
}
