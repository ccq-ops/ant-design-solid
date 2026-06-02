import { Show, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useDividerStyle } from './divider.style'
import type { DividerProps } from './interface'

export function Divider(props: DividerProps) {
  const [local, rest] = splitProps(props, [
    'type',
    'orientation',
    'dashed',
    'plain',
    'children',
    'class',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-divider`
  const [, hashId] = useDividerStyle(prefixCls())
  const type = () => local.type ?? 'horizontal'
  const orientation = () => local.orientation ?? 'center'
  const hasText = () => type() === 'horizontal' && local.children !== undefined && local.children !== null

  return (
    <div
      {...rest}
      role={type() === 'vertical' ? 'separator' : undefined}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-${type()}`,
        hasText() && `${prefixCls()}-with-text`,
        hasText() && `${prefixCls()}-with-text-${orientation()}`,
        local.dashed && `${prefixCls()}-dashed`,
        local.plain && `${prefixCls()}-plain`,
        hashId(),
        local.class,
      )}
    >
      <Show when={hasText()}>
        <span class={`${prefixCls()}-inner-text`}>{local.children}</span>
      </Show>
    </div>
  )
}
