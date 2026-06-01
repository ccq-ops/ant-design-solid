import { createMemo, createRenderEffect, type Accessor } from 'solid-js'
import { hashString, stableStringify } from './hash'
import { serializeCSS } from './serializer'
import { useStyleContext } from './StyleProvider'
import type { StyleObject, StyleRegisterInfo, WrapSSR } from './types'

function injectStyle(styleId: string, css: string): void {
  if (typeof document === 'undefined') return
  if (document.head.querySelector(`style[data-ant-design-solid="${styleId}"]`)) return
  const style = document.createElement('style')
  style.setAttribute('data-ant-design-solid', styleId)
  style.textContent = css
  document.head.appendChild(style)
}

export function useStyleRegister(
  info: StyleRegisterInfo,
  styleFn: () => StyleObject,
): [WrapSSR, Accessor<string>] {
  const context = useStyleContext()
  const cacheKey = createMemo(() => stableStringify(info))
  const hashId = createMemo(() => hashString(cacheKey()))
  const css = createMemo(() => serializeCSS(styleFn()))
  createRenderEffect(() => {
    const key = cacheKey()
    const styleText = css()
    if (context.cache.register(key, styleText)) injectStyle(hashId(), styleText)
  })
  return [(node) => node, hashId]
}
