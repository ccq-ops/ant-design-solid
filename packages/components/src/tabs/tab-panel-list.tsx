import { For } from 'solid-js'
import { classNames } from '../shared/class-names'
import type { TabsItem } from './interface'

export interface TabPanelListProps {
  items: TabsItem[]
  activeKey: string
  prefixCls: string
  tabId: (key: string) => string
  panelId: (key: string) => string
}

export function TabPanelList(props: TabPanelListProps) {
  return (
    <div class={`${props.prefixCls}-content`}>
      <For each={props.items}>
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
              )}
            >
              {item.children}
            </div>
          )
        }}
      </For>
    </div>
  )
}
