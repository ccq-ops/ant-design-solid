import { Show, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { ResultProps, ResultStatus } from './interface'
import { useResultStyle } from './result.style'

const statusIcon: Record<ResultStatus, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '!',
  '404': '404',
  '403': '403',
  '500': '500',
}

export function Result(props: ResultProps) {
  const [local, rest] = splitProps(props, [
    'status',
    'title',
    'subTitle',
    'icon',
    'extra',
    'children',
    'prefixCls',
    'class',
    'classList',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-result`
  const [, hashId] = useResultStyle(prefixCls())
  const status = () => local.status ?? 'info'

  return (
    <div
      {...rest}
      class={classNames(prefixCls(), `${prefixCls()}-${status()}`, hashId(), local.class)}
      classList={local.classList}
    >
      <div class={`${prefixCls()}-icon`}>{local.icon ?? statusIcon[status()]}</div>
      <Show when={local.title !== undefined && local.title !== null}>
        <div class={`${prefixCls()}-title`}>{local.title}</div>
      </Show>
      <Show when={local.subTitle !== undefined && local.subTitle !== null}>
        <div class={`${prefixCls()}-subtitle`}>{local.subTitle}</div>
      </Show>
      <Show when={local.extra !== undefined && local.extra !== null}>
        <div class={`${prefixCls()}-extra`}>{local.extra}</div>
      </Show>
      <Show when={local.children !== undefined && local.children !== null}>
        <div class={`${prefixCls()}-content`}>{local.children}</div>
      </Show>
    </div>
  )
}
