import { createMemo, createRenderEffect, type Accessor } from 'solid-js'
import { hashString, stableStringify } from './hash'
import { serializeCSS } from './serializer'
import { useStyleContext } from './style-provider'
import type { StyleObject, StyleRegisterInfo, WrapSSR } from './types'

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
  const cacheKey = createMemo(() => stableStringify(info))
  const styleId = createMemo(() => hashString(cacheKey()))
  const hashId = createMemo(() => (context.hashed() && !context.zeroRuntime() ? styleId() : ''))
  const css = createMemo(() => serializeCSS(styleFn()))
  createRenderEffect(() => {
    if (context.zeroRuntime()) return
    const key = cacheKey()
    const styleText = css()
    context.cache.register(key, styleText)
    injectStyle(styleId(), styleText, context.nonce())
  })
  return [(node) => node, hashId]
}
