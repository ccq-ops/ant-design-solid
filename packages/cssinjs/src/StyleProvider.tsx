import { createContext, createMemo, useContext } from 'solid-js'
import { createCache } from './cache'
import type { StyleContextValue, StyleProviderProps } from './types'

const defaultCache = createCache()
const StyleContext = createContext<StyleContextValue>({ cache: defaultCache, hashPriority: () => 'low' as const })

export function StyleProvider(props: StyleProviderProps) {
  const value: StyleContextValue = { cache: props.cache ?? createCache(), hashPriority: createMemo(() => props.hashPriority ?? 'low') }
  return <StyleContext.Provider value={value}>{props.children}</StyleContext.Provider>
}
export function useStyleContext(): StyleContextValue { return useContext(StyleContext) ?? { cache: defaultCache, hashPriority: () => 'low' as const } }
