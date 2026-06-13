import type { Accessor, JSX } from 'solid-js'
import type { AliasToken, ComponentSize, ThemeConfig } from '@ant-design-solid/theme'
import type {
  TooltipArrow,
  TooltipSemanticClassNamesConfig,
  TooltipSemanticStylesConfig,
  TooltipTriggerInput,
} from '../tooltip/interface'
import type { NotificationConfig } from '../notification/interface'
import type { MessageConfigOptions } from '../message/interface'
import type {
  EmptySemanticClassNamesConfig,
  EmptySemanticStylesConfig,
  EmptyProps,
} from '../empty/interface'
import type {
  DrawerClosableConfig,
  DrawerFocusableConfig,
  DrawerMaskConfig,
  DrawerSemanticClassNames,
  DrawerSemanticStyles,
} from '../drawer/interface'

export interface TooltipConfig {
  unique?: boolean
  arrow?: TooltipArrow
  trigger?: TooltipTriggerInput
  class?: string
  style?: JSX.CSSProperties
  classNames?: TooltipSemanticClassNamesConfig
  styles?: TooltipSemanticStylesConfig
}

export interface EmptyConfig {
  class?: string
  style?: JSX.CSSProperties
  image?: EmptyProps['image']
  classNames?: EmptySemanticClassNamesConfig
  styles?: EmptySemanticStylesConfig
}

export interface DrawerConfig {
  class?: string
  rootClass?: string
  style?: JSX.CSSProperties
  rootStyle?: JSX.CSSProperties
  classNames?: DrawerSemanticClassNames
  styles?: DrawerSemanticStyles
  closable?: boolean | DrawerClosableConfig
  mask?: boolean | DrawerMaskConfig
  focusable?: DrawerFocusableConfig
}

export interface ConfigProviderProps {
  prefixCls?: string
  componentSize?: ComponentSize
  direction?: 'ltr' | 'rtl'
  theme?: ThemeConfig
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
  tooltip?: TooltipConfig
  notification?: Pick<NotificationConfig, 'closeIcon' | 'classNames' | 'styles'>
  message?: Pick<MessageConfigOptions, 'class' | 'className' | 'style' | 'classNames' | 'styles'>
  empty?: EmptyConfig
  drawer?: DrawerConfig
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
  notification: Accessor<Pick<NotificationConfig, 'closeIcon' | 'classNames' | 'styles'>>
  message: Accessor<
    Pick<MessageConfigOptions, 'class' | 'className' | 'style' | 'classNames' | 'styles'>
  >
  empty: Accessor<EmptyConfig>
  drawer: Accessor<DrawerConfig>
}
