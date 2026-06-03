import { splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { getComponentToken, type GlobalToken } from '@ant-design-solid/theme'
import { useConfig, useToken } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useFlexStyle } from './flex.style'
import type { JSX } from 'solid-js'
import type { FlexGap, FlexProps, FlexWrap } from './interface'

function resolveGap(gap: FlexGap | undefined, token: GlobalToken): [number, number] {
  const spaceToken = getComponentToken('Space', token)
  if (Array.isArray(gap)) return gap
  if (typeof gap === 'number') return [gap, gap]
  if (gap === 'small') return [spaceToken.gapSmall, spaceToken.gapSmall]
  if (gap === 'large') return [spaceToken.gapLarge, spaceToken.gapLarge]
  return [spaceToken.gapMiddle, spaceToken.gapMiddle]
}

function resolveWrap(wrap: FlexWrap | undefined): 'nowrap' | 'wrap' | 'wrap-reverse' | undefined {
  if (wrap === true) return 'wrap'
  if (wrap === 'nowrap' || wrap === 'wrap' || wrap === 'wrap-reverse') return wrap
  return undefined
}

export function Flex(props: FlexProps) {
  const [local, rest] = splitProps(props, [
    'vertical',
    'wrap',
    'justify',
    'align',
    'gap',
    'component',
    'prefixCls',
    'class',
    'style',
    'children',
  ])
  const config = useConfig()
  const token = useToken()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-flex`
  const [, hashId] = useFlexStyle(prefixCls())
  const gap = () => resolveGap(local.gap, token())
  const wrap = () => resolveWrap(local.wrap)
  const computedStyle = (): JSX.CSSProperties => ({
    'flex-direction': local.vertical ? 'column' : 'row',
    'flex-wrap': wrap(),
    'justify-content': local.justify,
    'align-items': local.align,
    'column-gap': `${gap()[0]}px`,
    'row-gap': `${gap()[1]}px`,
  })
  const mergedStyle = (): JSX.CSSProperties | string => {
    if (typeof local.style === 'string') {
      const base = computedStyle()
      const declarations = Object.entries(base)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => `${key}: ${value}`)
        .join('; ')
      return `${declarations}; ${local.style}`
    }
    return { ...computedStyle(), ...local.style }
  }

  return (
    <Dynamic
      component={local.component ?? 'div'}
      {...rest}
      class={classNames(
        prefixCls(),
        local.vertical && `${prefixCls()}-vertical`,
        wrap() && `${prefixCls()}-${wrap()}`,
        hashId(),
        local.class,
      )}
      style={mergedStyle()}
    >
      {local.children}
    </Dynamic>
  )
}
