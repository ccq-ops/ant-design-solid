import { Show, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useBadgeStyle } from './badge.style'
import type { BadgeProps } from './interface'

export function Badge(props: BadgeProps) {
  const [local, rest] = splitProps(props, [
    'count',
    'dot',
    'status',
    'text',
    'overflowCount',
    'showZero',
    'children',
    'class',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-badge`
  const [, hashId] = useBadgeStyle(prefixCls())
  const overflowCount = () => local.overflowCount ?? 99
  const countText = () => {
    if (typeof local.count === 'number' && local.count > overflowCount()) return `${overflowCount()}+`
    return local.count
  }
  const shouldShowCount = () => {
    if (local.dot) return true
    if (local.count === undefined || local.count === null || local.count === '') return false
    if (local.count === 0 && !local.showZero) return false
    return true
  }
  const hasChildren = () => Boolean(local.children)

  const indicator = () => (
    <Show when={shouldShowCount()}>
      <Show when={local.dot} fallback={<sup class={`${prefixCls()}-count`}>{countText()}</sup>}>
        <sup class={`${prefixCls()}-dot`} />
      </Show>
    </Show>
  )

  return (
    <Show
      when={local.status && !hasChildren()}
      fallback={
        <span
          {...rest}
          class={classNames(
            prefixCls(),
            hasChildren() && `${prefixCls()}-with-children`,
            hashId(),
            local.class,
          )}
        >
          {local.children}
          {indicator()}
        </span>
      }
    >
      <span {...rest} class={classNames(`${prefixCls()}-status`, hashId(), local.class)}>
        <span class={classNames(`${prefixCls()}-status-dot`, `${prefixCls()}-status-${local.status}`)} />
        <Show when={local.text}>
          <span class={`${prefixCls()}-status-text`}>{local.text}</span>
        </Show>
      </span>
    </Show>
  )
}
