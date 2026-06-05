import type { Accessor, JSX } from 'solid-js'
import type { AliasToken, ComponentSize, ThemeConfig } from '@ant-design-solid/theme'
export interface ConfigProviderProps {
  prefixCls?: string
  componentSize?: ComponentSize
  direction?: 'ltr' | 'rtl'
  theme?: ThemeConfig
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
  children?: JSX.Element
}
export interface ConfigContextValue {
  prefixCls: Accessor<string>
  componentSize: Accessor<ComponentSize>
  direction: Accessor<'ltr' | 'rtl'>
  theme: Accessor<ThemeConfig>
  token: Accessor<AliasToken>
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
}
