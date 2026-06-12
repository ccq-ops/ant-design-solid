import { For, Show, createEffect, createMemo, createSignal, onCleanup, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { isServer } from 'solid-js/web'
import { useConfig } from '../config-provider'
import { Select } from '../select'
import { classNames } from '../shared/class-names'
import { usePaginationStyle } from './pagination.style'
import type {
  PaginationItemType,
  PaginationLocale,
  PaginationPageSizeOption,
  PaginationProps,
  PaginationSemanticClassNames,
  PaginationSemanticStyles,
  PaginationShowSizeChangerConfig,
  PaginationShowQuickJumper,
  PaginationSizeChangerOption,
} from './interface'

const DEFAULT_PAGE_SIZE = 10
const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100]
const DEFAULT_TOTAL_BOUNDARY_SHOW_SIZE_CHANGER = 50
const DEFAULT_JUMP_STEP = 5
const ELLIPSIS_TEXT = '•••'

type PageItem = number | 'jump-prev' | 'jump-next'

const DEFAULT_LOCALE: Required<PaginationLocale> = {
  items_per_page: '/ page',
  jump_to: 'Go to',
  jump_to_confirm: 'confirm',
  page: 'Page',
  prev_page: 'Previous Page',
  next_page: 'Next Page',
  prev_5: 'Jump Previous 5 Pages',
  next_5: 'Jump Next 5 Pages',
  prev_3: 'Jump Previous 3 Pages',
  next_3: 'Jump Next 3 Pages',
  page_size: 'Page Size',
}

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
    if (typeof previous === 'number' && page - previous > 1) {
      const jumpType = page < current ? 'jump-prev' : 'jump-next'
      items.push(jumpType)
    }
    items.push(page)
  }
  return items
}

function readInputValue(event: Event): string {
  return event.currentTarget instanceof HTMLInputElement ? event.currentTarget.value : ''
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object')
}

function renderOriginalElement(content: JSX.Element): JSX.Element {
  return content
}

function resolveSemantic<T>(
  value: T | ((info: { props: PaginationProps }) => T) | undefined,
  props: PaginationProps,
): T | undefined {
  if (typeof value === 'function')
    return (value as (info: { props: PaginationProps }) => T)({ props })
  return value
}

function canUseDom(): boolean {
  return !isServer && typeof window !== 'undefined' && typeof window.matchMedia === 'function'
}

