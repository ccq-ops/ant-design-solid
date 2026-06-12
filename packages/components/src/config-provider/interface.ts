import type { Accessor, JSX } from 'solid-js'
import type { AliasToken, ComponentSize, ThemeConfig } from '@ant-design-solid/theme'
import type {
  TooltipArrow,
  TooltipSemanticClassNamesConfig,
  TooltipSemanticStylesConfig,
  TooltipTriggerInput,
} from '../tooltip/interface'

export interface TooltipConfig {
  unique?: boolean
  arrow?: TooltipArrow
  trigger?: TooltipTriggerInput
  class?: string
  style?: JSX.CSSProperties
  classNames?: TooltipSemanticClassNamesConfig
  styles?: TooltipSemanticStylesConfig
}

export interface ConfigProviderProps {
  prefixCls?: string
  componentSize?: ComponentSize
  direction?: 'ltr' | 'rtl'
  theme?: ThemeConfig
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
  tooltip?: TooltipConfig
  children?: JSX.Element
}
export interface ConfigContextValue {
  prefixCls: Accessor<string>
  componentSize: Accessor<ComponentSize>
  direction: Accessor<'ltr' | 'rtl'>
  theme: Accessor<ThemeConfig>
  token: Accessor<AliasToken>
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
  tooltip: Accessor<TooltipConfig>
}
