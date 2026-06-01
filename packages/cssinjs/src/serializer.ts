import type { CSSObject, CSSValue, StyleObject } from './types'

function toKebabCase(property: string): string {
  return property.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
}
function formatValue(value: CSSValue): string {
  return typeof value === 'number' ? (value === 0 ? '0' : `${value}px`) : String(value)
}
function serializeRule(selector: string, object: CSSObject): string {
  const declarations: string[] = []
  const nested: string[] = []
  for (const key of Object.keys(object).sort()) {
    const value = object[key]
    if (value === undefined || value === null) continue
    if (typeof value === 'object') {
      const nestedSelector = key.includes('&') ? key.replace(/&/g, selector) : `${selector} ${key}`
      nested.push(serializeRule(nestedSelector, value as CSSObject))
    } else {
      declarations.push(`${toKebabCase(key)}:${formatValue(value)};`)
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
