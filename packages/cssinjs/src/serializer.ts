import type { CSSObject, CSSValue, StyleObject } from './types'

function toKebabCase(property: string): string {
  return property.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
}

const unitlessProperties = new Set([
  'animation-iteration-count',
  'aspect-ratio',
  'border-image-outset',
  'border-image-slice',
  'border-image-width',
  'box-flex',
  'box-flex-group',
  'box-ordinal-group',
  'column-count',
  'columns',
  'flex',
  'flex-grow',
  'flex-negative',
  'flex-order',
  'flex-positive',
  'flex-shrink',
  'font-weight',
  'grid-area',
  'grid-column',
  'grid-column-end',
  'grid-column-start',
  'grid-row',
  'grid-row-end',
  'grid-row-start',
  'line-clamp',
  'line-height',
  'opacity',
  'order',
  'orphans',
  'scale',
  'tab-size',
  'widows',
  'z-index',
  'zoom',
])

function formatValue(property: string, value: CSSValue): string {
  if (typeof value !== 'number') return String(value)
  if (value === 0 || unitlessProperties.has(toKebabCase(property))) return String(value)
  return `${value}px`
}
function isAtRule(selector: string): boolean {
  return selector.startsWith('@')
}
function serializeDeclarations(object: CSSObject): string {
  return Object.keys(object)
    .sort()
    .map((key) => {
      const value = object[key]
      if (value === undefined || value === null || typeof value === 'object') return ''
      return `${toKebabCase(key)}:${formatValue(key, value)};`
    })
    .filter(Boolean)
    .join('')
}
function serializeAtRule(selector: string, object: CSSObject): string {
  const body = Object.keys(object)
    .sort()
    .map((key) => {
      const value = object[key]
      if (value === undefined || value === null) return ''
      if (typeof value === 'object') {
        return isAtRule(key)
          ? serializeAtRule(key, value as CSSObject)
          : `${key}{${serializeDeclarations(value as CSSObject)}}`
      }
      return `${toKebabCase(key)}:${formatValue(key, value)};`
    })
    .filter(Boolean)
    .join('')
  return `${selector}{${body}}`
}
function serializeRule(selector: string, object: CSSObject): string {
  if (isAtRule(selector)) return serializeAtRule(selector, object)

  const declarations: string[] = []
  const nested: string[] = []
  for (const key of Object.keys(object).sort()) {
    const value = object[key]
    if (value === undefined || value === null) continue
    if (typeof value === 'object') {
      if (isAtRule(key)) {
        nested.push(serializeAtRule(key, { [selector]: value as CSSObject }))
      } else {
        const nestedSelector = key.includes('&')
          ? key.replace(/&/g, selector)
          : `${selector} ${key}`
        nested.push(serializeRule(nestedSelector, value as CSSObject))
      }
    } else {
      declarations.push(`${toKebabCase(key)}:${formatValue(key, value)};`)
    }
  }
  const current = declarations.length > 0 ? `${selector}{${declarations.join('')}}` : ''
  return [current, ...nested].filter(Boolean).join('\n')
}
export function serializeCSS(style: StyleObject): string {
  return Object.keys(style)
    .sort()
    .map((selector) => serializeRule(selector, style[selector]))
    .join('\n')
}
