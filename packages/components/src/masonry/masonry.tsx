import {
  children,
  createEffect,
  createMemo,
  createSignal,
  on,
  onCleanup,
  splitProps,
} from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type {
  MasonryItem,
  MasonryItemKey,
  MasonryLayoutItem,
  MasonryProps,
  MasonryRenderItem,
  MasonrySemanticClassNamesMap,
  MasonrySemanticStylesMap,
} from './interface'
import { resolveMasonryGutter, resolveResponsiveValue } from './responsive'
import { useMasonryStyle } from './masonry.style'

const DEFAULT_COLUMNS = 3

interface NormalizedItem<T> {
  key: MasonryItemKey
  item: T
  index: number
  node?: JSX.Element
}

function getWindowWidth() {
  return typeof window === 'undefined' ? 1024 : window.innerWidth
}

function mergeRootStyle(
  base: JSX.CSSProperties,
  style: MasonryProps['style'],
): JSX.CSSProperties | string {
  if (typeof style === 'string') {
    const declarations = Object.entries(base)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ')
    return `${declarations}; ${style}`
  }

  return { ...base, ...style }
}

function distributeRoundRobin<T>(items: NormalizedItem<T>[], columnCount: number) {
  const columns = Array.from({ length: columnCount }, () => [] as NormalizedItem<T>[])
  items.forEach((item, index) => {
    columns[index % columnCount].push(item)
  })
  return columns
}

function getNextColumnHeight(
  currentHeight: number,
  itemCount: number,
  itemHeight: number,
  gutterSize: number,
) {
  return currentHeight + (itemCount > 0 ? gutterSize : 0) + itemHeight
}

function distributeByHeight<T extends MasonryItem>(
  items: NormalizedItem<T>[],
  columnCount: number,
  heights: Map<MasonryItemKey, number>,
  gutterSize: number,
) {
  const hasPositiveHeight = items.some(
    (item) => (heights.get(item.key) ?? item.item.height ?? 0) > 0,
  )
  if (!hasPositiveHeight) return distributeRoundRobin(items, columnCount)

  const columns = Array.from({ length: columnCount }, () => [] as NormalizedItem<T>[])
  const columnHeights = Array.from({ length: columnCount }, () => 0)

  items.forEach((item) => {
    const height = heights.get(item.key) ?? item.item.height
    let targetColumn = 0
    for (let columnIndex = 1; columnIndex < columnHeights.length; columnIndex += 1) {
      if (columnHeights[columnIndex] < columnHeights[targetColumn]) targetColumn = columnIndex
    }
    const itemHeight = height ?? 0
    columnHeights[targetColumn] = getNextColumnHeight(
      columnHeights[targetColumn],
      columns[targetColumn].length,
      itemHeight,
      gutterSize,
    )
    columns[targetColumn].push(item)
  })

  return columns
}

function getExplicitColumn(column: number | undefined, columnCount: number) {
  if (column === undefined || !Number.isFinite(column)) return undefined
  const normalizedColumn = Math.floor(column)
  if (normalizedColumn < 0 || normalizedColumn >= columnCount) return undefined
  return normalizedColumn
}

function distributeItems<T extends MasonryItem>(
  items: NormalizedItem<T>[],
  columnCount: number,
  heights: Map<MasonryItemKey, number>,
  gutterSize: number,
) {
  const explicitItems = items.filter(
    (item) => getExplicitColumn(item.item.column, columnCount) !== undefined,
  )
  const automaticItems = items.filter(
    (item) => getExplicitColumn(item.item.column, columnCount) === undefined,
  )
  const columns = Array.from({ length: columnCount }, () => [] as NormalizedItem<T>[])
  const usedKeys = new Set<MasonryItemKey>()

  explicitItems.forEach((item) => {
    const column = getExplicitColumn(item.item.column, columnCount)
    if (column === undefined) return
    columns[column].push(item)
    usedKeys.add(item.key)
  })

  const automaticColumns =
    heights.size === 0
      ? distributeRoundRobin(automaticItems, columnCount)
      : distributeByHeight(automaticItems, columnCount, heights, gutterSize)

  automaticColumns.forEach((column, columnIndex) => {
    column.forEach((item) => {
      if (!usedKeys.has(item.key)) columns[columnIndex].push(item)
    })
  })

  return columns
}

