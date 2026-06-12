import { For, Show, children, createMemo, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { Skeleton } from '../skeleton'
import { Tabs } from '../tabs'
import { useCardStyle } from './card.style'
import { CardGrid } from './card-grid'
import type {
  CardProps,
  CardSemanticClassNames,
  CardSemanticClassNamesMap,
  CardSemanticStyles,
  CardSemanticStylesMap,
} from './interface'

function isPresent(value: unknown): boolean {
  return value !== undefined && value !== null && value !== false
}

function resolvePrefixCls(customizePrefixCls: string | undefined, fallbackPrefixCls: string) {
  return customizePrefixCls ?? `${fallbackPrefixCls}-card`
}

function resolveSemanticClassNames(
  value: CardSemanticClassNames | undefined,
  props: CardProps,
): CardSemanticClassNamesMap {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function resolveSemanticStyles(
  value: CardSemanticStyles | undefined,
  props: CardProps,
): CardSemanticStylesMap {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function mergeStyle(
  ...styles: Array<string | JSX.CSSProperties | undefined>
): string | JSX.CSSProperties {
  const stringStyle = styles.find((style): style is string => typeof style === 'string')
  if (stringStyle) return stringStyle
  return Object.assign({}, ...styles.filter(Boolean))
}

export function Card(props: CardProps) {
  const [local, rest] = splitProps(props, [
    'prefixCls',
    'rootClass',
    'title',
    'extra',
    'cover',
    'actions',
    'bordered',
    'variant',
    'loading',
    'hoverable',
    'size',
    'type',
    'tabList',
    'tabBarExtraContent',
    'onTabChange',
    'activeTabKey',
    'defaultActiveTabKey',
    'tabProps',
    'classNames',
    'styles',
    'children',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => resolvePrefixCls(local.prefixCls, config.prefixCls())
  const [, hashId] = useCardStyle(prefixCls())
  const semanticClassNames = createMemo(() => resolveSemanticClassNames(local.classNames, props))
  const semanticStyles = createMemo(() => resolveSemanticStyles(local.styles, props))
  const childList = children(() => local.children)
  const childArray = createMemo(() => {
    const value = childList.toArray()
    return value
  })
  const variant = () => local.variant ?? (local.bordered === false ? 'borderless' : 'outlined')
  const size = () => (local.size === 'default' || local.size === undefined ? 'medium' : local.size)
  const hasTabs = () => (local.tabList?.length ?? 0) > 0
  const hasHeader = () => isPresent(local.title) || isPresent(local.extra) || hasTabs()
  const hasActions = () => (local.actions?.length ?? 0) > 0
  const hasGrid = () =>
    childArray().some((child) => {
      if (typeof child !== 'object' || child === null || !('classList' in child)) return false
      return (child as HTMLElement).classList.contains(`${prefixCls()}-grid`)
    })
  const tabItems = createMemo(() =>
    (local.tabList ?? []).map(({ tab, label, ...item }) => ({
      ...item,
      label: label ?? tab,
    })),
  )
  const body = () => (
    <div
      class={classNames(`${prefixCls()}-body`, semanticClassNames().body)}
      style={semanticStyles().body}
    >
      <Show
        when={!local.loading}
        fallback={
          <Skeleton loading active paragraph={{ rows: 4 }} title={false}>
            {local.children}
          </Skeleton>
        }
      >
        {childArray()}
      </Show>
    </div>
  )

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        variant() === 'outlined' && `${prefixCls()}-bordered`,
        variant() === 'borderless' && `${prefixCls()}-borderless`,
        local.hoverable && `${prefixCls()}-hoverable`,
        size() === 'small' && `${prefixCls()}-small`,
        local.type === 'inner' && `${prefixCls()}-type-inner`,
        hasGrid() && `${prefixCls()}-contain-grid`,
        hashId(),
        semanticClassNames().root,
        local.class,
        local.rootClass,
      )}
      classList={local.classList}
      style={mergeStyle(semanticStyles().root, local.style)}
    >
      <Show when={isPresent(local.cover)}>
        <div
          class={classNames(`${prefixCls()}-cover`, semanticClassNames().cover)}
          style={semanticStyles().cover}
        >
          {local.cover}
        </div>
      </Show>
      <Show when={hasHeader()}>
        <div
          class={classNames(`${prefixCls()}-head`, semanticClassNames().header)}
          style={semanticStyles().header}
        >
          <div class={`${prefixCls()}-head-wrapper`}>
            <Show when={isPresent(local.title)}>
              <div
                class={classNames(`${prefixCls()}-head-title`, semanticClassNames().title)}
                style={semanticStyles().title}
              >
                {local.title}
              </div>
            </Show>
            <Show when={isPresent(local.extra)}>
              <div
                class={classNames(`${prefixCls()}-extra`, semanticClassNames().extra)}
                style={semanticStyles().extra}
              >
                {local.extra}
              </div>
            </Show>
          </div>
          <Show when={hasTabs()}>
            <Tabs
              {...local.tabProps}
              class={classNames(`${prefixCls()}-head-tabs`, local.tabProps?.class)}
              items={tabItems()}
              size={size() === 'small' ? 'small' : 'large'}
              activeKey={local.activeTabKey}
              defaultActiveKey={local.defaultActiveTabKey}
              tabBarExtraContent={local.tabBarExtraContent}
              onChange={local.onTabChange}
            />
          </Show>
        </div>
      </Show>
      {body()}
      <Show when={hasActions()}>
        <ul
          class={classNames(`${prefixCls()}-actions`, semanticClassNames().actions)}
          style={semanticStyles().actions}
        >
          <For each={local.actions}>
            {(action) => (
              <li style={{ width: `${100 / (local.actions?.length ?? 1)}%` }}>
                <span>{action}</span>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  )
}

export { CardGrid }
