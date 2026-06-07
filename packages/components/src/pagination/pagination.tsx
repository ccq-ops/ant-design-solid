import { For, Show, createEffect, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { usePaginationStyle } from './pagination.style'
import type {
  PaginationItemType,
  PaginationPageSizeOption,
  PaginationProps,
  PaginationShowSizeChangerConfig,
  PaginationShowQuickJumper,
} from './interface'

const DEFAULT_PAGE_SIZE = 10
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]
const DEFAULT_TOTAL_BOUNDARY_SHOW_SIZE_CHANGER = 50
const ELLIPSIS = 'ellipsis'

type PageItem = number | typeof ELLIPSIS

function toPositiveInteger(value: unknown, fallback: number): number {
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric <= 0) return fallback
  return Math.floor(numeric)
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function getPageCount(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(Math.max(0, total) / pageSize))
}

function getPageItems(current: number, pageCount: number, showLessItems = false): PageItem[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1)

  const siblingCount = showLessItems ? 0 : 1
  const pages = new Set<number>([1, pageCount])
  for (let page = current - siblingCount; page <= current + siblingCount; page += 1) {
    if (page > 1 && page < pageCount) pages.add(page)
  }

  const edgeVisibleCount = showLessItems ? 3 : 5
  if (current <= edgeVisibleCount - 1) {
    for (let page = 2; page <= edgeVisibleCount; page += 1) pages.add(page)
  }

  if (current >= pageCount - (edgeVisibleCount - 2)) {
    for (let page = pageCount - (edgeVisibleCount - 1); page < pageCount; page += 1) pages.add(page)
  }

  const sorted = Array.from(pages).sort((a, b) => a - b)
  const items: PageItem[] = []
  for (const page of sorted) {
    const previous = items[items.length - 1]
    if (typeof previous === 'number' && page - previous > 1) items.push(ELLIPSIS)
    items.push(page)
  }
  return items
}

function readInputValue(event: Event): string {
  return event.currentTarget instanceof HTMLInputElement ? event.currentTarget.value : ''
}

function readSelectValue(event: Event): string {
  return event.currentTarget instanceof HTMLSelectElement ? event.currentTarget.value : ''
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object')
}

function renderOriginalElement(content: JSX.Element): JSX.Element {
  return content
}

