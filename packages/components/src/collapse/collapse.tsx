import { For, Show, createMemo, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useCollapseStyle } from './collapse.style'
import type {
  CollapseActiveKey,
  CollapseCollapsible,
  CollapseExpandIconProps,
  CollapseItem,
  CollapseKey,
  CollapseProps,
  CollapseSemanticClassNames,
  CollapseSemanticClassNamesMap,
  CollapseSemanticStyles,
  CollapseSemanticStylesMap,
} from './interface'

function normalizeActiveKey(activeKey: CollapseActiveKey | undefined): CollapseKey[] {
  if (activeKey === undefined) return []
  return Array.isArray(activeKey) ? activeKey : [activeKey]
}

function toAccordionKey(activeKeys: CollapseKey[]): CollapseKey | undefined {
  return activeKeys[0]
}

function keyToId(key: CollapseKey) {
  return String(key).replace(/[^a-zA-Z0-9_-]/g, '-')
}

function isDisabled(item: CollapseItem, rootCollapsible: CollapseCollapsible | undefined) {
  return item.disabled || item.collapsible === 'disabled' || rootCollapsible === 'disabled'
}

function resolveSemanticClassNames(
  value: CollapseSemanticClassNames | undefined,
  props: CollapseProps,
): CollapseSemanticClassNamesMap {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function resolveSemanticStyles(
  value: CollapseSemanticStyles | undefined,
  props: CollapseProps,
): CollapseSemanticStylesMap {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function mergeStyle(
  ...styles: Array<string | JSX.CSSProperties | undefined>
): string | JSX.CSSProperties {
  const stringStyle = styles.find((style): style is string => typeof style === 'string')
  if (stringStyle) return stringStyle
  return Object.assign({}, ...styles.filter(Boolean))
}

export function Collapse(props: CollapseProps) {
  const [local, rest] = splitProps(props, [
    'items',
    'activeKey',
    'defaultActiveKey',
    'accordion',
    'bordered',
    'ghost',
    'destroyInactivePanel',
    'destroyOnHidden',
    'size',
    'collapsible',
    'expandIcon',
    'expandIconPlacement',
    'expandIconPosition',
    'onChange',
    'rootClass',
    'classNames',
    'styles',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-collapse`
  const [, hashId] = useCollapseStyle(prefixCls())
  const collapseConfig = () => config.collapse()
  const [innerActiveKeys, setInnerActiveKeys] = createSignal(
    normalizeActiveKey(local.defaultActiveKey),
  )
  const items = () => local.items ?? []
  const bordered = () => local.bordered ?? true
  const size = () => local.size ?? collapseConfig().size ?? config.componentSize()
  const collapseSize = () => (size() === 'middle' ? 'medium' : size())
  const expandIconPlacement = () =>
    local.expandIconPlacement ??
    collapseConfig().expandIconPlacement ??
    local.expandIconPosition ??
    collapseConfig().expandIconPosition ??
    'start'
  const destroyOnHidden = () => local.destroyOnHidden ?? local.destroyInactivePanel ?? false
  const semanticClassNames = createMemo(() =>
    resolveSemanticClassNames(local.classNames ?? collapseConfig().classNames, props),
  )
  const semanticStyles = createMemo(() =>
    resolveSemanticStyles(local.styles ?? collapseConfig().styles, props),
  )
  const mergedExpandIcon = () => local.expandIcon ?? collapseConfig().expandIcon
  const mergedActiveKeys = createMemo(() =>
    normalizeActiveKey(local.activeKey ?? innerActiveKeys()),
  )
  const headerId = (key: CollapseKey) => `${prefixCls()}-header-${keyToId(key)}`
  const contentId = (key: CollapseKey) => `${prefixCls()}-content-${keyToId(key)}`

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

  const shouldRenderContent = (item: CollapseItem, active: boolean) =>
    active || item.forceRender || !destroyOnHidden()

  const renderExpandIcon = (item: CollapseItem, active: boolean) => {
    const panelProps: CollapseExpandIconProps = {
      key: item.key,
      isActive: active,
      label: item.label,
      children: item.children,
      extra: item.extra,
      showArrow: item.showArrow,
      forceRender: item.forceRender,
      collapsible: item.collapsible ?? local.collapsible,
    }
    return typeof mergedExpandIcon() === 'function' ? mergedExpandIcon()?.(panelProps) : '›'
  }

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        !bordered() && `${prefixCls()}-borderless`,
        local.ghost && `${prefixCls()}-ghost`,
        collapseSize() === 'large' && `${prefixCls()}-large`,
        collapseSize() === 'small' && `${prefixCls()}-small`,
        `${prefixCls()}-icon-placement-${expandIconPlacement()}`,
        local.expandIconPlacement === undefined &&
          local.expandIconPosition !== undefined &&
          `${prefixCls()}-icon-position-${local.expandIconPosition}`,
        hashId(),
        semanticClassNames().root,
        collapseConfig().class,
        local.class,
        local.rootClass,
      )}
      classList={local.classList}
      style={mergeStyle(semanticStyles().root, collapseConfig().style, local.style)}
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
                item.showArrow === false && `${prefixCls()}-no-arrow`,
                item.class,
              )}
              style={item.style}
            >
              <div
                class={classNames(
                  `${prefixCls()}-header`,
                  semanticClassNames().header,
                  item.classNames?.header,
                )}
                style={mergeStyle(semanticStyles().header, item.styles?.header)}
              >
                <Show when={item.showArrow !== false}>
                  <button
                    type="button"
                    class={classNames(`${prefixCls()}-expand-icon`, semanticClassNames().icon)}
                    style={semanticStyles().icon}
                    aria-label={`Toggle ${String(item.label)}`}
                    aria-expanded={active() ? 'true' : 'false'}
                    aria-controls={contentId(item.key)}
                    disabled={!canIconToggle(item)}
                    onClick={() => toggleItem(item)}
                    onKeyDown={(event) => handleKeyDown(event, item)}
                  >
                    <span aria-hidden="true">{renderExpandIcon(item, active())}</span>
                  </button>
                </Show>
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
                  <span
                    class={classNames(`${prefixCls()}-header-text`, semanticClassNames().title)}
                    style={semanticStyles().title}
                  >
                    {item.label}
                  </span>
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
                <Show when={shouldRenderContent(item, active())}>
                  <div
                    class={classNames(
                      `${prefixCls()}-content-box`,
                      semanticClassNames().body,
                      item.classNames?.body,
                    )}
                    style={mergeStyle(semanticStyles().body, item.styles?.body)}
                  >
                    {item.children}
                  </div>
                </Show>
              </div>
            </div>
          )
        }}
      </For>
    </div>
  )
}
