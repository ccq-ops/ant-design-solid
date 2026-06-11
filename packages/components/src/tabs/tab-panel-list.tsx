import { For, createEffect, createSignal } from 'solid-js'
import { classNames } from '../shared/class-names'
import { mergeStyle } from './tabs-utils'
import type { TabsItem, TabsSemanticClassNamesMap, TabsSemanticStylesMap } from './interface'

export interface TabPanelListProps {
  items: TabsItem[]
  activeKey: string
  prefixCls: string
  tabId: (key: string) => string
  panelId: (key: string) => string
  destroyOnHidden?: boolean
  classNames?: TabsSemanticClassNamesMap
  styles?: TabsSemanticStylesMap
}

export function TabPanelList(props: TabPanelListProps) {
  const [visitedKeys, setVisitedKeys] = createSignal(new Set([props.activeKey]))

  createEffect(() => {
    setVisitedKeys((previous) => new Set([...previous, props.activeKey]))
  })

  const shouldRender = (item: TabsItem) => {
    const active = item.key === props.activeKey
    if (active || item.forceRender) return true
    if (props.destroyOnHidden || item.destroyOnHidden) return false
    return visitedKeys().has(item.key)
  }

  return (
    <div
      class={classNames(`${props.prefixCls}-content`, props.classNames?.content)}
      style={props.styles?.content}
    >
      <For each={props.items.filter(shouldRender)}>
        {(item) => {
          const active = () => item.key === props.activeKey
          return (
            <div
              id={props.panelId(item.key)}
              role="tabpanel"
              aria-labelledby={props.tabId(item.key)}
              hidden={!active()}
              aria-hidden={active() ? undefined : 'true'}
              class={classNames(
                `${props.prefixCls}-tabpane`,
                !active() && `${props.prefixCls}-tabpane-hidden`,
                item.class,
              )}
              style={mergeStyle(item.style)}
            >
              {item.children}
            </div>
          )
        }}
      </For>
    </div>
  )
}
