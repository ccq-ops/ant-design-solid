import { splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { responsiveArrayReversed } from '../shared/responsive-observer'
import { useRowContext } from './context'
import type { ColProps, ColSize, ColSpanType, FlexType } from './interface'

function isColSize(value: unknown): value is ColSize {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function exists(value: ColSpanType | undefined) {
  return value !== undefined && value !== null
}

function parseFlex(flex: FlexType): string {
  if (flex === 'auto') return '1 1 auto'
  if (typeof flex === 'number') return `${flex} ${flex} auto`
  if (/^\d+(\.\d+)?(px|em|rem|%)$/.test(flex)) return `0 0 ${flex}`
  return flex
}

function halfGutter(value: string | number | undefined) {
  if (value === undefined || value === 0 || value === '') return undefined
  return typeof value === 'number' ? `${value / 2}px` : `calc(${value} / 2)`
}

export function Col(props: ColProps) {
  const [local, rest] = splitProps(props, [
    'span',
    'offset',
    'order',
    'push',
    'pull',
    'flex',
    'prefixCls',
    'class',
    'style',
    'children',
    ...responsiveArrayReversed,
  ])
  const config = useConfig()
  const rowContext = useRowContext()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-col`
  const rootPrefixCls = () => config.prefixCls()
  const responsiveClasses = () =>
    responsiveArrayReversed.flatMap((breakpoint) => {
      const value = local[breakpoint]
      const size = typeof value === 'number' || typeof value === 'string' ? { span: value } : value
      if (!isColSize(size)) return []
      return [
        exists(size.span) && `${prefixCls()}-${breakpoint}-${size.span}`,
        exists(size.order) && `${prefixCls()}-${breakpoint}-order-${size.order}`,
        exists(size.offset) && `${prefixCls()}-${breakpoint}-offset-${size.offset}`,
        exists(size.push) && `${prefixCls()}-${breakpoint}-push-${size.push}`,
        exists(size.pull) && `${prefixCls()}-${breakpoint}-pull-${size.pull}`,
        size.flex !== undefined && `${prefixCls()}-${breakpoint}-flex`,
      ].filter(Boolean) as string[]
    })
  const responsiveFlexStyle = () => {
    const style: Record<string, string> = {}
    responsiveArrayReversed.forEach((breakpoint) => {
      const value = local[breakpoint]
      if (isColSize(value) && value.flex !== undefined) {
        style[`--${rootPrefixCls()}-col-${breakpoint}-flex`] = parseFlex(value.flex)
      }
    })
    return style
  }
  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        local.span !== undefined && `${prefixCls()}-${local.span}`,
        local.offset !== undefined && `${prefixCls()}-offset-${local.offset}`,
        local.push !== undefined && `${prefixCls()}-push-${local.push}`,
        local.pull !== undefined && `${prefixCls()}-pull-${local.pull}`,
        local.order !== undefined && `${prefixCls()}-order-${local.order}`,
        local.flex !== undefined && `${prefixCls()}-flex`,
        ...responsiveClasses(),
        config.direction() === 'rtl' && `${prefixCls()}-rtl`,
        local.class,
      )}
      style={{
        'padding-left': halfGutter(rowContext.gutter()[0]),
        'padding-right': halfGutter(rowContext.gutter()[0]),
        flex: local.flex !== undefined ? parseFlex(local.flex) : undefined,
        'min-width': local.flex !== undefined && rowContext.wrap() === false ? 0 : undefined,
        ...responsiveFlexStyle(),
        ...(typeof local.style === 'object' ? local.style : {}),
      }}
    >
      {local.children}
    </div>
  )
}
