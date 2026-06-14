import type { AbstractNode, IconDefinition } from '@ant-design/icons-svg/lib/types'
import type { Component, JSX } from 'solid-js'
import { Match, Switch, createMemo, onMount, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'

export type TwoToneColor = string | [primaryColor: string, secondaryColor: string]

export interface IconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  component?: Component<JSX.SvgSVGAttributes<SVGSVGElement>>
  children?: JSX.Element
  spin?: boolean
  rotate?: number
  twoToneColor?: TwoToneColor
}

export interface InternalIconProps extends IconProps {
  icon: IconDefinition
}

type MergedIconProps = IconProps & Partial<Pick<InternalIconProps, 'icon'>>

export interface IconFontProps extends IconProps {
  type: string
}

export interface IconFontOptions {
  scriptUrl: string | string[]
}

const defaultPrimaryColor = '#1677ff'
const defaultSecondaryColor = '#e6f4ff'
const spinStyleAttribute = 'data-ant-design-solid-icon'
const spinStyleSelector = `style[${spinStyleAttribute}]`
const spinKeyframes = `@keyframes ant-design-solid-icon-spin {
  100% {
    transform: rotate(360deg);
  }
}`
const loadedIconfontScriptUrls = new Set<string>()

function ensureSpinKeyframesStyle() {
  if (typeof document === 'undefined') {
    return
  }

  if (document.head.querySelector(spinStyleSelector)) {
    return
  }

  const style = document.createElement('style')

  style.setAttribute(spinStyleAttribute, '')
  style.textContent = spinKeyframes
  document.head.append(style)
}

function normalizeTwoToneColor(twoToneColor?: TwoToneColor) {
  if (Array.isArray(twoToneColor)) {
    return twoToneColor
  }

  return [twoToneColor ?? defaultPrimaryColor, defaultSecondaryColor] as const
}

function renderAbstractNode(node: AbstractNode): JSX.Element {
  return (
    <Switch>
      <Match when={node.tag === 'path'}>
        <path {...node.attrs}>{node.children?.map(renderAbstractNode)}</path>
      </Match>
      <Match when={node.tag === 'g'}>
        <g {...node.attrs}>{node.children?.map(renderAbstractNode)}</g>
      </Match>
      <Match when={node.tag === 'defs'}>
        <defs {...node.attrs}>{node.children?.map(renderAbstractNode)}</defs>
      </Match>
      <Match when={node.tag === 'linearGradient'}>
        <linearGradient {...node.attrs}>{node.children?.map(renderAbstractNode)}</linearGradient>
      </Match>
      <Match when={node.tag === 'stop'}>
        <stop {...node.attrs}>{node.children?.map(renderAbstractNode)}</stop>
      </Match>
      <Match when={node.tag === 'filter'}>
        <filter {...node.attrs}>{node.children?.map(renderAbstractNode)}</filter>
      </Match>
      <Match when={node.tag === 'feOffset'}>
        <feOffset {...node.attrs}>{node.children?.map(renderAbstractNode)}</feOffset>
      </Match>
      <Match when={node.tag === 'feGaussianBlur'}>
        <feGaussianBlur {...node.attrs}>{node.children?.map(renderAbstractNode)}</feGaussianBlur>
      </Match>
      <Match when={node.tag === 'feColorMatrix'}>
        <feColorMatrix {...node.attrs}>{node.children?.map(renderAbstractNode)}</feColorMatrix>
      </Match>
      <Match when={node.tag === 'feMerge'}>
        <feMerge {...node.attrs}>{node.children?.map(renderAbstractNode)}</feMerge>
      </Match>
      <Match when={node.tag === 'feMergeNode'}>
        <feMergeNode {...node.attrs}>{node.children?.map(renderAbstractNode)}</feMergeNode>
      </Match>
      <Match when={node.tag === 'style'}>
        <style {...node.attrs}>{node.children?.map(renderAbstractNode)}</style>
      </Match>
    </Switch>
  )
}

function mergeClass(className: string | undefined, spin: boolean | undefined) {
  return [className, spin && 'ant-design-solid-icon-spin'].filter(Boolean).join(' ') || undefined
}

function mergeStyle(
  style: JSX.CSSProperties | string | undefined,
  spin: boolean | undefined,
  rotate: number | undefined,
): JSX.CSSProperties | string | undefined {
  const iconStyle: JSX.CSSProperties = {}

  if (spin) {
    ensureSpinKeyframesStyle()
    iconStyle.animation = 'ant-design-solid-icon-spin 1s infinite linear'
  }

  if (rotate !== undefined) {
    iconStyle.transform = `rotate(${rotate}deg)`
  }

  if (Object.keys(iconStyle).length === 0) {
    return style
  }

  if (typeof style === 'string') {
    const iconStyleText = Object.entries(iconStyle)
      .map(([key, value]) => `${key}: ${value}`)
      .join('; ')

    return `${style}; ${iconStyleText}`
  }

  return { ...style, ...iconStyle }
}

function ariaHiddenValue(svgProps: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    svgProps['aria-hidden'] ??
    (svgProps['aria-label'] === undefined && svgProps['aria-labelledby'] === undefined
      ? true
      : undefined)
  )
}

function loadIconfontScript(scriptUrl: string) {
  if (typeof document === 'undefined' || loadedIconfontScriptUrls.has(scriptUrl)) {
    return
  }

  const script = document.createElement('script')

  script.src = scriptUrl
  script.setAttribute('data-ant-design-solid-iconfont', '')
  document.body.append(script)
  loadedIconfontScriptUrls.add(scriptUrl)
}

export function Icon(props: MergedIconProps) {
  const [local, svgProps] = splitProps(props, [
    'component',
    'icon',
    'spin',
    'rotate',
    'twoToneColor',
    'children',
    'class',
    'style',
  ])
  const twoToneColors = createMemo(() => normalizeTwoToneColor(local.twoToneColor))
  const iconNode = createMemo(() => {
    const [primaryColor, secondaryColor] = twoToneColors()
    const iconDefinition = local.icon

    if (!iconDefinition) {
      return undefined
    }

    return typeof iconDefinition.icon === 'function'
      ? iconDefinition.icon(primaryColor, secondaryColor)
      : iconDefinition.icon
  })
  const ariaHidden = createMemo(() => ariaHiddenValue(svgProps))

  const rootProps = () => ({
    ...iconNode()?.attrs,
    width: '1em',
    height: '1em',
    fill: 'currentColor',
    focusable: 'false',
    ...svgProps,
    'aria-hidden': ariaHidden(),
    class: mergeClass(local.class, local.spin),
    style: mergeStyle(local.style, local.spin, local.rotate),
  })

  return local.component ? (
    <Dynamic component={local.component} {...rootProps()}>
      {local.children}
    </Dynamic>
  ) : (
    <svg {...rootProps()}>
      {iconNode()?.children?.map(renderAbstractNode)}
      {local.children}
    </svg>
  )
}

export function createFromIconfontCN(options: IconFontOptions) {
  const scriptUrls = Array.isArray(options.scriptUrl) ? options.scriptUrl : [options.scriptUrl]

  return function IconFont(props: IconFontProps) {
    onMount(() => {
      scriptUrls.forEach(loadIconfontScript)
    })

    const [local, iconProps] = splitProps(props, ['type'])

    return (
      <Icon {...iconProps}>
        <use href={`#${local.type}`} />
      </Icon>
    )
  }
}
