import {
  For,
  Show,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  splitProps,
  useContext,
} from 'solid-js'
import type { JSX } from 'solid-js'
import { isServer } from 'solid-js/web'
import { useConfig } from '../config-provider'
import { Pagination } from '../pagination'
import { classNames } from '../shared/class-names'
import { Spin } from '../spin'
import type { SpinProps } from '../spin'
import type {
  ListBreakpoint,
  ListGridType,
  ListItemLayout,
  ListItemMetaProps,
  ListItemProps,
  ListPaginationConfig,
  ListProps,
} from './interface'
import { useListStyle } from './list.style'

const responsiveBreakpoints: Array<[ListBreakpoint, string]> = [
  ['xxxl', '(min-width: 1920px)'],
  ['xxl', '(min-width: 1600px)'],
  ['xl', '(min-width: 1200px)'],
  ['lg', '(min-width: 992px)'],
  ['md', '(min-width: 768px)'],
  ['sm', '(min-width: 576px)'],
  ['xs', '(max-width: 575px)'],
]

interface ListContextValue {
  prefixCls: () => string
  grid: () => ListGridType | undefined
  itemLayout: () => ListItemLayout
}

const ListContext = createContext<ListContextValue>()
const ListRowKeyContext = createContext<string | number | undefined>()
let currentRenderRowKey: string | number | undefined

function isPresent(value: unknown): boolean {
  return value !== undefined && value !== null && value !== false
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object')
}

function normalizeLoading(loading: ListProps['loading']): SpinProps {
  if (isObject(loading)) return loading as SpinProps
  return { spinning: Boolean(loading) }
}

function normalizeGutter(gutter: ListGridType['gutter']): [number, number] {
  if (Array.isArray(gutter)) return gutter
  return [gutter ?? 0, 0]
}

function hasResponsiveGrid(grid: ListGridType | undefined): boolean {
  if (!grid) return false
  return responsiveBreakpoints.some(([breakpoint]) => grid[breakpoint] !== undefined)
}

function canUseDom(): boolean {
  return !isServer && typeof window !== 'undefined' && typeof window.matchMedia === 'function'
}

function useCurrentBreakpoint(grid: () => ListGridType | undefined) {
  const [current, setCurrent] = createSignal<ListBreakpoint>()

  createEffect(() => {
    if (!hasResponsiveGrid(grid()) || !canUseDom()) {
      setCurrent(undefined)
      return
    }

    const update = () => {
      const matched = responsiveBreakpoints.find(([, query]) => window.matchMedia(query).matches)
      setCurrent(matched?.[0])
    }
    const matchers = responsiveBreakpoints.map(([, query]) => window.matchMedia(query))

    update()
    for (const matcher of matchers) {
      matcher.addEventListener?.('change', update)
      matcher.addListener?.(update)
    }

    onCleanup(() => {
      for (const matcher of matchers) {
        matcher.removeEventListener?.('change', update)
        matcher.removeListener?.(update)
      }
    })
  })

  return current
}

function getColumnCount(grid: ListGridType | undefined, breakpoint: ListBreakpoint | undefined) {
  if (!grid) return undefined
  return breakpoint && grid[breakpoint] ? grid[breakpoint] : grid.column
}

function getRowKey<T>(item: T, rowKey: ListProps<T>['rowKey']): string | number | undefined {
  if (typeof rowKey === 'function') return rowKey(item)
  if (rowKey) return item[rowKey] as string | number | undefined
  if (isObject(item) && 'key' in item) return item.key as string | number | undefined
  return undefined
}

