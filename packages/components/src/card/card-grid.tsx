import { splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { CardGridProps } from './interface'

function resolvePrefixCls(customizePrefixCls: string | undefined, fallbackPrefixCls: string) {
  return customizePrefixCls ?? `${fallbackPrefixCls}-card`
}

export function CardGrid(props: CardGridProps) {
  const [local, rest] = splitProps(props, ['prefixCls', 'hoverable', 'class'])
  const config = useConfig()
  const prefixCls = () => resolvePrefixCls(local.prefixCls, config.prefixCls())
  const hoverable = () => local.hoverable ?? true

  return (
    <div
      {...rest}
      class={classNames(
        `${prefixCls()}-grid`,
        hoverable() && `${prefixCls()}-grid-hoverable`,
        local.class,
      )}
    />
  )
}
