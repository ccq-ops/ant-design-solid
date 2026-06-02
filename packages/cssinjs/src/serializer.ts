import type { CSSObject, CSSValue, StyleObject } from './types'

function toKebabCase(property: string): string {
  return property.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
}
function formatValue(value: CSSValue): string {
  return typeof value === 'number' ? (value === 0 ? '0' : `${value}px`) : String(value)
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
      return `${toKebabCase(key)}:${formatValue(value)};`
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
      return `${toKebabCase(key)}:${formatValue(value)};`
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