export function ListItemMeta(props: ListItemMetaProps) {
  const [local, rest] = splitProps(props, [
    'avatar',
    'title',
    'description',
    'children',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const context = useContext(ListContext)
  const prefixCls = () =>
    context ? `${context.prefixCls()}-item-meta` : `${config.prefixCls()}-list-item-meta`

  return (
    <div
      {...rest}
      class={classNames(prefixCls(), local.class)}
      classList={local.classList}
      style={local.style}
    >
      <Show when={isPresent(local.avatar)}>
        <div class={`${prefixCls()}-avatar`}>{local.avatar}</div>
      </Show>
      <div class={`${prefixCls()}-content`}>
        <Show when={isPresent(local.title)}>
          <div class={`${prefixCls()}-title`}>{local.title}</div>
        </Show>
        <Show when={isPresent(local.description)}>
          <div class={`${prefixCls()}-description`}>{local.description}</div>
        </Show>
        {local.children}
      </div>
    </div>
  )
}

export function ListItem(props: ListItemProps) {
  const [local, rest] = splitProps(props, [
    'actions',
    'extra',
    'classNames',
    'styles',
    'children',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const context = useContext(ListContext)
  const rowKey = useContext(ListRowKeyContext) ?? currentRenderRowKey
  const prefixCls = () =>
    context ? `${context.prefixCls()}-item` : `${config.prefixCls()}-list-item`
  const itemLayout = () => context?.itemLayout() ?? 'horizontal'
  const grid = () => context?.grid()
  const actions = () => local.actions ?? []
  const hasActions = () => actions().length > 0
  const actionsContent = () => (
    <Show when={hasActions()}>
      <ul
        class={classNames(`${prefixCls()}-actions`, local.classNames?.actions)}
        style={local.styles?.actions}
      >
        <For each={actions()}>
          {(action, index) => (
            <li class={`${prefixCls()}-action`}>
              {action}
              <Show when={index() < actions().length - 1}>
                <em class={`${prefixCls()}-action-split`} aria-hidden="true" />
              </Show>
            </li>
          )}
        </For>
      </ul>
    </Show>
  )
  const extraContent = () => (
    <Show when={isPresent(local.extra)}>
      <div
        class={classNames(`${prefixCls()}-extra`, local.classNames?.extra)}
        style={local.styles?.extra}
      >
        {local.extra}
      </div>
    </Show>
  )
  const elementProps = () => ({
    ...rest,
    'data-row-key': rowKey,
    class: classNames(
      prefixCls(),
      itemLayout() === 'vertical' && `${prefixCls()}-vertical`,
      grid() && `${prefixCls()}-grid`,
      local.class,
    ),
    classList: local.classList,
    style: local.style,
  })

  return (
    <li {...elementProps()}>
      <Show
        when={itemLayout() === 'vertical'}
        fallback={
          <>
            <div class={`${prefixCls()}-main`}>{local.children}</div>
            {actionsContent()}
            {extraContent()}
          </>
        }
      >
        <div class={`${prefixCls()}-main`}>
          {local.children}
          {actionsContent()}
        </div>
        {extraContent()}
      </Show>
    </li>
  )
}

export function ListRoot<T = unknown>(props: ListProps<T>) {
  const [local, rest] = splitProps(props, [
    'prefixCls',
    'rootClass',
    'dataSource',
    'renderItem',
    'header',
    'footer',
    'grid',
    'itemLayout',
    'bordered',
    'split',
    'size',
    'loading',
    'loadMore',
    'locale',
    'pagination',
    'rowKey',
    'emptyText',
    'children',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-list`
  const [, hashId] = useListStyle(prefixCls())
  const [paginationCurrent, setPaginationCurrent] = createSignal(1)
  const [paginationSize, setPaginationSize] = createSignal(10)
  const currentBreakpoint = useCurrentBreakpoint(() => local.grid)
  const data = () => local.dataSource ?? []
  const hasDataSource = () => local.dataSource !== undefined
  const split = () => local.split ?? true
  const size = () => local.size ?? 'default'
  const itemLayout = () => local.itemLayout ?? 'horizontal'
  const hasHeader = () => isPresent(local.header)
  const hasFooter = () => isPresent(local.footer)
  const hasLoadMore = () => isPresent(local.loadMore)
  const pagination = () => local.pagination
  const paginationConfig = createMemo<ListPaginationConfig>(() =>
    pagination() && isObject(pagination()) ? (pagination() as ListPaginationConfig) : {},
  )
  const mergedPageSize = () => paginationConfig().pageSize ?? paginationSize()
  const mergedCurrent = () => paginationConfig().current ?? paginationCurrent()
  const pagedData = () => {
    if (!pagination()) return data()
    const pageSize = mergedPageSize()
    const current = Math.max(1, mergedCurrent())
    const start = (current - 1) * pageSize
    return data().slice(start, start + pageSize)
  }
  const hasDataItems = () => hasDataSource() && pagedData().length > 0 && Boolean(local.renderItem)
  const hasChildren = () => !hasDataSource() && isPresent(local.children)
  const loadingProps = () => normalizeLoading(local.loading)
  const isLoading = () => Boolean(loadingProps().spinning)
  const isEmpty = () => !hasDataItems() && !hasChildren()
  const emptyText = () => local.locale?.emptyText ?? local.emptyText ?? 'No Data'
  const columnCount = () => getColumnCount(local.grid, currentBreakpoint())
  const gutter = () => normalizeGutter(local.grid?.gutter)
  const columnStyle = (): JSX.CSSProperties => {
    const count = columnCount()
    if (!count) return {}
    const width = `${100 / count}%`
    return { width, 'max-width': width }
  }
  const contextValue: ListContextValue = {
    prefixCls,
    grid: () => local.grid,
    itemLayout,
  }
  const renderPagination = (position: 'top' | 'bottom') => (
    <Show
      when={
        pagination() &&
        (paginationConfig().position === position ||
          paginationConfig().position === 'both' ||
          (!paginationConfig().position && position === 'bottom'))
      }
    >
      <div class={`${prefixCls()}-pagination`}>
        <Pagination
          align="end"
          {...paginationConfig()}
          total={paginationConfig().total ?? data().length}
          current={mergedCurrent()}
          pageSize={mergedPageSize()}
          onChange={(page, pageSize) => {
            if (paginationConfig().current === undefined) setPaginationCurrent(page)
            if (paginationConfig().pageSize === undefined) setPaginationSize(pageSize)
            paginationConfig().onChange?.(page, pageSize)
          }}
          onShowSizeChange={(page, pageSize) => {
            if (paginationConfig().current === undefined) setPaginationCurrent(page)
            if (paginationConfig().pageSize === undefined) setPaginationSize(pageSize)
            paginationConfig().onShowSizeChange?.(page, pageSize)
          }}
        />
      </div>
    </Show>
  )
  const renderDataItem = (item: T, index: number) => {
    const rowKey = getRowKey(item, local.rowKey)
    const previousRowKey = currentRenderRowKey
    currentRenderRowKey = rowKey
    const rendered = local.renderItem?.(item, index)
    currentRenderRowKey = previousRowKey
    if (local.grid) {
      return (
        <div
          class={`${prefixCls()}-grid-column`}
          data-row-key={rowKey}
          style={{
            ...columnStyle(),
            'padding-left': gutter()[0] ? `${gutter()[0] / 2}px` : undefined,
            'padding-right': gutter()[0] ? `${gutter()[0] / 2}px` : undefined,
            'margin-bottom': gutter()[1] ? `${gutter()[1]}px` : undefined,
          }}
        >
          {rendered}
        </div>
      )
    }
    return <ListRowKeyContext.Provider value={rowKey}>{rendered}</ListRowKeyContext.Provider>
  }
  const renderItems = () => (
    <Show when={!isEmpty()} fallback={<div class={`${prefixCls()}-empty`}>{emptyText()}</div>}>
      <Show
        when={local.grid}
        fallback={
          <ul class={`${prefixCls()}-items`}>
            <Show when={hasDataSource()} fallback={local.children}>
              <For each={pagedData()}>{(item, index) => renderDataItem(item, index())}</For>
            </Show>
          </ul>
        }
      >
        <div
          class={`${prefixCls()}-grid-row`}
          style={{
            display: 'flex',
            'flex-wrap': 'wrap',
            'margin-left': gutter()[0] ? `${gutter()[0] / -2}px` : undefined,
            'margin-right': gutter()[0] ? `${gutter()[0] / -2}px` : undefined,
            'row-gap': gutter()[1] ? `${gutter()[1]}px` : undefined,
          }}
        >
          <Show when={hasDataSource()} fallback={local.children}>
            <For each={pagedData()}>{(item, index) => renderDataItem(item, index())}</For>
          </Show>
        </div>
      </Show>
    </Show>
  )
  const renderBody = () => <Spin {...loadingProps()}>{renderItems()}</Spin>

  return (
    <ListContext.Provider value={contextValue}>
      <div
        {...rest}
        class={classNames(
          prefixCls(),
          local.bordered && `${prefixCls()}-bordered`,
          split() && `${prefixCls()}-split`,
          itemLayout() === 'vertical' && `${prefixCls()}-vertical`,
          local.grid && `${prefixCls()}-grid`,
          isLoading() && `${prefixCls()}-loading`,
          (hasLoadMore() || pagination() || hasFooter()) &&
            `${prefixCls()}-something-after-last-item`,
          size() !== 'default' && `${prefixCls()}-${size()}`,
          hashId(),
          local.rootClass,
          local.class,
        )}
        classList={local.classList}
        style={local.style}
      >
        {renderPagination('top')}
        <Show when={hasHeader()}>
          <div class={`${prefixCls()}-header`}>{local.header}</div>
        </Show>
        {renderBody()}
        <Show when={hasFooter()}>
          <div class={`${prefixCls()}-footer`}>{local.footer}</div>
        </Show>
        <Show when={hasLoadMore()}>
          <div class={`${prefixCls()}-load-more`}>{local.loadMore}</div>
        </Show>
        {renderPagination('bottom')}
      </div>
    </ListContext.Provider>
  )
}
