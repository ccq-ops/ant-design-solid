import { For, Show, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { ListItemMetaProps, ListItemProps, ListProps } from './interface'
import { useListStyle } from './list.style'

function isPresent(value: unknown): boolean {
  return value !== undefined && value !== null && value !== false
}

export function ListItemMeta(props: ListItemMetaProps) {
  const [local, rest] = splitProps(props, [
    'avatar',
    'title',
    'description',
    'children',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-list-item-meta`

  return (
    <div
      {...rest}
      class={classNames(prefixCls(), local.class)}
      classList={local.classList}
      style={local.style}
    >
      <Show when={isPresent(local.avatar)}>
        <div class={`${prefixCls()}-avatar`}>{local.avatar}</div>
      </Show>
      <div class={`${prefixCls()}-content`}>
        <Show when={isPresent(local.title)}>
          <div class={`${prefixCls()}-title`}>{local.title}</div>
        </Show>
        <Show when={isPresent(local.description)}>
          <div class={`${prefixCls()}-description`}>{local.description}</div>
        </Show>
        {local.children}
      </div>
    </div>
  )
}

export function ListItem(props: ListItemProps) {
  const [local, rest] = splitProps(props, [
    'actions',
    'extra',
    'children',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-list-item`
  const actions = () => local.actions ?? []
  const hasActions = () => actions().length > 0

  return (
    <li
      {...rest}
      class={classNames(prefixCls(), local.class)}
      classList={local.classList}
      style={local.style}
    >
      <div class={`${prefixCls()}-main`}>{local.children}</div>
      <Show when={hasActions()}>
        <ul class={`${prefixCls()}-actions`}>
          <For each={actions()}>
            {(action) => <li class={`${prefixCls()}-action`}>{action}</li>}
          </For>
        </ul>
      </Show>
      <Show when={isPresent(local.extra)}>
        <div class={`${prefixCls()}-extra`}>{local.extra}</div>
      </Show>
    </li>
  )
}

export function ListRoot<T = unknown>(props: ListProps<T>) {
  const [local, rest] = splitProps(props, [
    'dataSource',
    'renderItem',
    'header',
    'footer',
    'bordered',
    'split',
    'size',
    'loading',
    'emptyText',
    'children',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-list`
  const [, hashId] = useListStyle(prefixCls())
  const data = () => local.dataSource ?? []
  const hasDataSource = () => local.dataSource !== undefined
  const split = () => local.split ?? true
  const size = () => local.size ?? 'default'
  const hasHeader = () => isPresent(local.header)
  const hasFooter = () => isPresent(local.footer)
  const hasDataItems = () => hasDataSource() && data().length > 0 && Boolean(local.renderItem)
  const hasChildren = () => !hasDataSource() && isPresent(local.children)
  const isEmpty = () => !local.loading && !hasDataItems() && !hasChildren()

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        local.bordered && `${prefixCls()}-bordered`,
        split() && `${prefixCls()}-split`,
        size() !== 'default' && `${prefixCls()}-${size()}`,
        hashId(),
        local.class,
      )}
      classList={local.classList}
      style={local.style}
    >
      <Show when={hasHeader()}>
        <div class={`${prefixCls()}-header`}>{local.header}</div>
      </Show>
      <Show when={!local.loading} fallback={<div class={`${prefixCls()}-loading`}>Loading...</div>}>
        <Show
          when={!isEmpty()}
          fallback={<div class={`${prefixCls()}-empty`}>{local.emptyText ?? 'No Data'}</div>}
        >
          <ul class={`${prefixCls()}-items`}>
            <Show when={hasDataSource()} fallback={local.children}>
              <For each={data()}>{(item, index) => local.renderItem?.(item, index())}</For>
            </Show>
          </ul>
        </Show>
      </Show>
      <Show when={hasFooter()}>
        <div class={`${prefixCls()}-footer`}>{local.footer}</div>
      </Show>
    </div>
  )
}
