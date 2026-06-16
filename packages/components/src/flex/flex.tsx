import { splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { getComponentToken, type GlobalToken } from '@solid-ant-design/theme'
import { useConfig, useToken } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useFlexStyle } from './flex.style'
import type { JSX } from 'solid-js'
import type { FlexGap, FlexOrientation, FlexProps, FlexWrap } from './interface'

type ResolvedGap = string | [number, number]

const justifyContentValues = [
  'flex-start',
  'flex-end',
  'start',
  'end',
  'center',
  'space-between',
  'space-around',
  'space-evenly',
  'stretch',
  'normal',
  'left',
  'right',
] as const

const alignItemsValues = [
  'center',
  'start',
  'end',
  'flex-start',
  'flex-end',
  'self-start',
  'self-end',
  'baseline',
  'normal',
  'stretch',
] as const

function resolveGap(gap: FlexGap | undefined, token: GlobalToken): ResolvedGap {
  const flexToken = getComponentToken('Flex', token)
  if (Array.isArray(gap)) return gap
  if (typeof gap === 'number') return `${gap}px`
  if (gap === 'small') return `${flexToken.flexGapSM}px`
  if (gap === 'large') return `${flexToken.flexGapLG}px`
  if (gap === 'medium' || gap === 'middle' || gap === undefined) return `${flexToken.flexGap}px`
  return gap
}

function shouldMirrorGapToAxes(gap: FlexGap | undefined) {
  return (
    gap === undefined ||
    typeof gap === 'number' ||
    gap === 'small' ||
    gap === 'middle' ||
    gap === 'medium' ||
    gap === 'large'
  )
}

function resolveOrientation(props: {
  orientation?: FlexOrientation
  vertical?: boolean
}): FlexOrientation {
  return props.orientation ?? (props.vertical ? 'vertical' : 'horizontal')
}

function resolveWrap(wrap: FlexWrap | undefined): 'nowrap' | 'wrap' | 'wrap-reverse' | undefined {
  if (wrap === true) return 'wrap'
  if (wrap === 'nowrap' || wrap === 'wrap' || wrap === 'wrap-reverse') return wrap
  return undefined
}

function presetGapClass(prefixCls: string, gap: FlexGap | undefined) {
  if (gap === 'small' || gap === 'medium' || gap === 'middle' || gap === 'large')
    return `${prefixCls}-gap-${gap}`
  return false
}

function valueClass<T extends readonly string[]>(
  prefixCls: string,
  values: T,
  name: string,
  value: string | undefined,
) {
  return value && values.includes(value) ? `${prefixCls}-${name}-${value}` : false
}

export function Flex(props: FlexProps) {
  const [local, rest] = splitProps(props, [
    'rootClassName',
    'vertical',
    'orientation',
    'wrap',
    'justify',
    'align',
    'flex',
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
  const orientation = () => resolveOrientation(local)
  const wrap = () => resolveWrap(local.wrap)
  const computedStyle = (): JSX.CSSProperties => {
    const resolvedGap = gap()
    const mirroredGap = !Array.isArray(resolvedGap) && shouldMirrorGapToAxes(local.gap)
    return {
      'flex-direction': orientation() === 'vertical' ? 'column' : 'row',
      'flex-wrap': wrap(),
      'justify-content': local.justify,
      'align-items': local.align ?? (orientation() === 'vertical' ? 'stretch' : 'flex-start'),
      flex: local.flex,
      gap: Array.isArray(resolvedGap) ? undefined : (resolvedGap as JSX.CSSProperties['gap']),
      'column-gap': Array.isArray(resolvedGap)
        ? `${resolvedGap[0]}px`
        : mirroredGap
          ? resolvedGap
          : undefined,
      'row-gap': Array.isArray(resolvedGap)
        ? `${resolvedGap[1]}px`
        : mirroredGap
          ? resolvedGap
          : undefined,
    }
  }
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
  const sharedProps = () => ({
    ...rest,
    class: classNames(
      prefixCls(),
      orientation() === 'vertical' && `${prefixCls()}-vertical`,
      wrap() && `${prefixCls()}-${wrap()}`,
      wrap() && `${prefixCls()}-wrap-${wrap()}`,
      valueClass(prefixCls(), justifyContentValues, 'justify', local.justify),
      valueClass(
        prefixCls(),
        alignItemsValues,
        'align',
        local.align ?? (orientation() === 'vertical' ? 'stretch' : undefined),
      ),
      presetGapClass(prefixCls(), local.gap),
      hashId(),
      local.rootClassName,
      local.class,
    ),
    style: mergedStyle(),
  })

  if (!local.component) {
    return <div {...(sharedProps() as JSX.HTMLAttributes<HTMLDivElement>)}>{local.children}</div>
  }

  return (
    <Dynamic component={local.component} {...sharedProps()}>
      {local.children}
    </Dynamic>
  )
}
