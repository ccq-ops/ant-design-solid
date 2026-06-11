import { CloseOutlined, PlusOutlined } from '@ant-design-solid/icons'
import { For, Show, createEffect, createSignal } from 'solid-js'
import type { JSX } from 'solid-js'
import { classNames } from '../shared/class-names'
import type {
  TabsIndicatorConfig,
  TabsItem,
  TabsPlacement,
  TabsSemanticClassNamesMap,
  TabsSemanticStylesMap,
  TabsType,
} from './interface'
import { mergeStyle } from './tabs-utils'

export interface TabNavListProps {
  items: TabsItem[]
  activeKey: string
  prefixCls: string
  type: TabsType
  tabPlacement: TabsPlacement
  tabId: (key: string) => string
  panelId: (key: string) => string
  renderedPanelKeys: Set<string>
  classNames: TabsSemanticClassNamesMap
  styles: TabsSemanticStylesMap
  centered?: boolean
  indicator?: TabsIndicatorConfig
  tabBarExtraContent?: JSX.Element | { left?: JSX.Element; right?: JSX.Element }
  tabBarGutter?: number
  tabBarStyle?: JSX.CSSProperties
  addIcon?: JSX.Element
  removeIcon?: JSX.Element
  hideAdd?: boolean
  onEdit?: (targetKey: string | MouseEvent, action: 'add' | 'remove') => void
  onTabActivate: (item: TabsItem, event: MouseEvent | KeyboardEvent) => void
}

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
  const [tabElements, setTabElements] = createSignal<Record<string, HTMLButtonElement | undefined>>(
    {},
  )
  const [indicatorStyles, setIndicatorStyles] = createSignal<
    Record<string, { style?: JSX.CSSProperties; customSize: boolean }>
  >({})
  const enabledItems = () => props.items.filter((item) => !item.disabled)
  const editable = () => props.type === 'editable-card'
  const closable = (item: TabsItem) => item.closable !== false && item.closeIcon !== false
  const extras = () => extraContent(props.tabBarExtraContent)
  const navStyle = (): JSX.CSSProperties =>
    mergeStyle(
      props.styles.header,
      props.tabBarStyle,
      props.tabBarGutter === undefined
        ? undefined
        : ({ '--ads-tabs-tab-gutter': `${props.tabBarGutter}px` } as JSX.CSSProperties),
    )
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
    const activeItem = props.items.find((item) => item.key === props.activeKey)
    if (!activeItem) return
    const tab = tabElements()[activeItem.key]
    if (!tab) return
    updateIndicatorStyle(activeItem, tab)
  })
  const handleAdd = (event: MouseEvent) => {
    props.onEdit?.(event, 'add')
  }
  const handleRemove = (event: MouseEvent, item: TabsItem) => {
    event.stopPropagation()
    props.onEdit?.(item.key, 'remove')
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
    <div
      class={classNames(
        `${props.prefixCls}-nav`,
        props.centered && `${props.prefixCls}-nav-centered`,
        props.classNames.header,
      )}
      style={navStyle()}
      role="tablist"
    >
      <Show when={extras().left}>
        <div class={`${props.prefixCls}-extra-content ${props.prefixCls}-extra-content-left`}>
          {extras().left}
        </div>
      </Show>
      <For each={props.items}>
        {(item) => {
          const active = () => item.key === props.activeKey
          const closeButton = () => closeButtonConfig(item, props.removeIcon)
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
              <Show when={editable() && closable(item) && closeButton().show}>
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
            </span>
          )
        }}
      </For>
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
