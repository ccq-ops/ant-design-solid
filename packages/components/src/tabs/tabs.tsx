import { Show, createEffect, createMemo, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { TabNavList } from './tab-nav-list'
import { TabPanelList } from './tab-panel-list'
import { useTabsStyle } from './tabs.style'
import {
  getDefaultActiveKey,
  keyToId,
  mergeStyle,
  resolveDestroyOnHidden,
  resolvePlacement,
  resolveSemanticClassNames,
  resolveSemanticStyles,
} from './tabs-utils'
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
    'style',
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
  const tabPosition = () => resolvePlacement(local)
  const destroyOnHidden = () => resolveDestroyOnHidden(local)
  const semanticClassNames = createMemo(() => resolveSemanticClassNames(local.classNames, props))
  const semanticStyles = createMemo(() => resolveSemanticStyles(local.styles, props))
  const rootStyle = () =>
    typeof local.style === 'string'
      ? local.style
      : mergeStyle(semanticStyles().root, local.style as JSX.CSSProperties | undefined)
  const tabId = (key: string) => `${prefixCls()}-tab-${keyToId(key)}`
  const panelId = (key: string) => `${prefixCls()}-panel-${keyToId(key)}`
  const [visitedKeys, setVisitedKeys] = createSignal<Set<string>>(new Set())

  createEffect(() => {
    if (local.activeKey !== undefined) return
    const activeKey = innerActiveKey()
    const activeItem = items().find((item) => item.key === activeKey && !item.disabled)
    if (!activeItem) setInnerActiveKey(getDefaultActiveKey(items(), local.defaultActiveKey))
  })

  createEffect(() => {
    const itemKeys = new Set(items().map((item) => item.key))
    const activeKey = mergedActiveKey()
    setVisitedKeys((previous) => {
      const next = new Set([...previous].filter((key) => itemKeys.has(key)))
      if (itemKeys.has(activeKey)) {
        next.add(activeKey)
      }
      return next
    })
  })

  const shouldRenderPanel = (item: TabsItem) => {
    const active = item.key === mergedActiveKey()
    if (destroyOnHidden() || item.destroyOnHidden) return active
    if (active || item.forceRender) return true
    return visitedKeys().has(item.key)
  }
  const renderedPanelKeys = () =>
    new Set(
      items()
        .filter(shouldRenderPanel)
        .map((item) => item.key),
    )
  const renderedItems = () => items().filter(shouldRenderPanel)

  const handleTabActivate = (item: TabsItem, event: MouseEvent | KeyboardEvent) => {
    if (item.disabled) return
    local.onTabClick?.(item.key, event as MouseEvent)
    if (item.key === mergedActiveKey()) return
    local.onChange?.(item.key)
    if (local.activeKey === undefined) {
      setInnerActiveKey(item.key)
    }
  }
  const nav = () => (
    <TabNavList
      items={items()}
      activeKey={mergedActiveKey()}
      prefixCls={prefixCls()}
      tabId={tabId}
      panelId={panelId}
      renderedPanelKeys={renderedPanelKeys()}
      classNames={semanticClassNames()}
      styles={semanticStyles()}
      onTabActivate={handleTabActivate}
    />
  )
  const content = () => (
    <TabPanelList
      items={renderedItems()}
      activeKey={mergedActiveKey()}
      prefixCls={prefixCls()}
      tabId={tabId}
      panelId={panelId}
      classNames={semanticClassNames()}
      styles={semanticStyles()}
    />
  )
  const navFirst = () => tabPosition() === 'top' || tabPosition() === 'start'

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-${tabPosition()}`,
        `${prefixCls()}-${type()}`,
        `${prefixCls()}-${size()}`,
        hashId(),
        semanticClassNames().root,
        local.class,
      )}
      style={rootStyle()}
    >
      <Show
        when={navFirst()}
        fallback={
          <>
            {content()}
            {nav()}
          </>
        }
      >
        {nav()}
        {content()}
      </Show>
    </div>
  )
}
