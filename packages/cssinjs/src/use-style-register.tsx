import { createMemo, createRenderEffect, type Accessor } from 'solid-js'
import { hashString, stableStringify } from './hash'
import { serializeCSS } from './serializer'
import { useStyleContext } from './style-provider'
import type { StyleObject, StyleRegisterInfo, WrapSSR } from './types'

const unitlessTokenNames = new Set([
  'lineHeight',
  'lineHeightSM',
  'lineHeightLG',
  'lineHeightHeading1',
  'lineHeightHeading2',
  'lineHeightHeading3',
  'lineHeightHeading4',
  'lineHeightHeading5',
  'opacityLoading',
  'fontWeightStrong',
  'zIndexPopupBase',
  'zIndexBase',
  'opacityImage',
])

const ignoredTokenNames = new Set(['motionBase', 'motionUnit'])

function tokenNameToKebabCase(name: string): string {
  return name.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
}

function tokenVariableName(prefix: string, name: string): string {
  const normalizedPrefix = prefix ? `${prefix}-` : ''
  return `--${normalizedPrefix}${tokenNameToKebabCase(name)}`
}

function tokenVariableValue(name: string, value: string | number | boolean): string {
  if (typeof value !== 'number' || value === 0 || unitlessTokenNames.has(name)) {
    return String(value)
  }
  return `${value}px`
}

function createTokenVariableStyle(selector: string, prefix: string, token: unknown): StyleObject {
  if (!token || typeof token !== 'object') return {}
  const declarations = Object.fromEntries(
    Object.entries(token as Record<string, unknown>)
      .filter(
        ([name, value]) =>
          !ignoredTokenNames.has(name) &&
          (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'),
      )
      .map(([name, value]) => [
        tokenVariableName(prefix, name),
        tokenVariableValue(name, value as string | number | boolean),
      ]),
  )
  return Object.keys(declarations).length ? { [selector]: declarations } : {}
}

function replaceTokenValuesWithVariables(value: unknown, variables: Map<string, string>): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => replaceTokenValuesWithVariables(item, variables))
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        replaceTokenValuesWithVariables(item, variables),
      ]),
    )
  }
  return variables.get(`${typeof value}:${String(value)}`) ?? value
}

function cssVariableStyle(style: StyleObject, prefix: string, token: unknown): StyleObject {
  if (!token || typeof token !== 'object') return style
  const variables = new Map<string, string>()
  Object.entries(token as Record<string, unknown>).forEach(([name, value]) => {
    if (
      ignoredTokenNames.has(name) ||
      (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean')
    ) {
      return
    }
    const key = `${typeof value}:${String(value)}`
    if (!variables.has(key)) variables.set(key, `var(${tokenVariableName(prefix, name)})`)
  })
  return replaceTokenValuesWithVariables(style, variables) as StyleObject
}

function injectStyle(styleId: string, css: string, nonce?: string): void {
  if (typeof document === 'undefined') return
  const existingStyle = document.head.querySelector(`style[data-ant-design-solid="${styleId}"]`)
  if (existingStyle) {
    existingStyle.textContent = css
    if (nonce) existingStyle.setAttribute('nonce', nonce)
    else existingStyle.removeAttribute('nonce')
    return
  }
  const style = document.createElement('style')
  style.setAttribute('data-ant-design-solid', styleId)
  if (nonce) style.setAttribute('nonce', nonce)
  style.textContent = css
  document.head.appendChild(style)
}

export function useStyleRegister(
  info: StyleRegisterInfo,
  styleFn: () => StyleObject,
): [WrapSSR, Accessor<string>] {
  const context = useStyleContext()
  const cacheKey = createMemo(() =>
    stableStringify({
      ...info,
      cssVar: context.cssVar(),
    }),
  )
  const styleId = createMemo(() => hashString(cacheKey()))
  const cssVarClass = createMemo(() => context.cssVar()?.key ?? '')
  const hashId = createMemo(() =>
    [context.hashed() && !context.zeroRuntime() ? styleId() : '', cssVarClass()]
      .filter(Boolean)
      .join(' '),
  )
  const css = createMemo(() => {
    const config = context.cssVar()
    const style = styleFn()
    return serializeCSS(
      config ? cssVariableStyle(style, config.prefix ?? 'ant', info.token) : style,
    )
  })
  const cssVariables = createMemo(() => {
    const config = context.cssVar()
    if (!config) return ''
    return serializeCSS(
      createTokenVariableStyle(`.${config.key}`, config.prefix ?? 'ant', info.token),
    )
  })
  createRenderEffect(() => {
    if (context.zeroRuntime()) return
    const key = cacheKey()
    const styleText = css()
    context.cache.register(key, styleText)
    injectStyle(styleId(), styleText, context.nonce())
    const variableText = cssVariables()
    if (variableText) {
      const variableKey = `css-var:${context.cssVar()?.key}:${stableStringify(info.token)}`
      const variableId = hashString(variableKey)
      context.cache.register(variableKey, variableText)
      injectStyle(variableId, variableText, context.nonce())
    }
  })
  return [(node) => node, hashId]
}
