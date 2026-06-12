import { Show, createEffect, createMemo, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { TabNavListProps } from './tab-nav-list'
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

function sameSet(left: Set<string>, right: Set<string>) {
  if (left.size !== right.size) return false
  for (const value of left) {
    if (!right.has(value)) return false
  }
  return true
}

function parseStyleText(style: string): JSX.CSSProperties {
  return Object.fromEntries(
    style
      .split(';')
      .map((declaration) => declaration.trim())
      .filter(Boolean)
      .map((declaration) => {
        const separatorIndex = declaration.indexOf(':')
        if (separatorIndex === -1) return []
        return [
          declaration.slice(0, separatorIndex).trim(),
          declaration.slice(separatorIndex + 1).trim(),
        ]
      })
      .filter((entry) => entry.length === 2),
  ) as JSX.CSSProperties
}

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
  const rootStyle = () => {
    const localStyle =
      typeof local.style === 'string'
        ? parseStyleText(local.style)
        : (local.style as JSX.CSSProperties | undefined)
    return mergeStyle(semanticStyles().root, localStyle)
  }
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
      return sameSet(previous, next) ? previous : next
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
    local.onTabClick?.(item.key, event)
    if (item.key === mergedActiveKey()) return
    local.onChange?.(item.key)
    if (local.activeKey === undefined) {
      setInnerActiveKey(item.key)
    }
  }
  const defaultTabBarProps = (): TabNavListProps => ({
    get items() {
      return items()
    },
    get activeKey() {
      return mergedActiveKey()
    },
    get prefixCls() {
      return prefixCls()
    },
    get type() {
      return type()
    },
    get tabPlacement() {
      return tabPosition()
    },
    tabId,
    panelId,
    get renderedPanelKeys() {
      return renderedPanelKeys()
    },
    get classNames() {
      return semanticClassNames()
    },
    get styles() {
      return semanticStyles()
    },
    get animated() {
      return local.animated
    },
    get centered() {
      return local.centered
    },
    get indicator() {
      return local.indicator
    },
    get more() {
      return local.more
    },
    get tabBarExtraContent() {
      return local.tabBarExtraContent
    },
    get tabBarGutter() {
      return local.tabBarGutter
    },
    get tabBarStyle() {
      return local.tabBarStyle
    },
    get addIcon() {
      return local.addIcon
    },
    get removeIcon() {
      return local.removeIcon
    },
    get hideAdd() {
      return local.hideAdd
    },
    get onEdit() {
      return local.onEdit
    },
    get onTabScroll() {
      return local.onTabScroll
    },
    onTabActivate: handleTabActivate,
  })
  const nav = () => {
    const tabBarProps = defaultTabBarProps()
    return local.renderTabBar ? (
      local.renderTabBar(tabBarProps, TabNavList)
    ) : (
      <TabNavList {...tabBarProps} />
    )
  }
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
        local.centered && `${prefixCls()}-centered`,
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
