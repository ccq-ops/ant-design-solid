import { ConfigContext, createConfigValue, setGlobalConfig, useConfig } from './context'
import type { ConfigProviderProps, GlobalConfigProps } from './interface'

function ConfigProviderComponent(props: ConfigProviderProps) {
  const value = createConfigValue(useConfig(), props)
  return <ConfigContext.Provider value={value}>{props.children}</ConfigContext.Provider>
}

export const ConfigProvider = Object.assign(ConfigProviderComponent, {
  ConfigContext,
  config: (props: GlobalConfigProps) => setGlobalConfig(props),
  useConfig,
})
