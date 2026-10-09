import { createEffect, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { setComponentRef } from '../shared/component-ref'
import type { CardGridProps } from './interface'

function resolvePrefixCls(customizePrefixCls: string | undefined, fallbackPrefixCls: string) {
  return customizePrefixCls ?? `${fallbackPrefixCls}-card`
}

export function CardGrid(props: CardGridProps) {
  const [local, rest] = splitProps(props, ['prefixCls', 'hoverable', 'class', 'ref'])
  const config = useConfig()
  let rootRef: HTMLDivElement | undefined
  const gridRef = {
    get nativeElement() {
      return rootRef
    },
  }
  createEffect(() => setComponentRef(local.ref, gridRef))
  const prefixCls = () => resolvePrefixCls(local.prefixCls, config.prefixCls())
  const hoverable = () => local.hoverable ?? true

  return (
    <div
      {...rest}
      ref={(element) => {
        rootRef = element
      }}
      class={classNames(
        `${prefixCls()}-grid`,
        hoverable() && `${prefixCls()}-grid-hoverable`,
        local.class,
      )}
    />
  )
}
