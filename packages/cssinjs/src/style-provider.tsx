import { createContext, createMemo, useContext } from 'solid-js'
import { createCache } from './cache'
import type { StyleContextValue, StyleProviderProps } from './types'

const defaultCache = createCache()
const StyleContext = createContext<StyleContextValue>({
  cache: defaultCache,
  hashed: () => true,
  hashPriority: () => 'low' as const,
  nonce: () => undefined,
  zeroRuntime: () => false,
})

export function StyleProvider(props: StyleProviderProps) {
  const parent = useContext(StyleContext)
  const cache = props.cache ?? parent?.cache ?? createCache()
  const hashed = createMemo(() => props.hashed ?? parent?.hashed() ?? true)
  const hashPriority = createMemo(() => props.hashPriority ?? parent?.hashPriority() ?? 'low')
  const nonce = createMemo(() => props.nonce ?? parent?.nonce())
  const zeroRuntime = createMemo(() => props.zeroRuntime ?? parent?.zeroRuntime() ?? false)
  const value: StyleContextValue = { cache, hashed, hashPriority, nonce, zeroRuntime }
  return <StyleContext.Provider value={value}>{props.children}</StyleContext.Provider>
}
export function useStyleContext(): StyleContextValue {
  return (
    useContext(StyleContext) ?? {
      cache: defaultCache,
      hashed: () => true,
      hashPriority: () => 'low' as const,
      nonce: () => undefined,
      zeroRuntime: () => false,
    }
  )
}