function resolveSemanticClassNames<T extends MasonryItem>(
  value: MasonryProps<T>['classNames'] | undefined,
  props: MasonryProps<T>,
): MasonrySemanticClassNamesMap {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function resolveSemanticStyles<T extends MasonryItem>(
  value: MasonryProps<T>['styles'] | undefined,
  props: MasonryProps<T>,
): MasonrySemanticStylesMap {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

export function Masonry<T extends MasonryItem = MasonryItem>(props: MasonryProps<T>) {
  const [local] = splitProps(props, [
    'prefixCls',
    'class',
    'classList',
    'rootClass',
    'rootClassName',
    'style',
    'columns',
    'gutter',
    'items',
    'itemRender',
    'children',
    'fresh',
    'classNames',
    'styles',
    'onLayoutChange',
    'onLayoutInfoChange',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-masonry`
  const [, hashId] = useMasonryStyle(prefixCls())
  const resolvedChildren = children(() => local.children)
  const [viewportWidth, setViewportWidth] = createSignal(getWindowWidth())
  const [measuredHeights, setMeasuredHeights] = createSignal(new Map<MasonryItemKey, number>())
  const observers = new Map<MasonryItemKey, ResizeObserver>()
  const resizeFrameIds = new Map<MasonryItemKey, number>()
  const itemElements = new Map<MasonryItemKey, HTMLElement>()
  const renderedNodes = new Map<
    MasonryItemKey,
    { item: T; itemRender: MasonryProps<T>['itemRender']; node: JSX.Element }
  >()

  const handleResize = () => setViewportWidth(getWindowWidth())
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
    onCleanup(() => window.removeEventListener('resize', handleResize))
  }

  onCleanup(() => {
    observers.forEach((observer) => observer.disconnect())
    resizeFrameIds.forEach((frameId) => window.cancelAnimationFrame(frameId))
    observers.clear()
    resizeFrameIds.clear()
    itemElements.clear()
    renderedNodes.clear()
  })

  const columnCount = () =>
    Math.max(1, Math.floor(resolveResponsiveValue(local.columns, DEFAULT_COLUMNS, viewportWidth())))
  const gutter = () => resolveMasonryGutter(local.gutter, viewportWidth())
  const semanticClassNames = () => resolveSemanticClassNames(local.classNames, props)
  const semanticStyles = () => resolveSemanticStyles(local.styles, props)

  const normalizedItems = createMemo<NormalizedItem<T>[]>(() => {
    if (local.items) {
      return local.items.map((item, index) => ({
        key: item.key ?? index,
        item,
        index,
      }))
    }

    return resolvedChildren.toArray().map((node, index) => ({
      key: index,
      item: { key: index, data: undefined } as T,
      index,
      node,
    }))
  })

  const layoutColumns = createMemo(() => {
    const items = normalizedItems()
    const count = columnCount()
    const heights = measuredHeights()
    return distributeItems(items, count, heights, gutter()[2])
  })

  const updateHeight = (key: MasonryItemKey, element: HTMLElement, fallbackHeight?: number) => {
    const height = element.offsetHeight
    if (height === 0 && fallbackHeight !== undefined) return
    setMeasuredHeights((previous) => {
      if (previous.get(key) === height) return previous
      const next = new Map(previous)
      next.set(key, height)
      return next
    })
  }

  const scheduleHeightUpdate = (
    key: MasonryItemKey,
    element: HTMLElement,
    fallbackHeight?: number,
  ) => {
    if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
      updateHeight(key, element, fallbackHeight)
      return
    }

    const pendingFrameId = resizeFrameIds.get(key)
    if (pendingFrameId !== undefined) window.cancelAnimationFrame(pendingFrameId)

    const frameId = window.requestAnimationFrame(() => {
      resizeFrameIds.delete(key)
      updateHeight(key, element, fallbackHeight)
    })
    resizeFrameIds.set(key, frameId)
  }

  const cleanupRemovedItems = (activeKeys: Set<MasonryItemKey>) => {
    observers.forEach((observer, key) => {
      if (!activeKeys.has(key)) {
        observer.disconnect()
        observers.delete(key)
        const frameId = resizeFrameIds.get(key)
        if (frameId !== undefined) {
          window.cancelAnimationFrame(frameId)
          resizeFrameIds.delete(key)
        }
      }
    })
    itemElements.forEach((_, key) => {
      if (!activeKeys.has(key)) itemElements.delete(key)
    })
    renderedNodes.forEach((_, key) => {
      if (!activeKeys.has(key)) renderedNodes.delete(key)
    })
    setMeasuredHeights((previous) => {
      let changed = false
      const next = new Map(previous)
      next.forEach((_, key) => {
        if (!activeKeys.has(key)) {
          next.delete(key)
          changed = true
        }
      })
      return changed ? next : previous
    })
  }

  createEffect(() => {
    cleanupRemovedItems(new Set(normalizedItems().map((item) => item.key)))
  })

  const registerItem = (item: NormalizedItem<T>, element: HTMLElement) => {
    const { key } = item
    const previousElement = itemElements.get(key)
    updateHeight(key, element, item.item.height)

    if (!local.fresh) return

    if (previousElement === element && observers.has(key)) return

    observers.get(key)?.disconnect()
    observers.delete(key)
    itemElements.set(key, element)

    if (typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(() => scheduleHeightUpdate(key, element, item.item.height))
    observer.observe(element)
    observers.set(key, observer)
  }

  const renderItemNode = (item: NormalizedItem<T>) => {
    if (item.node !== undefined) return item.node

    const cached = renderedNodes.get(item.key)
    if (cached?.item === item.item && cached.itemRender === local.itemRender) return cached.node

    const layoutColumn = layoutColumns().findIndex((column) =>
      column.some((columnItem) => columnItem.key === item.key),
    )
    const renderInfo: MasonryRenderItem<T['data']> = {
      ...item.item,
      index: item.index,
      column: Math.max(0, layoutColumn),
    }
    const node = item.item.children ?? local.itemRender?.(renderInfo)
    renderedNodes.set(item.key, { item: item.item, itemRender: local.itemRender, node })
    return node
  }

  createEffect(
    on(
      [layoutColumns, measuredHeights],
      () => {
        const heights = measuredHeights()
        const layoutItems: MasonryLayoutItem<T>[] = []
        const columnHeights = layoutColumns().map((column, columnIndex) => {
          let total = 0
          column.forEach((item) => {
            const height = heights.get(item.key) ?? item.item.height ?? 0
            total = getNextColumnHeight(total, column.indexOf(item), height, gutter()[2])
            layoutItems.push({
              key: item.key,
              item: item.item,
              index: item.index,
              column: columnIndex,
              height,
            })
          })
          return total
        })

        local.onLayoutChange?.(
          layoutItems.map((item) => ({
            key: item.key,
            column: item.column,
          })),
        )
        local.onLayoutInfoChange?.({ columns: columnCount(), columnHeights, items: layoutItems })
      },
      { defer: false },
    ),
  )

  return (
    <div
      class={classNames(
        prefixCls(),
        hashId(),
        semanticClassNames().root,
        local.rootClass,
        local.rootClassName,
        local.class,
      )}
      classList={local.classList}
      style={mergeRootStyle(
        {
          '--ads-masonry-horizontal-gutter': gutter()[0],
          '--ads-masonry-vertical-gutter': gutter()[1],
          '--ads-masonry-columns': columnCount(),
          ...semanticStyles().root,
        },
        local.style,
      )}
    >
      {layoutColumns().map((column) => (
        <div class={`${prefixCls()}-column`}>
          {column.map((item) => (
            <div
              ref={(element) => registerItem(item, element)}
              class={classNames(`${prefixCls()}-item`, semanticClassNames().item)}
              style={semanticStyles().item}
            >
              {renderItemNode(item)}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
