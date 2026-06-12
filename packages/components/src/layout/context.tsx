import { createContext, useContext } from 'solid-js'

export interface LayoutContextValue {
  addSider: (id: string) => void
  removeSider: (id: string) => void
}

const noop = () => {}

export const LayoutContext = createContext<LayoutContextValue>({
  addSider: noop,
  removeSider: noop,
})

export function useLayoutContext(): LayoutContextValue {
  return useContext(LayoutContext)
}
