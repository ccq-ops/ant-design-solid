import { For } from 'solid-js'
import { classNames } from '../shared/class-names'
import type { TabsItem, TabsSemanticClassNamesMap, TabsSemanticStylesMap } from './interface'

export interface TabNavListProps {
  items: TabsItem[]
  activeKey: string
  prefixCls: string
  tabId: (key: string) => string
  panelId: (key: string) => string
  onTabClick: (item: TabsItem, event?: MouseEvent) => void
  classNames?: TabsSemanticClassNamesMap
  styles?: TabsSemanticStylesMap
}

export function TabNavList(props: TabNavListProps) {
  const enabledItems = () => props.items.filter((item) => !item.disabled)
  const focusTab = (item: TabsItem) => {
    const element = document.getElementById(props.tabId(item.key))
    element?.focus()
    props.onTabClick(item)
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

  return (
    <div class={classNames(`${props.prefixCls}-nav`, props.classNames?.header)} role="tablist">
      <For each={props.items}>
        {(item) => {
          const active = () => item.key === props.activeKey
          return (
            <button
              id={props.tabId(item.key)}
              type="button"
              role="tab"
              class={classNames(
                `${props.prefixCls}-tab`,
                active() && `${props.prefixCls}-tab-active`,
                item.disabled && `${props.prefixCls}-tab-disabled`,
                props.classNames?.item,
              )}
              style={props.styles?.item}
              tabIndex={active() && !item.disabled ? 0 : -1}
              aria-selected={active() ? 'true' : 'false'}
              aria-disabled={item.disabled ? 'true' : undefined}
              aria-controls={props.panelId(item.key)}
              onClick={(event) => props.onTabClick(item, event)}
              onKeyDown={(event) => handleKeyDown(event, item)}
            >
              {item.label}
            </button>
          )
        }}
      </For>
    </div>
  )
}
