import { createContext, createMemo, useContext } from 'solid-js'
import { mergeTheme, type ComponentSize, type ThemeConfig } from '@ant-design-solid/theme'
import type { ConfigContextValue, DrawerConfig, EmptyConfig, TooltipConfig } from './interface'
import type { NotificationConfig } from '../notification/interface'
import type { MessageConfigOptions } from '../message/interface'
const emptyTheme: ThemeConfig = {}
const emptyTooltip: TooltipConfig = {}
const emptyNotification: Pick<NotificationConfig, 'closeIcon' | 'classNames' | 'styles'> = {}
const emptyMessage: Pick<
  MessageConfigOptions,
  'class' | 'className' | 'style' | 'classNames' | 'styles'
> = {}
const emptyEmpty: EmptyConfig = {}
const emptyDrawer: DrawerConfig = {}
export const defaultConfigContext: ConfigContextValue = {
  prefixCls: () => 'ads',
  componentSize: () => 'middle' as ComponentSize,
  direction: () => 'ltr',
  theme: () => emptyTheme,
  token: () => mergeTheme(emptyTheme),
  tooltip: () => emptyTooltip,
  notification: () => emptyNotification,
  message: () => emptyMessage,
  empty: () => emptyEmpty,
  drawer: () => emptyDrawer,
}
export const ConfigContext = createContext<ConfigContextValue>(defaultConfigContext)
export function useConfig(): ConfigContextValue {
  return useContext(ConfigContext)
}
export function useToken() {
  return useConfig().token
}
export function mergeThemeConfig(parent: ThemeConfig, child: ThemeConfig): ThemeConfig {
  return {
    algorithm: child.algorithm ?? parent.algorithm,
    token: { ...parent.token, ...child.token },
    components: { ...parent.components, ...child.components },
  }
}
export function createConfigValue(
  parent: ConfigContextValue,
  props: {
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
  },
): ConfigContextValue {
  const theme = createMemo(() => mergeThemeConfig(parent.theme(), props.theme ?? {}))
  const tooltip = createMemo(() => ({ ...parent.tooltip(), ...props.tooltip }))
  const notification = createMemo(() => ({ ...parent.notification(), ...props.notification }))
  const message = createMemo(() => ({ ...parent.message(), ...props.message }))
  const empty = createMemo(() => ({ ...parent.empty(), ...props.empty }))
  const drawer = createMemo(() => ({ ...parent.drawer(), ...props.drawer }))
  return {
    prefixCls: createMemo(() => props.prefixCls ?? parent.prefixCls()),
    componentSize: createMemo(() => props.componentSize ?? parent.componentSize()),
    direction: createMemo(() => props.direction ?? parent.direction()),
    theme,
    token: createMemo(() => mergeTheme(theme())),
    getPopupContainer: props.getPopupContainer ?? parent.getPopupContainer,
    tooltip,
    notification,
    message,
    empty,
    drawer,
  }
}
