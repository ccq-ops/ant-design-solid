import { createContext, createMemo, useContext } from 'solid-js'
import { mergeTheme, type ComponentSize, type ThemeConfig } from '@solid-ant-design/theme'
import type {
  ConfigComponentProps,
  ConfigContextValue,
  ConfigProviderProps,
  GlobalConfigProps,
} from './interface'

const emptyTheme: ThemeConfig = {}
const emptyObject = {}
const globalConfig: GlobalConfigProps = {}
const globalConfigListeners = new Set<() => void>()

function emptyAccessor<T extends object>(): () => T {
  return () => emptyObject as T
}

function mergeThemeConfig(parent: ThemeConfig, child: ThemeConfig): ThemeConfig {
  if (child.inherit === false) return child
  return {
    algorithm: child.algorithm ?? parent.algorithm,
    token: { ...parent.token, ...child.token },
    components: { ...parent.components, ...child.components },
    inherit: child.inherit ?? parent.inherit,
    hashed: child.hashed ?? parent.hashed,
    cssVar: child.cssVar ?? parent.cssVar,
    zeroRuntime: child.zeroRuntime ?? parent.zeroRuntime,
  }
}

const componentConfigKeys = [
  'affix',
  'alert',
  'anchor',
  'app',
  'avatar',
  'badge',
  'borderBeam',
  'breadcrumb',
  'button',
  'calendar',
  'card',
  'cardMeta',
  'carousel',
  'cascader',
  'checkbox',
  'collapse',
  'colorPicker',
  'datePicker',
  'rangePicker',
  'descriptions',
  'divider',
  'drawer',
  'dropdown',
  'empty',
  'flex',
  'floatButton',
  'floatButtonGroup',
  'form',
  'image',
  'input',
  'inputPassword',
  'inputSearch',
  'otp',
  'inputNumber',
  'textArea',
  'layout',
  'masonry',
  'mentions',
  'menu',
  'message',
  'modal',
  'notification',
  'pagination',
  'popconfirm',
  'popover',
  'progress',
  'qrcode',
  'radio',
  'rate',
  'result',
  'ribbon',
  'segmented',
  'select',
  'skeleton',
  'slider',
  'space',
  'spin',
  'splitter',
  'statistic',
  'steps',
  'switch',
  'table',
  'tabs',
  'tag',
  'timeline',
  'timePicker',
  'tooltip',
  'tour',
  'transfer',
  'tree',
  'treeSelect',
  'typography',
  'upload',
  'watermark',
] as const satisfies ReadonlyArray<keyof ConfigComponentProps>

function componentAccessors(parent: ConfigContextValue, props: ConfigProviderProps) {
  const entries = componentConfigKeys.map((key) => [
    key,
    createMemo(() => ({
      ...parent[key](),
      ...(props[key] as object | undefined),
    })),
  ])
  return Object.fromEntries(entries) as Pick<ConfigContextValue, keyof ConfigComponentProps>
}

export const defaultConfigContext: ConfigContextValue = {
  prefixCls: () => globalConfig.prefixCls ?? 'ads',
  iconPrefixCls: () => globalConfig.iconPrefixCls ?? 'adsicon',
  componentSize: () => 'middle' as ComponentSize,
  componentDisabled: () => false,
  direction: () => 'ltr',
  theme: () => globalConfig.theme ?? emptyTheme,
  token: () => mergeTheme(globalConfig.theme ?? emptyTheme),
  csp: emptyAccessor(),
  variant: () => 'outlined',
  locale: () => undefined,
  virtual: () => true,
  popupMatchSelectWidth: () => undefined,
  popupOverflow: () => 'viewport',
  warning: emptyAccessor(),
  wave: emptyAccessor(),
  ...Object.fromEntries(componentConfigKeys.map((key) => [key, emptyAccessor()])),
} as ConfigContextValue

export const ConfigContext = createContext<ConfigContextValue>(defaultConfigContext)

export function useConfig(): ConfigContextValue {
  return useContext(ConfigContext)
}

export function useToken() {
  return useConfig().token
}

export function getGlobalConfig(): GlobalConfigProps {
  return globalConfig
}

export function subscribeGlobalConfig(listener: () => void): () => void {
  globalConfigListeners.add(listener)
  return () => globalConfigListeners.delete(listener)
}

export function createConfigValue(
  parent: ConfigContextValue,
  props: ConfigProviderProps,
): ConfigContextValue {
  const theme = createMemo(() => mergeThemeConfig(parent.theme(), props.theme ?? {}))
  return {
    ...componentAccessors(parent, props),
    prefixCls: createMemo(() => props.prefixCls ?? parent.prefixCls()),
    iconPrefixCls: createMemo(() => props.iconPrefixCls ?? parent.iconPrefixCls()),
    componentSize: createMemo(() => props.componentSize ?? parent.componentSize()),
    componentDisabled: createMemo(() => props.componentDisabled ?? parent.componentDisabled()),
    direction: createMemo(() => props.direction ?? parent.direction()),
    theme,
    token: createMemo(() => mergeTheme(theme())),
    getTargetContainer: props.getTargetContainer ?? parent.getTargetContainer,
    getPopupContainer: props.getPopupContainer ?? parent.getPopupContainer,
    renderEmpty: props.renderEmpty ?? parent.renderEmpty,
    csp: createMemo(() => ({ ...parent.csp(), ...props.csp })),
    variant: createMemo(() => props.variant ?? parent.variant()),
    locale: createMemo(() => props.locale ?? parent.locale()),
    virtual: createMemo(() => props.virtual ?? parent.virtual()),
    popupMatchSelectWidth: createMemo(
      () => props.popupMatchSelectWidth ?? parent.popupMatchSelectWidth(),
    ),
    popupOverflow: createMemo(() => props.popupOverflow ?? parent.popupOverflow()),
    warning: createMemo(() => ({ ...parent.warning(), ...props.warning })),
    wave: createMemo(() => ({ ...parent.wave(), ...props.wave })),
  }
}

export function setGlobalConfig(config: GlobalConfigProps): void {
  Object.assign(globalConfig, config)
  globalConfigListeners.forEach((listener) => listener())
}