export function Pagination(props: PaginationProps) {
  const [local, rest] = splitProps(props, [
    'prefixCls',
    'selectPrefixCls',
    'rootClass',
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
    'showPrevNextJumpers',
    'showTitle',
    'size',
    'totalBoundaryShowSizeChanger',
    'locale',
    'prevIcon',
    'nextIcon',
    'jumpPrevIcon',
    'jumpNextIcon',
    'sizeChangerRender',
    'itemRender',
    'classNames',
    'styles',
    'onChange',
    'onShowSizeChange',
    'class',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-pagination`
  const [, hashId] = usePaginationStyle(prefixCls())
  const [innerCurrent, setInnerCurrent] = createSignal(local.defaultCurrent ?? 1)
  const [innerPageSize, setInnerPageSize] = createSignal(local.defaultPageSize ?? DEFAULT_PAGE_SIZE)
  const [responsiveSmall, setResponsiveSmall] = createSignal(false)
  const [simpleInput, setSimpleInput] = createSignal('')
  const [quickInput, setQuickInput] = createSignal('')

  const locale = (): Required<PaginationLocale> => ({ ...DEFAULT_LOCALE, ...local.locale })
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
  const size = () => local.size ?? (local.responsive && responsiveSmall() ? 'small' : 'medium')
  const mergedProps = createMemo<PaginationProps>(() => ({ ...props, size: size() }))
  const semanticClassNames = createMemo<PaginationSemanticClassNames>(
    () => resolveSemantic(local.classNames, mergedProps()) ?? {},
  )
  const semanticStyles = createMemo<PaginationSemanticStyles>(
    () => resolveSemantic(local.styles, mergedProps()) ?? {},
  )
  const showSizeChangerConfig = (): PaginationShowSizeChangerConfig | undefined =>
    isObject(local.showSizeChanger) ? local.showSizeChanger : undefined
  const shouldShowSizeChanger = () => {
    if (local.showSizeChanger !== undefined) return Boolean(local.showSizeChanger)
    const boundary = local.totalBoundaryShowSizeChanger ?? DEFAULT_TOTAL_BOUNDARY_SHOW_SIZE_CHANGER
    return total() > boundary
  }
  const showJumpers = () => local.showPrevNextJumpers !== false
  const showQuickJumperConfig = (): Extract<PaginationShowQuickJumper, object> | undefined =>
    isObject(local.showQuickJumper) ? local.showQuickJumper : undefined
  const range = (): [number, number] => {
    if (total() === 0) return [0, 0]
    const start = (mergedCurrent() - 1) * mergedPageSize() + 1
    const end = Math.min(total(), mergedCurrent() * mergedPageSize())
    return [start, end]
  }
  const sizeChangerOptions = (): PaginationSizeChangerOption[] =>
    pageSizeOptions().map((option: PaginationPageSizeOption) => ({
      value: option,
      label: `${String(option)} ${locale().items_per_page}`,
    }))

  createEffect(() => {
    if (!local.responsive || local.size || !canUseDom()) {
      setResponsiveSmall(false)
      return
    }

    const matcher = window.matchMedia('(max-width: 575px)')
    const update = () => setResponsiveSmall(matcher.matches)
    update()
    matcher.addEventListener?.('change', update)
    matcher.addListener?.(update)
    onCleanup(() => {
      matcher.removeEventListener?.('change', update)
      matcher.removeListener?.(update)
    })
  })

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
          semanticClassNames().item,
        )}
        style={semanticStyles().item}
      >
        <button
          type="button"
          class={classNames(`${prefixCls()}-item-button`, semanticClassNames().itemButton)}
          style={semanticStyles().itemButton}
          aria-label={`${locale().page} ${page}`}
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
        <Show
          when={local.sizeChangerRender}
          fallback={
            <Select
              {...selectConfig}
              prefixCls={local.selectPrefixCls ?? selectConfig?.prefixCls}
              class={classNames(
                `${prefixCls()}-select`,
                selectConfig?.class,
                semanticClassNames().select,
              )}
              style={{
                ...(selectConfig?.style as JSX.CSSProperties | undefined),
                ...semanticStyles().select,
              }}
              aria-label={selectConfig?.['aria-label'] ?? locale().page_size}
              value={String(mergedPageSize())}
              disabled={disabled() || Boolean(selectConfig?.disabled)}
              options={sizeChangerOptions().map((option) => ({
                value: String(option.value),
                label: option.label,
              }))}
              onChange={(value, option) => {
                selectConfig?.onChange?.(value, option)
                changePageSize(Number(value))
              }}
            />
          }
        >
          {(render) =>
            render()({
              disabled: disabled(),
              pageSize: mergedPageSize(),
              options: sizeChangerOptions(),
              class: classNames(`${prefixCls()}-select`, semanticClassNames().select),
              'aria-label': locale().page_size,
              onSizeChange: (nextSize) => changePageSize(Number(nextSize)),
            })
          }
        </Show>
      </Show>
    )
  }

  function renderNavigationButton(type: 'prev' | 'next') {
    const isPrev = type === 'prev'
    const targetPage = () => (isPrev ? mergedCurrent() - 1 : mergedCurrent() + 1)
    const label = isPrev ? locale().prev_page : locale().next_page
    const title = label
    const originalElement = renderOriginalElement(
      isPrev ? (local.prevIcon ?? '‹') : (local.nextIcon ?? '›'),
    )
    return (
      <button
        type="button"
        class={classNames(`${prefixCls()}-item-button`, semanticClassNames().itemButton)}
        style={semanticStyles().itemButton}
        aria-label={label}
        title={showTitle() ? title : undefined}
        disabled={disabled() || (isPrev ? mergedCurrent() <= 1 : mergedCurrent() >= pageCount())}
        onClick={() => setCurrent(targetPage())}
      >
        {renderItemContent(targetPage(), type, originalElement)}
      </button>
    )
  }

  function renderJumpItem(type: 'jump-prev' | 'jump-next') {
    const isPrev = type === 'jump-prev'
    const targetPage = () =>
      clamp(mergedCurrent() + (isPrev ? -DEFAULT_JUMP_STEP : DEFAULT_JUMP_STEP), 1, pageCount())
    const label = isPrev ? locale().prev_5 : locale().next_5
    const originalElement = renderOriginalElement(
      isPrev ? (local.jumpPrevIcon ?? ELLIPSIS_TEXT) : (local.jumpNextIcon ?? ELLIPSIS_TEXT),
    )
    return (
      <li
        class={classNames(`${prefixCls()}-${type}`, semanticClassNames().ellipsis)}
        style={semanticStyles().ellipsis}
      >
        <button
          type="button"
          class={classNames(`${prefixCls()}-item-button`, semanticClassNames().itemButton)}
          style={semanticStyles().itemButton}
          aria-label={label}
          title={showTitle() ? label : undefined}
          disabled={disabled()}
          onClick={() => setCurrent(targetPage())}
        >
          {renderItemContent(targetPage(), type, originalElement)}
        </button>
      </li>
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
          local.rootClass,
          local.class,
          semanticClassNames().root,
        )}
        style={{ ...semanticStyles().root, ...(local.style as JSX.CSSProperties | undefined) }}
      >
        <Show when={local.showTotal}>
          {(showTotal) => (
            <span
              class={classNames(`${prefixCls()}-total-text`, semanticClassNames().totalText)}
              style={semanticStyles().totalText}
            >
              {showTotal()(total(), range())}
            </span>
          )}
        </Show>
        <Show
          when={simple()}
          fallback={
            <ul
              class={classNames(`${prefixCls()}-list`, semanticClassNames().list)}
              style={semanticStyles().list}
            >
              <li
                class={classNames(`${prefixCls()}-prev`, semanticClassNames().prev)}
                style={semanticStyles().prev}
              >
                {renderNavigationButton('prev')}
              </li>
              <For each={getPageItems(mergedCurrent(), pageCount(), local.showLessItems)}>
                {(item) => (
                  <Show
                    when={typeof item === 'number'}
                    fallback={
                      <Show
                        when={showJumpers()}
                        fallback={
                          <li
                            class={classNames(
                              `${prefixCls()}-ellipsis`,
                              semanticClassNames().ellipsis,
                            )}
                            style={semanticStyles().ellipsis}
                            aria-hidden="true"
                          >
                            {ELLIPSIS_TEXT}
                          </li>
                        }
                      >
                        {renderJumpItem(item as 'jump-prev' | 'jump-next')}
                      </Show>
                    }
                  >
                    {renderPageButton(item as number)}
                  </Show>
                )}
              </For>
              <li
                class={classNames(`${prefixCls()}-next`, semanticClassNames().next)}
                style={semanticStyles().next}
              >
                {renderNavigationButton('next')}
              </li>
            </ul>
          }
        >
          {renderNavigationButton('prev')}
          <span
            class={classNames(`${prefixCls()}-simple-pager`, semanticClassNames().simplePager)}
            style={semanticStyles().simplePager}
          >
            <input
              class={classNames(`${prefixCls()}-input`, semanticClassNames().input)}
              style={semanticStyles().input}
              aria-label={locale().page}
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
            class={classNames(`${prefixCls()}-quick-jumper`, semanticClassNames().quickJumper)}
            style={semanticStyles().quickJumper}
          >
            <span>{locale().jump_to}</span>
            <input
              class={classNames(`${prefixCls()}-input`, semanticClassNames().input)}
              style={semanticStyles().input}
              aria-label={local.locale?.page ?? 'Quick jump to page'}
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
                    class={classNames(`${prefixCls()}-go-button`, semanticClassNames().goButton)}
                    style={semanticStyles().goButton}
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
