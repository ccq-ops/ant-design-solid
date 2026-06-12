import { createContext, createMemo, useContext } from 'solid-js'
import { mergeTheme, type ComponentSize, type ThemeConfig } from '@ant-design-solid/theme'
import type { ConfigContextValue, TooltipConfig } from './interface'
const emptyTheme: ThemeConfig = {}
const emptyTooltip: TooltipConfig = {}
export const defaultConfigContext: ConfigContextValue = {
  prefixCls: () => 'ads',
  componentSize: () => 'middle' as ComponentSize,
  direction: () => 'ltr',
  theme: () => emptyTheme,
  token: () => mergeTheme(emptyTheme),
  tooltip: () => emptyTooltip,
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
  },
): ConfigContextValue {
  const theme = createMemo(() => mergeThemeConfig(parent.theme(), props.theme ?? {}))
  const tooltip = createMemo(() => ({ ...parent.tooltip(), ...props.tooltip }))
  return {
    prefixCls: createMemo(() => props.prefixCls ?? parent.prefixCls()),
    componentSize: createMemo(() => props.componentSize ?? parent.componentSize()),
    direction: createMemo(() => props.direction ?? parent.direction()),
    theme,
    token: createMemo(() => mergeTheme(theme())),
    getPopupContainer: props.getPopupContainer ?? parent.getPopupContainer,
    tooltip,
  }
}
