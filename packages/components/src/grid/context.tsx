import { createContext, useContext } from 'solid-js'
import type { Accessor } from 'solid-js'

export type RowContextValue = {
  gutter: Accessor<[string | number | undefined, string | number | undefined]>
  wrap: Accessor<boolean | undefined>
}

const defaultRowContext: RowContextValue = {
  gutter: () => [undefined, undefined],
  wrap: () => undefined,
}

export const RowContext = createContext<RowContextValue>(defaultRowContext)

export function useRowContext() {
  return useContext(RowContext)
}
