import type { JSX } from 'solid-js'
import type {
  BadgeProps,
  BadgeSemanticClassNames,
  BadgeSemanticStyles,
  RibbonProps,
  RibbonSemanticClassNames,
  RibbonSemanticStyles,
} from './interface'

export const presetColorMap: Record<string, string> = {
  blue: '#1677ff',
  purple: '#722ed1',
  cyan: '#13c2c2',
  green: '#52c41a',
  magenta: '#eb2f96',
  pink: '#eb2f96',
  red: '#f5222d',
  orange: '#fa8c16',
  yellow: '#fadb14',
  volcano: '#fa541c',
  geekblue: '#2f54eb',
  lime: '#a0d911',
  gold: '#faad14',
  success: '#52c41a',
  warning: '#faad14',
  error: '#ff4d4f',
  processing: '#1677ff',
}

export function isPresetColor(color: string | undefined): color is string {
  return Boolean(color && presetColorMap[color])
}

export function resolveColor(color: string | undefined): string | undefined {
  if (!color) return undefined
  return presetColorMap[color] ?? color
}

export function mergeStyles(
  ...values: Array<JSX.CSSProperties | string | undefined>
): JSX.CSSProperties | string | undefined {
  const strings = values.filter((value): value is string => typeof value === 'string')
  const objects = values.filter(
    (value): value is JSX.CSSProperties =>
      Boolean(value) && typeof value === 'object' && !Array.isArray(value),
  )
  if (strings.length && objects.length) {
    return [
      strings.join('; '),
      ...objects.map((style) =>
        Object.entries(style)
          .map(([key, value]) => `${key}: ${value}`)
          .join('; '),
      ),
    ]
      .filter(Boolean)
      .join('; ')
  }
  if (strings.length) return strings.join('; ')
  if (objects.length) return Object.assign({}, ...objects)
  return undefined
}

export function resolveBadgeClassNames(value: BadgeProps['classNames'], props: BadgeProps) {
  return (typeof value === 'function' ? value({ props }) : (value ?? {})) as BadgeSemanticClassNames
}

export function resolveBadgeStyles(value: BadgeProps['styles'], props: BadgeProps) {
  return (typeof value === 'function' ? value({ props }) : (value ?? {})) as BadgeSemanticStyles
}

export function resolveRibbonClassNames(value: RibbonProps['classNames'], props: RibbonProps) {
  return (
    typeof value === 'function' ? value({ props }) : (value ?? {})
  ) as RibbonSemanticClassNames
}

export function resolveRibbonStyles(value: RibbonProps['styles'], props: RibbonProps) {
  return (typeof value === 'function' ? value({ props }) : (value ?? {})) as RibbonSemanticStyles
}
