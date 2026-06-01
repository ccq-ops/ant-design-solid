import { splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { ColProps } from './interface'
export function Col(props: ColProps) {
  const [local, rest] = splitProps(props, [
    'span',
    'offset',
    'order',
    'push',
    'pull',
    'class',
    'style',
    'children',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-col`
  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        local.span !== undefined && `${prefixCls()}-${local.span}`,
        local.offset !== undefined && `${prefixCls()}-offset-${local.offset}`,
        local.push !== undefined && `${prefixCls()}-push-${local.push}`,
        local.pull !== undefined && `${prefixCls()}-pull-${local.pull}`,
        local.class,
      )}
      style={{
        order: local.order,
        'padding-left': '8px',
        'padding-right': '8px',
        ...(typeof local.style === 'object' ? local.style : {}),
      }}
    >
      {local.children}
    </div>
  )
}
