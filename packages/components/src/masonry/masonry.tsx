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
import type { MasonryItem, MasonryItemKey, MasonryLayoutItem, MasonryProps } from './interface'
import { formatMasonryGap, resolveResponsiveValue } from './responsive'
import { useMasonryStyle } from './masonry.style'

const DEFAULT_COLUMNS = 4
const DEFAULT_GUTTER = 16

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

function distributeByHeight<T>(
  items: NormalizedItem<T>[],
  columnCount: number,
  heights: Map<MasonryItemKey, number>,
) {
  const hasPositiveHeight = items.some((item) => (heights.get(item.key) ?? 0) > 0)
  if (!hasPositiveHeight) return distributeRoundRobin(items, columnCount)

  const columns = Array.from({ length: columnCount }, () => [] as NormalizedItem<T>[])
  const columnHeights = Array.from({ length: columnCount }, () => 0)

  items.forEach((item) => {
    const height = heights.get(item.key)
    let targetColumn = 0
    for (let columnIndex = 1; columnIndex < columnHeights.length; columnIndex += 1) {
      if (columnHeights[columnIndex] < columnHeights[targetColumn]) targetColumn = columnIndex
    }
    columns[targetColumn].push(item)
    columnHeights[targetColumn] += height ?? 0
  })

  return columns
}

export function Masonry<T extends MasonryItem = MasonryItem>(props: MasonryProps<T>) {
  const [local] = splitProps(props, [
    'prefixCls',
    'class',
    'classList',
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
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-masonry`
  const [, hashId] = useMasonryStyle(prefixCls())
  const resolvedChildren = children(() => local.children)
  const [viewportWidth, setViewportWidth] = createSignal(getWindowWidth())
  const [measuredHeights, setMeasuredHeights] = createSignal(new Map<MasonryItemKey, number>())
  const observers = new Map<MasonryItemKey, ResizeObserver>()
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
    observers.clear()
  })

  const columnCount = () =>
    Math.max(1, Math.floor(resolveResponsiveValue(local.columns, DEFAULT_COLUMNS, viewportWidth())))
  const gutter = () =>
    formatMasonryGap(resolveResponsiveValue(local.gutter, DEFAULT_GUTTER, viewportWidth()))

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
      item: { key: index } as T,
      index,
      node,
    }))
  })

  const layoutColumns = createMemo(() => {
    const items = normalizedItems()
    const count = columnCount()
    const heights = measuredHeights()
    if (heights.size === 0) return distributeRoundRobin(items, count)
    return distributeByHeight(items, count, heights)
  })

  const updateHeight = (key: MasonryItemKey, element: HTMLElement) => {
    const height = element.offsetHeight
    setMeasuredHeights((previous) => {
      if (!local.fresh && previous.get(key) === height) return previous
      const next = new Map(previous)
      next.set(key, height)
      return next
    })
  }

  const registerItem = (key: MasonryItemKey, element: HTMLElement) => {
    updateHeight(key, element)

    if (typeof ResizeObserver === 'undefined' || observers.has(key)) return

    const observer = new ResizeObserver(() => updateHeight(key, element))
    observer.observe(element)
    observers.set(key, observer)
  }

  const renderItemNode = (item: NormalizedItem<T>) => {
    if (item.node !== undefined) return item.node

    const cached = renderedNodes.get(item.key)
    if (cached?.item === item.item && cached.itemRender === local.itemRender) return cached.node

    const node = local.itemRender?.(item.item, item.index)
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
            const height = heights.get(item.key) ?? 0
            total += height
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

        local.onLayoutChange?.({ columns: columnCount(), columnHeights, items: layoutItems })
      },
      { defer: false },
    ),
  )

  return (
    <div
      class={classNames(prefixCls(), hashId(), local.class)}
      classList={local.classList}
      style={mergeRootStyle(
        {
          '--ads-masonry-gutter': gutter(),
          '--ads-masonry-columns': columnCount(),
        },
        local.style,
      )}
    >
      {layoutColumns().map((column) => (
        <div class={`${prefixCls()}-column`}>
          {column.map((item) => (
            <div
              ref={(element) => registerItem(item.key, element)}
              class={classNames(`${prefixCls()}-item`, local.classNames?.item)}
              style={local.styles?.item}
            >
              {renderItemNode(item)}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
