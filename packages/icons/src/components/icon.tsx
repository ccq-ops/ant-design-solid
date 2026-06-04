import type { AbstractNode, IconDefinition } from '@ant-design/icons-svg/lib/types'
import type { JSX } from 'solid-js'
import { createMemo, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'

export type TwoToneColor = string | [primaryColor: string, secondaryColor: string]

export interface IconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  spin?: boolean
  rotate?: number
  twoToneColor?: TwoToneColor
}

export interface InternalIconProps extends IconProps {
  icon: IconDefinition
}

const defaultPrimaryColor = '#1677ff'
const defaultSecondaryColor = '#e6f4ff'

function normalizeTwoToneColor(twoToneColor?: TwoToneColor) {
  if (Array.isArray(twoToneColor)) {
    return twoToneColor
  }

  return [twoToneColor ?? defaultPrimaryColor, defaultSecondaryColor] as const
}

function renderAbstractNode(node: AbstractNode): JSX.Element {
  return (
    <Dynamic component={node.tag} {...node.attrs}>
      {node.children?.map(renderAbstractNode)}
    </Dynamic>
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

export function Icon(props: InternalIconProps) {
  const [local, svgProps] = splitProps(props, [
    'icon',
    'spin',
    'rotate',
    'twoToneColor',
    'class',
    'style',
  ])
  const twoToneColors = createMemo(() => normalizeTwoToneColor(local.twoToneColor))
  const iconNode = createMemo(() => {
    const [primaryColor, secondaryColor] = twoToneColors()

    return typeof local.icon.icon === 'function'
      ? local.icon.icon(primaryColor, secondaryColor)
      : local.icon.icon
  })
  const ariaHidden = createMemo(
    () =>
      svgProps['aria-hidden'] ??
      (svgProps['aria-label'] === undefined && svgProps['aria-labelledby'] === undefined
        ? true
        : undefined),
  )

  return (
    <Dynamic
      component={iconNode().tag}
      {...iconNode().attrs}
      width="1em"
      height="1em"
      fill="currentColor"
      focusable="false"
      {...svgProps}
      aria-hidden={ariaHidden()}
      class={mergeClass(local.class, local.spin)}
      style={mergeStyle(local.style, local.spin, local.rotate)}
    >
      {iconNode().children?.map(renderAbstractNode)}
    </Dynamic>
  )
}
