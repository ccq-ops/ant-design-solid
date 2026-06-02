import { For, Show, createMemo, createSignal, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useTabsStyle } from './tabs.style'
import type { TabsItem, TabsProps } from './interface'

function getDefaultActiveKey(items: TabsItem[], defaultActiveKey?: string) {
  if (defaultActiveKey && items.some((item) => item.key === defaultActiveKey && !item.disabled)) {
    return defaultActiveKey
  }
  return items.find((item) => !item.disabled)?.key ?? items[0]?.key ?? ''
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
    'destroyInactiveTabPane',
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
  const handleTabClick = (item: TabsItem) => {
    if (item.disabled || item.key === mergedActiveKey()) return
    local.onChange?.(item.key)
    if (local.activeKey === undefined) {
      setInnerActiveKey(item.key)
    }
  }
  const nav = () => (
    <div class={`${prefixCls()}-nav`} role="tablist">
      <For each={items()}>
        {(item) => {
          const active = () => item.key === mergedActiveKey()
          return (
            <button
              type="button"
              role="tab"
              class={classNames(
                `${prefixCls()}-tab`,
                active() && `${prefixCls()}-tab-active`,
                item.disabled && `${prefixCls()}-tab-disabled`,
              )}
              aria-selected={active() ? 'true' : 'false'}
              aria-disabled={item.disabled ? 'true' : undefined}
              onClick={() => handleTabClick(item)}
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
        role="tabpanel"
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