export function Pagination(props: PaginationProps) {
  const [local, rest] = splitProps(props, [
    'current',
    'defaultCurrent',
    'pageSize',
    'defaultPageSize',
    'total',
    'disabled',
    'simple',
    'showSizeChanger',
    'pageSizeOptions',
    'showQuickJumper',
    'hideOnSinglePage',
    'showTotal',
    'align',
    'responsive',
    'showLessItems',
    'showTitle',
    'size',
    'totalBoundaryShowSizeChanger',
    'itemRender',
    'classNames',
    'styles',
    'onChange',
    'onShowSizeChange',
    'class',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-pagination`
  const [, hashId] = usePaginationStyle(prefixCls())
  const [innerCurrent, setInnerCurrent] = createSignal(local.defaultCurrent ?? 1)
  const [innerPageSize, setInnerPageSize] = createSignal(local.defaultPageSize ?? DEFAULT_PAGE_SIZE)
  const [simpleInput, setSimpleInput] = createSignal('')
  const [quickInput, setQuickInput] = createSignal('')

  const total = () => Math.max(0, Math.floor(Number(local.total) || 0))
  const mergedPageSize = () =>
    toPositiveInteger(local.pageSize ?? innerPageSize(), DEFAULT_PAGE_SIZE)
  const pageCount = () => getPageCount(total(), mergedPageSize())
  const mergedCurrent = () =>
    clamp(toPositiveInteger(local.current ?? innerCurrent(), 1), 1, pageCount())
  const disabled = () => Boolean(local.disabled)
  const pageSizeOptions = () => local.pageSizeOptions ?? DEFAULT_PAGE_SIZE_OPTIONS
  const isHidden = () => Boolean(local.hideOnSinglePage && pageCount() <= 1)
  const simple = () => Boolean(local.simple)
  const simpleReadOnly = () => isObject(local.simple) && Boolean(local.simple.readOnly)
  const showTitle = () => local.showTitle !== false
  const size = () => local.size ?? 'medium'
  const showSizeChangerConfig = (): PaginationShowSizeChangerConfig | undefined =>
    isObject(local.showSizeChanger) ? local.showSizeChanger : undefined
  const shouldShowSizeChanger = () => {
    if (local.showSizeChanger !== undefined) return Boolean(local.showSizeChanger)
    const boundary = local.totalBoundaryShowSizeChanger ?? DEFAULT_TOTAL_BOUNDARY_SHOW_SIZE_CHANGER
    return total() > boundary
  }
  const showQuickJumperConfig = (): Extract<PaginationShowQuickJumper, object> | undefined =>
    isObject(local.showQuickJumper) ? local.showQuickJumper : undefined
  const range = (): [number, number] => {
    if (total() === 0) return [0, 0]
    const start = (mergedCurrent() - 1) * mergedPageSize() + 1
    const end = Math.min(total(), mergedCurrent() * mergedPageSize())
    return [start, end]
  }

  createEffect(() => {
    const current = mergedCurrent()
    setSimpleInput(String(current))
  })

  function setCurrent(nextPage: number, nextPageSize = mergedPageSize()): void {
    if (disabled()) return
    const nextCount = getPageCount(total(), nextPageSize)
    const nextCurrent = clamp(toPositiveInteger(nextPage, 1), 1, nextCount)

    if (nextCurrent === mergedCurrent() && nextPageSize === mergedPageSize()) return

    if (local.current === undefined) setInnerCurrent(nextCurrent)
    local.onChange?.(nextCurrent, nextPageSize)
  }

  function changePageSize(nextSize: number): void {
    if (disabled()) return
    const nextPageSize = toPositiveInteger(nextSize, mergedPageSize())
    const nextCurrent = clamp(mergedCurrent(), 1, getPageCount(total(), nextPageSize))

    if (local.pageSize === undefined) setInnerPageSize(nextPageSize)
    if (local.current === undefined) setInnerCurrent(nextCurrent)

    local.onShowSizeChange?.(nextCurrent, nextPageSize)
    local.onChange?.(nextCurrent, nextPageSize)
  }

  function commitInput(value: string, reset: () => void): void {
    const trimmedValue = value.trim()
    if (!trimmedValue) {
      reset()
      return
    }

    const numeric = Number(trimmedValue)
    if (Number.isFinite(numeric)) setCurrent(numeric)
    reset()
  }

  function renderItemContent(page: number, type: PaginationItemType, originalElement: JSX.Element) {
    return local.itemRender?.(page, type, originalElement) ?? originalElement
  }

  function renderPageButton(page: number) {
    const active = () => page === mergedCurrent()
    const originalElement = renderOriginalElement(page)
    return (
      <li
        class={classNames(
          `${prefixCls()}-item`,
          active() && `${prefixCls()}-item-active`,
          local.classNames?.item,
        )}
        style={local.styles?.item}
      >
        <button
          type="button"
          class={classNames(`${prefixCls()}-item-button`, local.classNames?.itemButton)}
          style={local.styles?.itemButton}
          aria-label={`Page ${page}`}
          aria-current={active() ? 'page' : undefined}
          title={showTitle() ? String(page) : undefined}
          disabled={disabled()}
          onClick={() => setCurrent(page)}
        >
          {renderItemContent(page, 'page', originalElement)}
        </button>
      </li>
    )
  }

  function renderPageSizeSelect() {
    const selectConfig = showSizeChangerConfig()
    return (
      <Show when={shouldShowSizeChanger()}>
        <select
          {...selectConfig}
          class={classNames(`${prefixCls()}-select`, selectConfig?.class, local.classNames?.select)}
          style={{
            ...(selectConfig?.style as JSX.CSSProperties | undefined),
            ...local.styles?.select,
          }}
          aria-label={selectConfig?.['aria-label'] ?? 'Page Size'}
          value={String(mergedPageSize())}
          disabled={disabled() || Boolean(selectConfig?.disabled)}
          onChange={(event) => {
            ;(selectConfig?.onChange as JSX.EventHandler<HTMLSelectElement, Event> | undefined)?.(
              event,
            )
            if (!event.defaultPrevented) changePageSize(Number(readSelectValue(event)))
          }}
        >
          <For each={pageSizeOptions()}>
            {(option: PaginationPageSizeOption) => (
              <option value={String(option)}>{String(option)} / page</option>
            )}
          </For>
        </select>
      </Show>
    )
  }

  function renderNavigationButton(type: 'prev' | 'next') {
    const isPrev = type === 'prev'
    const targetPage = () => (isPrev ? mergedCurrent() - 1 : mergedCurrent() + 1)
    const label = isPrev ? 'Previous Page' : 'Next Page'
    const title = isPrev ? 'Previous Page' : 'Next Page'
    const originalElement = renderOriginalElement(isPrev ? '‹' : '›')
    return (
      <button
        type="button"
        class={classNames(`${prefixCls()}-item-button`, local.classNames?.itemButton)}
        style={local.styles?.itemButton}
        aria-label={label}
        title={showTitle() ? title : undefined}
        disabled={disabled() || (isPrev ? mergedCurrent() <= 1 : mergedCurrent() >= pageCount())}
        onClick={() => setCurrent(targetPage())}
      >
        {renderItemContent(targetPage(), type, originalElement)}
      </button>
    )
  }

  return (
    <Show when={!isHidden()}>
      <nav
        {...rest}
        aria-label={rest['aria-label'] ?? 'Pagination'}
        aria-disabled={disabled() || undefined}
        class={classNames(
          prefixCls(),
          simple() && `${prefixCls()}-simple`,
          disabled() && `${prefixCls()}-disabled`,
          local.align && `${prefixCls()}-align-${local.align}`,
          local.responsive && `${prefixCls()}-responsive`,
          `${prefixCls()}-${size()}`,
          hashId(),
          local.class,
          local.classNames?.root,
        )}
        style={{ ...local.styles?.root, ...(local.style as JSX.CSSProperties | undefined) }}
      >
        <Show when={local.showTotal}>
          {(showTotal) => (
            <span
              class={classNames(`${prefixCls()}-total-text`, local.classNames?.totalText)}
              style={local.styles?.totalText}
            >
              {showTotal()(total(), range())}
            </span>
          )}
        </Show>
        <Show
          when={simple()}
          fallback={
            <ul
              class={classNames(`${prefixCls()}-list`, local.classNames?.list)}
              style={local.styles?.list}
            >
              <li
                class={classNames(`${prefixCls()}-prev`, local.classNames?.prev)}
                style={local.styles?.prev}
              >
                {renderNavigationButton('prev')}
              </li>
              <For each={getPageItems(mergedCurrent(), pageCount(), local.showLessItems)}>
                {(item) => (
                  <Show
                    when={item !== ELLIPSIS}
                    fallback={
                      <li
                        class={classNames(`${prefixCls()}-ellipsis`, local.classNames?.ellipsis)}
                        style={local.styles?.ellipsis}
                        aria-hidden="true"
                      >
                        •••
                      </li>
                    }
                  >
                    {renderPageButton(item as number)}
                  </Show>
                )}
              </For>
              <li
                class={classNames(`${prefixCls()}-next`, local.classNames?.next)}
                style={local.styles?.next}
              >
                {renderNavigationButton('next')}
              </li>
            </ul>
          }
        >
          {renderNavigationButton('prev')}
          <span
            class={classNames(`${prefixCls()}-simple-pager`, local.classNames?.simplePager)}
            style={local.styles?.simplePager}
          >
            <input
              class={classNames(`${prefixCls()}-input`, local.classNames?.input)}
              style={local.styles?.input}
              aria-label="Page"
              inputMode="numeric"
              value={simpleInput()}
              disabled={disabled()}
              readOnly={simpleReadOnly()}
              onInput={(event) => {
                if (simpleReadOnly()) {
                  event.currentTarget.value = simpleInput()
                  return
                }
                setSimpleInput(readInputValue(event))
              }}
              onKeyDown={(event) => {
                if (simpleReadOnly()) return
                if (event.key === 'Enter')
                  commitInput(simpleInput(), () => setSimpleInput(String(mergedCurrent())))
              }}
              onBlur={() => {
                if (simpleReadOnly()) return
                commitInput(simpleInput(), () => setSimpleInput(String(mergedCurrent())))
              }}
            />
            <span>/ {pageCount()}</span>
          </span>
          {renderNavigationButton('next')}
        </Show>
        {renderPageSizeSelect()}
        <Show when={local.showQuickJumper && !simple()}>
          <span
            class={classNames(`${prefixCls()}-quick-jumper`, local.classNames?.quickJumper)}
            style={local.styles?.quickJumper}
          >
            <span>Go to</span>
            <input
              class={classNames(`${prefixCls()}-input`, local.classNames?.input)}
              style={local.styles?.input}
              aria-label="Quick jump to page"
              inputMode="numeric"
              value={quickInput()}
              disabled={disabled()}
              onInput={(event) => setQuickInput(readInputValue(event))}
              onKeyDown={(event) => {
                if (event.key === 'Enter') commitInput(quickInput(), () => setQuickInput(''))
              }}
              onBlur={() => commitInput(quickInput(), () => setQuickInput(''))}
            />
            <Show when={showQuickJumperConfig()?.goButton}>
              {(goButton) => {
                const button = goButton()
                return (
                  <span
                    class={classNames(`${prefixCls()}-go-button`, local.classNames?.goButton)}
                    style={local.styles?.goButton}
                    onClick={() => commitInput(quickInput(), () => setQuickInput(''))}
                  >
                    {button}
                  </span>
                )
              }}
            </Show>
          </span>
        </Show>
      </nav>
    </Show>
  )
}
