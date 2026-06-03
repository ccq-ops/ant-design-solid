import { For, Show, createMemo, createSignal, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useCollapseStyle } from './collapse.style'
import type {
  CollapseActiveKey,
  CollapseCollapsible,
  CollapseItem,
  CollapseKey,
  CollapseProps,
} from './interface'

function normalizeActiveKey(activeKey: CollapseActiveKey | undefined): CollapseKey[] {
  if (activeKey === undefined) return []
  return Array.isArray(activeKey) ? activeKey : [activeKey]
}

function toAccordionKey(activeKeys: CollapseKey[]): CollapseKey | undefined {
  return activeKeys[0]
}

function keyToId(key: string) {
  return key.replace(/[^a-zA-Z0-9_-]/g, '-')
}

function isDisabled(item: CollapseItem, rootCollapsible: CollapseCollapsible | undefined) {
  return item.disabled || item.collapsible === 'disabled' || rootCollapsible === 'disabled'
}

export function Collapse(props: CollapseProps) {
  const [local, rest] = splitProps(props, [
    'items',
    'activeKey',
    'defaultActiveKey',
    'accordion',
    'bordered',
    'ghost',
    'collapsible',
    'expandIconPosition',
    'onChange',
    'class',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-collapse`
  const [, hashId] = useCollapseStyle(prefixCls())
  const [innerActiveKeys, setInnerActiveKeys] = createSignal(
    normalizeActiveKey(local.defaultActiveKey),
  )
  const items = () => local.items ?? []
  const bordered = () => local.bordered ?? true
  const expandIconPosition = () => local.expandIconPosition ?? 'start'
  const mergedActiveKeys = createMemo(() =>
    normalizeActiveKey(local.activeKey ?? innerActiveKeys()),
  )
  const headerId = (key: string) => `${prefixCls()}-header-${keyToId(key)}`
  const contentId = (key: string) => `${prefixCls()}-content-${keyToId(key)}`

  const emitChange = (nextKeys: CollapseKey[]) => {
    if (local.accordion) {
      local.onChange?.(toAccordionKey(nextKeys))
      return
    }
    local.onChange?.(nextKeys)
  }

  const setActiveKeys = (nextKeys: CollapseKey[]) => {
    emitChange(nextKeys)
    if (local.activeKey === undefined) {
      setInnerActiveKeys(nextKeys)
    }
  }

  const toggleItem = (item: CollapseItem) => {
    if (isDisabled(item, local.collapsible)) return
    const activeKeys = mergedActiveKeys()
    const active = activeKeys.includes(item.key)
    if (local.accordion) {
      setActiveKeys(active ? [] : [item.key])
      return
    }
    setActiveKeys(active ? activeKeys.filter((key) => key !== item.key) : [...activeKeys, item.key])
  }

  const handleKeyDown = (event: KeyboardEvent, item: CollapseItem) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    toggleItem(item)
  }

  const canHeaderToggle = (item: CollapseItem) => {
    const collapsible = item.collapsible ?? local.collapsible
    return collapsible !== 'icon' && !isDisabled(item, local.collapsible)
  }

  const canIconToggle = (item: CollapseItem) => {
    const collapsible = item.collapsible ?? local.collapsible
    return collapsible !== 'header' && !isDisabled(item, local.collapsible)
  }

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        !bordered() && `${prefixCls()}-borderless`,
        local.ghost && `${prefixCls()}-ghost`,
        `${prefixCls()}-icon-position-${expandIconPosition()}`,
        hashId(),
        local.class,
      )}
    >
      <For each={items()}>
        {(item) => {
          const active = () => mergedActiveKeys().includes(item.key)
          const disabled = () => isDisabled(item, local.collapsible)
          return (
            <div
              class={classNames(
                `${prefixCls()}-item`,
                active() && `${prefixCls()}-item-active`,
                disabled() && `${prefixCls()}-item-disabled`,
                item.class,
              )}
              style={item.style}
            >
              <div class={`${prefixCls()}-header`}>
                <button
                  type="button"
                  class={`${prefixCls()}-expand-icon`}
                  aria-label={`Toggle ${String(item.label)}`}
                  aria-expanded={active() ? 'true' : 'false'}
                  aria-controls={contentId(item.key)}
                  disabled={!canIconToggle(item)}
                  onClick={() => toggleItem(item)}
                  onKeyDown={(event) => handleKeyDown(event, item)}
                >
                  <span aria-hidden="true">›</span>
                </button>
                <button
                  id={headerId(item.key)}
                  type="button"
                  class={`${prefixCls()}-header-button`}
                  aria-expanded={active() ? 'true' : 'false'}
                  aria-controls={contentId(item.key)}
                  disabled={!canHeaderToggle(item)}
                  onClick={() => toggleItem(item)}
                  onKeyDown={(event) => handleKeyDown(event, item)}
                >
                  <span class={`${prefixCls()}-header-text`}>{item.label}</span>
                </button>
                <Show when={item.extra}>
                  <div class={`${prefixCls()}-extra`}>{item.extra}</div>
                </Show>
              </div>
              <div
                id={contentId(item.key)}
                role="region"
                aria-labelledby={headerId(item.key)}
                hidden={!active()}
                aria-hidden={active() ? undefined : 'true'}
                class={classNames(
                  `${prefixCls()}-content`,
                  !active() && `${prefixCls()}-content-hidden`,
                )}
              >
                <div class={`${prefixCls()}-content-box`}>{item.children}</div>
              </div>
            </div>
          )
        }}
      </For>
    </div>
  )
}
