import { Show, createEffect, createMemo, createSignal, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { TabNavList } from './tab-nav-list'
import { TabPanelList } from './tab-panel-list'
import { useTabsStyle } from './tabs.style'
import {
  getDefaultActiveKey,
  keyToId,
  resolveSemanticClassNames,
  resolveSemanticStyles,
  resolveDestroyOnHidden,
  resolvePlacement,
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
  const semanticClassNames = () => resolveSemanticClassNames(local.classNames, props)
  const semanticStyles = () => resolveSemanticStyles(local.styles, props)
  const tabId = (key: string) => `${prefixCls()}-tab-${keyToId(key)}`
  const panelId = (key: string) => `${prefixCls()}-panel-${keyToId(key)}`

  createEffect(() => {
    if (local.activeKey !== undefined) return
    const activeKey = innerActiveKey()
    const activeItem = items().find((item) => item.key === activeKey && !item.disabled)
    if (!activeItem) setInnerActiveKey(getDefaultActiveKey(items(), local.defaultActiveKey))
  })

  const handleTabClick = (item: TabsItem, event?: MouseEvent) => {
    if (item.disabled) return
    if (event) local.onTabClick?.(item.key, event)
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
      onTabClick={handleTabClick}
      classNames={semanticClassNames()}
      styles={semanticStyles()}
    />
  )
  const content = () => (
    <TabPanelList
      items={items()}
      activeKey={mergedActiveKey()}
      prefixCls={prefixCls()}
      tabId={tabId}
      panelId={panelId}
      destroyOnHidden={destroyOnHidden()}
      classNames={semanticClassNames()}
      styles={semanticStyles()}
    />
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
