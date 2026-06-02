import { For, Show, createEffect, createSignal, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { usePaginationStyle } from './pagination.style'
import type { PaginationPageSizeOption, PaginationProps } from './interface'

const DEFAULT_PAGE_SIZE = 10
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]
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

function getPageItems(current: number, pageCount: number): PageItem[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1)

  const pages = new Set<number>([1, pageCount])
  for (let page = current - 1; page <= current + 1; page += 1) {
    if (page > 1 && page < pageCount) pages.add(page)
  }

  if (current <= 4) {
    for (let page = 2; page <= 5; page += 1) pages.add(page)
  }

  if (current >= pageCount - 3) {
    for (let page = pageCount - 4; page < pageCount; page += 1) pages.add(page)
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
    'onChange',
    'onShowSizeChange',
    'class',
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
    const numeric = Number(value)
    if (Number.isFinite(numeric)) setCurrent(numeric)
    reset()
  }

  function renderPageButton(page: number) {
    const active = () => page === mergedCurrent()
    return (
      <li class={classNames(`${prefixCls()}-item`, active() && `${prefixCls()}-item-active`)}>
        <button
          type="button"
          class={`${prefixCls()}-item-button`}
          aria-label={`Page ${page}`}
          aria-current={active() ? 'page' : undefined}
          disabled={disabled()}
          onClick={() => setCurrent(page)}
        >
          {page}
        </button>
      </li>
    )
  }

  function renderPageSizeSelect() {
    return (
      <Show when={local.showSizeChanger}>
        <select
          class={`${prefixCls()}-select`}
          aria-label="Page Size"
          value={String(mergedPageSize())}
          disabled={disabled()}
          onChange={(event) => changePageSize(Number(readSelectValue(event)))}
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

  return (
    <Show when={!isHidden()}>
      <nav
        {...rest}
        aria-label={rest['aria-label'] ?? 'Pagination'}
        aria-disabled={disabled() || undefined}
        class={classNames(
          prefixCls(),
          local.simple && `${prefixCls()}-simple`,
          disabled() && `${prefixCls()}-disabled`,
          hashId(),
          local.class,
        )}
      >
        <Show when={local.showTotal}>
          {(showTotal) => (
            <span class={`${prefixCls()}-total-text`}>{showTotal()(total(), range())}</span>
          )}
        </Show>
        <Show
          when={local.simple}
          fallback={
            <ul class={`${prefixCls()}-list`}>
              <li class={`${prefixCls()}-prev`}>
                <button
                  type="button"
                  class={`${prefixCls()}-item-button`}
                  aria-label="Previous Page"
                  disabled={disabled() || mergedCurrent() <= 1}
                  onClick={() => setCurrent(mergedCurrent() - 1)}
                >
                  ‹
                </button>
              </li>
              <For each={getPageItems(mergedCurrent(), pageCount())}>
                {(item) => (
                  <Show
                    when={item !== ELLIPSIS}
                    fallback={
                      <li class={`${prefixCls()}-ellipsis`} aria-hidden="true">
                        •••
                      </li>
                    }
                  >
                    {renderPageButton(item as number)}
                  </Show>
                )}
              </For>
              <li class={`${prefixCls()}-next`}>
                <button
                  type="button"
                  class={`${prefixCls()}-item-button`}
                  aria-label="Next Page"
                  disabled={disabled() || mergedCurrent() >= pageCount()}
                  onClick={() => setCurrent(mergedCurrent() + 1)}
                >
                  ›
                </button>
              </li>
            </ul>
          }
        >
          <button
            type="button"
            class={`${prefixCls()}-item-button`}
            aria-label="Previous Page"
            disabled={disabled() || mergedCurrent() <= 1}
            onClick={() => setCurrent(mergedCurrent() - 1)}
          >
            ‹
          </button>
          <span class={`${prefixCls()}-simple-pager`}>
            <input
              class={`${prefixCls()}-input`}
              aria-label="Page"
              inputMode="numeric"
              value={simpleInput()}
              disabled={disabled()}
              onInput={(event) => setSimpleInput(readInputValue(event))}
              onKeyDown={(event) => {
                if (event.key === 'Enter')
                  commitInput(simpleInput(), () => setSimpleInput(String(mergedCurrent())))
              }}
              onBlur={() =>
                commitInput(simpleInput(), () => setSimpleInput(String(mergedCurrent())))
              }
            />
            <span>/ {pageCount()}</span>
          </span>
          <button
            type="button"
            class={`${prefixCls()}-item-button`}
            aria-label="Next Page"
            disabled={disabled() || mergedCurrent() >= pageCount()}
            onClick={() => setCurrent(mergedCurrent() + 1)}
          >
            ›
          </button>
        </Show>
        {renderPageSizeSelect()}
        <Show when={local.showQuickJumper && !local.simple}>
          <span class={`${prefixCls()}-quick-jumper`}>
            <span>Go to</span>
            <input
              class={`${prefixCls()}-input`}
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
          </span>
        </Show>
      </nav>
    </Show>
  )
}
