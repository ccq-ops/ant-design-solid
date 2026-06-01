import { ConfigContext, createConfigValue, useConfig } from './context'
import type { ConfigProviderProps } from './interface'
export function ConfigProvider(props: ConfigProviderProps) {
  const value = createConfigValue(useConfig(), props)
  return <ConfigContext.Provider value={value}>{props.children}</ConfigContext.Provider>
}
