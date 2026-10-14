import type { Accessor, JSX } from 'solid-js'

export type CSSValue = string | number | undefined | null
export interface CSSObject {
  [propertyOrSelector: string]: CSSValue | CSSObject
}
export type StyleObject = Record<string, CSSObject>
export interface CSSVarConfig {
  key: string
  prefix?: string
}
export interface StyleCache {
  register: (key: string, css: string) => boolean
  has: (key: string) => boolean
  get: (key: string) => string | undefined
  entries: () => Array<[string, string]>
  size: () => number
}
export interface ExtractStyleOptions {
  format?: 'css' | 'style-tag'
  nonce?: string
}
export interface StyleProviderProps {
  cache?: StyleCache
  hashed?: boolean
  hashPriority?: 'low' | 'high'
  nonce?: string
  cssVar?: CSSVarConfig
  zeroRuntime?: boolean
  children?: JSX.Element
}
export interface StyleContextValue {
  cache: StyleCache
  hashed: Accessor<boolean>
  hashPriority: Accessor<'low' | 'high'>
  nonce: Accessor<string | undefined>
  cssVar: Accessor<CSSVarConfig | undefined>
  zeroRuntime: Accessor<boolean>
}
export interface StyleRegisterInfo {
  theme: unknown
  token: unknown
  path: Array<string | number>
}
export type WrapSSR = (node: JSX.Element) => JSX.Element
