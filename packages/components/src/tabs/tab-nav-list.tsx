import { CloseOutlined, PlusOutlined } from '@ant-design-solid/icons'
import { For, Show } from 'solid-js'
import type { JSX } from 'solid-js'
import { classNames } from '../shared/class-names'
import type {
  TabsItem,
  TabsSemanticClassNamesMap,
  TabsSemanticStylesMap,
  TabsType,
} from './interface'

export interface TabNavListProps {
  items: TabsItem[]
  activeKey: string
  prefixCls: string
  type: TabsType
  tabId: (key: string) => string
  panelId: (key: string) => string
  renderedPanelKeys: Set<string>
  classNames: TabsSemanticClassNamesMap
  styles: TabsSemanticStylesMap
  addIcon?: JSX.Element
  removeIcon?: JSX.Element
  hideAdd?: boolean
  onEdit?: (targetKey: string | MouseEvent, action: 'add' | 'remove') => void
  onTabActivate: (item: TabsItem, event: MouseEvent | KeyboardEvent) => void
}

export function TabNavList(props: TabNavListProps) {
  const enabledItems = () => props.items.filter((item) => !item.disabled)
  const editable = () => props.type === 'editable-card'
  const closable = (item: TabsItem) => item.closable !== false && item.closeIcon !== false
  const hasCustomCloseIcon = (item: TabsItem) =>
    item.closeIcon !== undefined && item.closeIcon !== null
      ? item.closeIcon !== false
      : !!props.removeIcon
  const closeIcon = (item: TabsItem) => item.closeIcon ?? props.removeIcon ?? <CloseOutlined />
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
      class={classNames(`${props.prefixCls}-nav`, props.classNames.header)}
      style={props.styles.header}
      role="tablist"
    >
      <For each={props.items}>
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
                {item.label}
              </button>
              <Show when={editable() && closable(item)}>
                <button
                  type="button"
                  class={classNames(`${props.prefixCls}-tab-remove`, props.classNames.remove)}
                  style={props.styles.remove}
                  aria-label={hasCustomCloseIcon(item) ? undefined : 'close'}
                  onClick={(event) => handleRemove(event, item)}
                >
                  {closeIcon(item)}
                </button>
              </Show>
            </span>
          )
        }}
      </For>
      <Show when={editable() && !props.hideAdd}>
        <button
          type="button"
          class={`${props.prefixCls}-add`}
          aria-label={props.addIcon ? undefined : 'add'}
          onClick={handleAdd}
        >
          {props.addIcon ?? <PlusOutlined />}
        </button>
      </Show>
    </div>
  )
}
