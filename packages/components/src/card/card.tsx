import { For, Show, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useCardStyle } from './card.style'
import type { CardProps } from './interface'

function isPresent(value: unknown): boolean {
  return value !== undefined && value !== null && value !== false
}

export function Card(props: CardProps) {
  const [local, rest] = splitProps(props, [
    'title',
    'extra',
    'cover',
    'actions',
    'bordered',
    'hoverable',
    'size',
    'children',
    'class',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-card`
  const [, hashId] = useCardStyle(prefixCls())
  const bordered = () => local.bordered ?? true
  const size = () => local.size ?? 'default'
  const hasHeader = () => isPresent(local.title) || isPresent(local.extra)
  const hasActions = () => (local.actions?.length ?? 0) > 0

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        bordered() && `${prefixCls()}-bordered`,
        local.hoverable && `${prefixCls()}-hoverable`,
        size() === 'small' && `${prefixCls()}-small`,
        hashId(),
        local.class,
      )}
    >
      <Show when={isPresent(local.cover)}>
        <div class={`${prefixCls()}-cover`}>{local.cover}</div>
      </Show>
      <Show when={hasHeader()}>
        <div class={`${prefixCls()}-head`}>
          <Show when={isPresent(local.title)}>
            <div class={`${prefixCls()}-head-title`}>{local.title}</div>
          </Show>
          <Show when={isPresent(local.extra)}>
            <div class={`${prefixCls()}-extra`}>{local.extra}</div>
          </Show>
        </div>
      </Show>
      <div class={`${prefixCls()}-body`}>{local.children}</div>
      <Show when={hasActions()}>
        <ul class={`${prefixCls()}-actions`}>
          <For each={local.actions}>{(action) => <li>{action}</li>}</For>
        </ul>
      </Show>
    </div>
  )
}
