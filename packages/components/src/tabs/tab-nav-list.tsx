import { CloseOutlined, EllipsisOutlined, PlusOutlined } from '@ant-design-solid/icons'
import { For, Show, createEffect, createSignal, onCleanup, untrack } from 'solid-js'
import type { JSX } from 'solid-js'
import { Dropdown } from '../dropdown'
import { classNames } from '../shared/class-names'
import type { TabsDefaultTabBarProps, TabsItem } from './interface'
import { mergeStyle } from './tabs-utils'

export type TabNavListProps = TabsDefaultTabBarProps

function closeButtonConfig(item: TabsItem, removeIcon?: JSX.Element) {
  if (item.closeIcon === false || item.closeIcon === null) {
    return { show: false, icon: null }
  }
  return { show: true, icon: item.closeIcon ?? removeIcon ?? <CloseOutlined /> }
}

function isPlainObject(value: unknown): value is Record<PropertyKey, unknown> {
  if (!value || typeof value !== 'object') return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function extraContent(content: TabNavListProps['tabBarExtraContent']) {
  if (isPlainObject(content) && ('left' in content || 'right' in content)) {
    return content as { left?: JSX.Element; right?: JSX.Element }
  }
  return { right: content as JSX.Element | undefined }
}

export function TabNavList(props: TabNavListProps) {
  let navListElement: HTMLDivElement | undefined
  let previousScrollLeft = 0
  let previousScrollTop = 0
  const [tabElements, setTabElements] = createSignal<Record<string, HTMLButtonElement | undefined>>(
    {},
  )
  const [tabSizes, setTabSizes] = createSignal<Record<string, number>>({})
  const [hiddenKeys, setHiddenKeys] = createSignal<Set<string>>(new Set())
  const [indicatorStyles, setIndicatorStyles] = createSignal<
    Record<string, { style?: JSX.CSSProperties; customSize: boolean }>
  >({})
  const enabledItems = () => props.items.filter((item) => !item.disabled)
  const editable = () => props.type === 'editable-card'
  const closable = (item: TabsItem) => item.closable !== false && item.closeIcon !== false
  const extras = () => extraContent(props.tabBarExtraContent)
  const vertical = () => props.tabPlacement === 'start' || props.tabPlacement === 'end'
  const visibleItems = () => props.items.filter((item) => !hiddenKeys().has(item.key))
  const hiddenItems = () => props.items.filter((item) => hiddenKeys().has(item.key))
  const moreIcon = () => props.more?.icon ?? <EllipsisOutlined />
  const moreTrigger = () => props.more?.trigger ?? 'hover'
  const navStyle = (): JSX.CSSProperties =>
    mergeStyle(
      props.styles.header,
      props.tabBarStyle,
      props.tabBarGutter === undefined
        ? undefined
        : ({ '--ads-tabs-tab-gutter': `${props.tabBarGutter}px` } as JSX.CSSProperties),
    )
  const updateOverflow = () => {
    if (!navListElement) return
    const containerRect = navListElement.getBoundingClientRect()
    const containerSize = vertical() ? containerRect.height : containerRect.width
    if (!Number.isFinite(containerSize) || containerSize <= 0) {
      setHiddenKeys(new Set<string>())
      return
    }

    const currentSizes = untrack(tabSizes)
    const nextSizes: Record<string, number> = { ...currentSizes }
    for (const item of props.items) {
      const element = tabElements()[item.key]
      if (!element) continue
      const rect = element.getBoundingClientRect()
      const size = vertical() ? rect.height : rect.width
      if (Number.isFinite(size) && size > 0) {
        nextSizes[item.key] = size
      }
    }
    setTabSizes(nextSizes)

    const totalSize = props.items.reduce((sum, item) => sum + (nextSizes[item.key] ?? 0), 0)
    if (totalSize <= containerSize) {
      setHiddenKeys(new Set<string>())
      return
    }

    const moreSize = 40
    const availableSize = Math.max(0, containerSize - moreSize)
    const nextHiddenKeys = new Set<string>()
    const activeItem = props.items.find((item) => item.key === props.activeKey)
    let usedSize = activeItem ? (nextSizes[activeItem.key] ?? 0) : 0

    for (const item of props.items) {
      if (item.key === activeItem?.key) continue
      const itemSize = nextSizes[item.key] ?? 0
      if (usedSize + itemSize <= availableSize) {
        usedSize += itemSize
      } else {
        nextHiddenKeys.add(item.key)
      }
    }

    setHiddenKeys(nextHiddenKeys)
  }
  const indicatorHasCustomSize = (item: TabsItem) =>
    Boolean(indicatorStyles()[item.key]?.customSize)
  const updateIndicatorStyle = (item: TabsItem, tab: HTMLButtonElement) => {
    const size = props.indicator?.size
    const rect = tab.getBoundingClientRect()
    const originSize =
      props.tabPlacement === 'start' || props.tabPlacement === 'end' ? rect.height : rect.width
    const computedSize = typeof size === 'function' ? size(originSize) : size
    const customSize = Number.isFinite(computedSize)
    setIndicatorStyles((current) => ({
      ...current,
      [item.key]: {
        customSize,
        style: customSize
          ? mergeStyle(
              {
                '--ads-tabs-indicator-size': `${computedSize}px`,
              } as JSX.CSSProperties,
              props.styles.indicator,
            )
          : props.styles.indicator,
      },
    }))
  }
  createEffect(() => {
    const itemKeys = new Set(props.items.map((item) => item.key))
    setTabElements((current) =>
      Object.fromEntries(Object.entries(current).filter(([key]) => itemKeys.has(key))),
    )
    setTabSizes((current) =>
      Object.fromEntries(Object.entries(current).filter(([key]) => itemKeys.has(key))),
    )
    setIndicatorStyles((current) =>
      Object.fromEntries(Object.entries(current).filter(([key]) => itemKeys.has(key))),
    )
  })
  createEffect(() => {
    const items = props.items
    const activeKey = props.activeKey
    const tabPlacement = props.tabPlacement
    void items
    void activeKey
    void tabPlacement
    queueMicrotask(updateOverflow)
    if (typeof ResizeObserver === 'undefined' || !navListElement) return
    const resizeObserver = new ResizeObserver(updateOverflow)
    resizeObserver.observe(navListElement)
    for (const element of Object.values(tabElements())) {
      if (element) resizeObserver.observe(element)
    }
    onCleanup(() => {
      resizeObserver.disconnect()
    })
  })
  createEffect(() => {
    const activeItem = props.items.find((item) => item.key === props.activeKey)
    if (!activeItem) return
    const tab = tabElements()[activeItem.key]
    if (!tab) return
    updateIndicatorStyle(activeItem, tab)
    if (typeof ResizeObserver === 'undefined') return
    const resizeObserver = new ResizeObserver(() => {
      updateIndicatorStyle(activeItem, tab)
    })
    resizeObserver.observe(tab)
    onCleanup(() => {
      resizeObserver.disconnect()
    })
  })
  const handleAdd = (event: MouseEvent) => {
    props.onEdit?.(event, 'add')
  }
  const handleRemove = (event: MouseEvent, item: TabsItem) => {
    event.stopPropagation()
    props.onEdit?.(item.key, 'remove')
  }
  const handleMoreClick = (key: string, event: MouseEvent) => {
    const item = props.items.find((candidate) => candidate.key === key)
    if (item) props.onTabActivate(item, event)
  }
  const handleScroll = (event: Event) => {
    const target = event.currentTarget as HTMLDivElement
    const nextScrollLeft = target.scrollLeft
    const nextScrollTop = target.scrollTop
    if (nextScrollLeft > previousScrollLeft) props.onTabScroll?.({ direction: 'right' })
    if (nextScrollLeft < previousScrollLeft) props.onTabScroll?.({ direction: 'left' })
    if (nextScrollTop > previousScrollTop) props.onTabScroll?.({ direction: 'bottom' })
    if (nextScrollTop < previousScrollTop) props.onTabScroll?.({ direction: 'top' })
    previousScrollLeft = nextScrollLeft
    previousScrollTop = nextScrollTop
  }
  const focusTab = (item: TabsItem, event: KeyboardEvent) => {
    const element = document.getElementById(props.tabId(item.key))
    element?.focus()
    props.onTabActivate(item, event)
  }
  const handleKeyDown = (event: KeyboardEvent, item: TabsItem) => {
    const candidates = enabledItems()
    if (!candidates.length) return
    const currentIndex = Math.max(
      candidates.findIndex((candidate) => candidate.key === item.key),
      candidates.findIndex((candidate) => candidate.key === props.activeKey),
      0,
    )
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      focusTab(candidates[(currentIndex + 1) % candidates.length], event)
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      focusTab(candidates[(currentIndex - 1 + candidates.length) % candidates.length], event)
    }
    if (event.key === 'Home') {
      event.preventDefault()
      focusTab(candidates[0], event)
    }
    if (event.key === 'End') {
      event.preventDefault()
      focusTab(candidates[candidates.length - 1], event)
    }
  }

  return (
    <div class={classNames(`${props.prefixCls}-nav`, props.classNames.header)} style={navStyle()}>
      <Show when={extras().left}>
        <div class={`${props.prefixCls}-extra-content ${props.prefixCls}-extra-content-left`}>
          {extras().left}
        </div>
      </Show>
      <div
        ref={(element) => {
          navListElement = element
        }}
        class={classNames(
          `${props.prefixCls}-nav-list`,
          props.centered && `${props.prefixCls}-nav-list-centered`,
        )}
        role="tablist"
        onScroll={handleScroll}
      >
        <For each={visibleItems()}>
          {(item) => {
            const active = () => item.key === props.activeKey
            return (
              <span
                class={classNames(
                  `${props.prefixCls}-tab-wrap`,
                  active() && `${props.prefixCls}-tab-wrap-active`,
                  item.disabled && `${props.prefixCls}-tab-wrap-disabled`,
                )}
              >
                <button
                  id={props.tabId(item.key)}
                  ref={(element) => {
                    setTabElements((current) => ({ ...current, [item.key]: element }))
                  }}
                  type="button"
                  role="tab"
                  class={classNames(
                    `${props.prefixCls}-tab`,
                    active() && `${props.prefixCls}-tab-active`,
                    item.disabled && `${props.prefixCls}-tab-disabled`,
                    props.classNames.item,
                  )}
                  style={props.styles.item}
                  tabIndex={active() && !item.disabled ? 0 : -1}
                  aria-selected={active() ? 'true' : 'false'}
                  aria-disabled={item.disabled ? 'true' : undefined}
                  aria-controls={
                    props.renderedPanelKeys.has(item.key) ? props.panelId(item.key) : undefined
                  }
                  onClick={(event) => props.onTabActivate(item, event)}
                  onKeyDown={(event) => handleKeyDown(event, item)}
                >
                  <Show when={item.icon}>
                    <span class={`${props.prefixCls}-tab-icon`}>{item.icon}</span>
                  </Show>
                  {item.label}
                  <Show when={active()}>
                    <span
                      aria-hidden="true"
                      class={classNames(
                        `${props.prefixCls}-indicator`,
                        indicatorHasCustomSize(item) &&
                          `${props.prefixCls}-indicator-${props.indicator?.align ?? 'center'}`,
                        props.classNames.indicator,
                      )}
                      style={indicatorStyles()[item.key]?.style}
                    />
                  </Show>
                </button>
              </span>
            )
          }}
        </For>
      </div>
      <Show when={hiddenItems().length > 0}>
        <Dropdown
          trigger={moreTrigger()}
          overlayClass={props.classNames.popup?.root}
          overlayStyle={props.styles.popup?.root}
          menu={{
            items: hiddenItems().map((item) => ({
              key: item.key,
              label: item.label,
              disabled: item.disabled,
            })),
            onClick: (info) => handleMoreClick(info.key, info.domEvent),
          }}
        >
          <button
            type="button"
            class={`${props.prefixCls}-more`}
            aria-label={props.more?.icon ? undefined : 'more'}
          >
            {moreIcon()}
          </button>
        </Dropdown>
      </Show>
      <Show when={editable()}>
        <div class={`${props.prefixCls}-remove-list`}>
          <For each={props.items}>
            {(item) => {
              const closeButton = () => closeButtonConfig(item, props.removeIcon)
              return (
                <Show when={closable(item) && closeButton().show}>
                  <button
                    type="button"
                    class={classNames(`${props.prefixCls}-tab-remove`, props.classNames.remove)}
                    style={props.styles.remove}
                    aria-label="close"
                    onClick={(event) => handleRemove(event, item)}
                  >
                    {closeButton().icon}
                  </button>
                </Show>
              )
            }}
          </For>
        </div>
      </Show>
      <Show when={editable() && !props.hideAdd}>
        <button type="button" class={`${props.prefixCls}-add`} aria-label="add" onClick={handleAdd}>
          {props.addIcon ?? <PlusOutlined />}
        </button>
      </Show>
      <Show when={extras().right}>
        <div class={`${props.prefixCls}-extra-content ${props.prefixCls}-extra-content-right`}>
          {extras().right}
        </div>
      </Show>
    </div>
  )
}
