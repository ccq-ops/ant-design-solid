import type { JSX } from 'solid-js'

export type ListyKey = string | number
export type ListyRowKey<T> = keyof T | ((item: T) => ListyKey)
export type ListyScrollAlign = 'top' | 'bottom' | 'auto'
export type ListySemanticSlot = 'root' | 'item' | 'groupHeader'
export type ListySemanticClassNamesMap = Partial<Record<ListySemanticSlot, string>>
export type ListySemanticStylesMap = Partial<Record<ListySemanticSlot, JSX.CSSProperties>>
export type ListyClassNames = ListySemanticClassNamesMap
export type ListyStyles = ListySemanticStylesMap

export interface ListyGroup<T, K extends ListyKey = ListyKey> {
  key: (item: T) => K
  title: (groupKey: K, items: T[]) => JSX.Element
}

export interface ListyGroupScrollToConfig {
  groupKey: ListyKey
  align?: ListyScrollAlign
  offset?: number
}

export interface ListyKeyScrollToConfig {
  key: ListyKey
  align?: ListyScrollAlign
  offset?: number
}

export interface ListyPositionScrollToConfig {
  left?: number
  top?: number
}

export type ListyScrollToConfig =
  | number
  | null
  | ListyKeyScrollToConfig
  | ListyPositionScrollToConfig
  | ListyGroupScrollToConfig

export interface ListyRef {
  scrollTo: (config?: ListyScrollToConfig) => void
}

export type ListySemanticClassNames<T, K extends ListyKey = ListyKey> =
  | ListySemanticClassNamesMap
  | ((info: { props: ListyProps<T, K> }) => ListySemanticClassNamesMap)

export type ListySemanticStyles<T, K extends ListyKey = ListyKey> =
  | ListySemanticStylesMap
  | ((info: { props: ListyProps<T, K> }) => ListySemanticStylesMap)

export interface ListyProps<T, K extends ListyKey = ListyKey> {
  items?: T[]
  sticky?: boolean
  height?: number
  group?: ListyGroup<T, K>
  virtual?: boolean
  prefixCls?: string
  rowKey: ListyRowKey<T>
  class?: string
  classList?: Record<string, boolean | undefined>
  rootClass?: string
  /** @deprecated Use `rootClass` in Solid code. */
  rootClassName?: string
  style?: JSX.CSSProperties
  tabIndex?: number
  classNames?: ListySemanticClassNames<T, K>
  styles?: ListySemanticStyles<T, K>
  onScroll?: JSX.EventHandler<HTMLDivElement, Event>
  itemRender: (item: T, index: number) => JSX.Element
  ref?: ListyRef | ((ref: ListyRef) => void)
}
