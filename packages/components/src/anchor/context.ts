import { createContext, useContext } from 'solid-js'
import type { JSX } from 'solid-js'
import type {
  AnchorDirection,
  AnchorItem,
  AnchorSemanticClassNames,
  AnchorSemanticStyles,
} from './interface'

export interface AnchorContextValue {
  activeLink: () => string
  direction: () => AnchorDirection
  prefixCls: () => string
  semanticClass: (slot: keyof AnchorSemanticClassNames) => string | undefined
  semanticStyle: (slot: keyof AnchorSemanticStyles) => JSX.CSSProperties | undefined
  registerLink: (item: AnchorItem) => void
  unregisterLink: (href: string) => void
  onClick: (event: MouseEvent, item: AnchorItem) => void
}

export const AnchorContext = createContext<AnchorContextValue>()

export function useAnchorContext() {
  return useContext(AnchorContext)
}
