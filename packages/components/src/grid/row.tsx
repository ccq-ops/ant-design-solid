import { splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { resolveResponsiveValue, useBreakpoint } from '../shared/responsive-observer'
import { RowContext } from './context'
import { useGridStyle } from './grid.style'
import type { Gutter, RowProps } from './interface'

function normalizeGutter(gutter: RowProps['gutter']): [Gutter, Gutter] {
  return Array.isArray(gutter) ? gutter : [gutter ?? 0, undefined]
}

function halfGutter(value: string | number | undefined, divisor: 2 | -2) {
  if (value === undefined || value === 0 || value === '') return undefined
  return typeof value === 'number' ? `${value / divisor}px` : `calc(${value} / ${divisor})`
}

function unit(value: string | number | undefined) {
  if (value === undefined || value === '') return undefined
  return typeof value === 'number' ? `${value}px` : value
}
export function Row(props: RowProps) {
  const [local, rest] = splitProps(props, [
    'gutter',
    'align',
    'justify',
    'prefixCls',
    'wrap',
    'class',
    'style',
    'children',
  ])
  const config = useConfig()
  const screens = useBreakpoint()
  const rowPrefixCls = () => local.prefixCls ?? `${config.prefixCls()}-row`
  const colPrefixCls = () => `${config.prefixCls()}-col`
  const [, hashId] = useGridStyle(rowPrefixCls(), colPrefixCls())
  const gutter = () => {
    const [horizontal, vertical] = normalizeGutter(local.gutter)
    return [
      resolveResponsiveValue(horizontal, screens()),
      resolveResponsiveValue(vertical, screens()),
    ] as [string | number | undefined, string | number | undefined]
  }
  const justify = () => resolveResponsiveValue(local.justify, screens())
  const align = () => resolveResponsiveValue(local.align, screens())
  return (
    <RowContext.Provider value={{ gutter, wrap: () => local.wrap }}>
      <div
        {...rest}
        class={classNames(
          rowPrefixCls(),
          local.wrap === false && `${rowPrefixCls()}-no-wrap`,
          justify() && `${rowPrefixCls()}-${justify()}`,
          align() && `${rowPrefixCls()}-${align()}`,
          config.direction() === 'rtl' && `${rowPrefixCls()}-rtl`,
          hashId(),
          local.class,
        )}
        style={{
          'margin-left': halfGutter(gutter()[0], -2),
          'margin-right': halfGutter(gutter()[0], -2),
          'row-gap': unit(gutter()[1]),
          ...(typeof local.style === 'object' ? local.style : {}),
        }}
      >
        {local.children}
      </div>
    </RowContext.Provider>
  )
}
