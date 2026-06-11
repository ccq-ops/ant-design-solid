import { For, Show, createEffect, createMemo, createSignal, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useTabsStyle } from './tabs.style'
import { getDefaultActiveKey, keyToId } from './tabs-utils'
import type { TabsItem, TabsProps } from './interface'

export function Tabs(props: TabsProps) {
  const [local, rest] = splitProps(props, [
    'items',
    'activeKey',
    'defaultActiveKey',
    'onChange',
    'type',
    'size',
    'tabPosition',
    'tabPlacement',
    'destroyInactiveTabPane',
    'destroyOnHidden',
    'animated',
    'centered',
    'indicator',
    'more',
    'renderTabBar',
    'tabBarExtraContent',
    'tabBarGutter',
    'tabBarStyle',
    'onEdit',
    'onTabClick',
    'onTabScroll',
    'addIcon',
    'removeIcon',
    'hideAdd',
    'classNames',
    'styles',
    'class',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-tabs`
  const [, hashId] = useTabsStyle(prefixCls())
  const [innerActiveKey, setInnerActiveKey] = createSignal(
    getDefaultActiveKey(local.items, local.defaultActiveKey),
  )
  const items = () => local.items ?? []
  const mergedActiveKey = createMemo(() => local.activeKey ?? innerActiveKey())
  const type = () => local.type ?? 'line'
  const size = () => local.size ?? config.componentSize()
  const tabPosition = () => local.tabPosition ?? 'top'
  const tabId = (key: string) => `${prefixCls()}-tab-${keyToId(key)}`
  const panelId = (key: string) => `${prefixCls()}-panel-${keyToId(key)}`

  createEffect(() => {
    if (local.activeKey !== undefined) return
    const activeKey = innerActiveKey()
    const activeItem = items().find((item) => item.key === activeKey && !item.disabled)
    if (!activeItem) setInnerActiveKey(getDefaultActiveKey(items(), local.defaultActiveKey))
  })

  const handleTabClick = (item: TabsItem) => {
    if (item.disabled || item.key === mergedActiveKey()) return
    local.onChange?.(item.key)
    if (local.activeKey === undefined) {
      setInnerActiveKey(item.key)
    }
  }
  const enabledItems = () => items().filter((item) => !item.disabled)
  const focusTab = (item: TabsItem) => {
    const element = document.getElementById(tabId(item.key))
    element?.focus()
    handleTabClick(item)
  }
  const handleKeyDown = (event: KeyboardEvent, item: TabsItem) => {
    const candidates = enabledItems()
    if (!candidates.length) return
    const currentIndex = Math.max(
      candidates.findIndex((candidate) => candidate.key === item.key),
      candidates.findIndex((candidate) => candidate.key === mergedActiveKey()),
      0,
    )
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      focusTab(candidates[(currentIndex + 1) % candidates.length])
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      focusTab(candidates[(currentIndex - 1 + candidates.length) % candidates.length])
    }
    if (event.key === 'Home') {
      event.preventDefault()
      focusTab(candidates[0])
    }
    if (event.key === 'End') {
      event.preventDefault()
      focusTab(candidates[candidates.length - 1])
    }
  }
  const nav = () => (
    <div class={`${prefixCls()}-nav`} role="tablist">
      <For each={items()}>
        {(item) => {
          const active = () => item.key === mergedActiveKey()
          return (
            <button
              id={tabId(item.key)}
              type="button"
              role="tab"
              class={classNames(
                `${prefixCls()}-tab`,
                active() && `${prefixCls()}-tab-active`,
                item.disabled && `${prefixCls()}-tab-disabled`,
              )}
              tabIndex={active() && !item.disabled ? 0 : -1}
              aria-selected={active() ? 'true' : 'false'}
              aria-disabled={item.disabled ? 'true' : undefined}
              aria-controls={panelId(item.key)}
              onClick={() => handleTabClick(item)}
              onKeyDown={(event) => handleKeyDown(event, item)}
            >
              {item.label}
            </button>
          )
        }}
      </For>
    </div>
  )
  const pane = (item: TabsItem) => {
    const active = () => item.key === mergedActiveKey()
    return (
      <div
        id={panelId(item.key)}
        role="tabpanel"
        aria-labelledby={tabId(item.key)}
        hidden={!active()}
        aria-hidden={active() ? undefined : 'true'}
        class={classNames(`${prefixCls()}-tabpane`, !active() && `${prefixCls()}-tabpane-hidden`)}
      >
        {item.children}
      </div>
    )
  }
  const content = () => (
    <div class={`${prefixCls()}-content`}>
      <Show
        when={local.destroyInactiveTabPane}
        fallback={<For each={items()}>{(item) => pane(item)}</For>}
      >
        <For each={items().filter((item) => item.key === mergedActiveKey())}>
          {(item) => pane(item)}
        </For>
      </Show>
    </div>
  )

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-${tabPosition()}`,
        `${prefixCls()}-${type()}`,
        `${prefixCls()}-${size()}`,
        hashId(),
        local.class,
      )}
    >
      <Show
        when={tabPosition() === 'bottom'}
        fallback={
          <>
            {nav()}
            {content()}
          </>
        }
      >
        {content()}
        {nav()}
      </Show>
    </div>
  )
}
