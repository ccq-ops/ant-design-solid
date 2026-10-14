import { createUniqueId } from 'solid-js'
import { StyleProvider } from '@solid-ant-design/cssinjs'
import { ConfigContext, createConfigValue, setGlobalConfig, useConfig } from './context'
import type { ConfigProviderProps, GlobalConfigProps } from './interface'

function ConfigProviderComponent(props: ConfigProviderProps) {
  const value = createConfigValue(useConfig(), props)
  const generatedCssVarKey = `css-var-${createUniqueId().replaceAll(':', '')}`
  const cssVar = () => {
    const config = value.theme().cssVar
    if (!config) return undefined
    if (typeof config === 'object') {
      return {
        key: config.key ?? generatedCssVarKey,
        prefix: config.prefix ?? value.prefixCls(),
      }
    }
    return {
      key: generatedCssVarKey,
      prefix: value.prefixCls(),
    }
  }
  return (
    <ConfigContext.Provider value={value}>
      <StyleProvider
        hashed={value.theme().hashed}
        nonce={value.csp().nonce}
        cssVar={cssVar()}
        zeroRuntime={value.theme().zeroRuntime}
      >
        {props.children}
      </StyleProvider>
    </ConfigContext.Provider>
  )
}

export const ConfigProvider = Object.assign(ConfigProviderComponent, {
  ConfigContext,
  config: (props: GlobalConfigProps) => setGlobalConfig(props),
  useConfig,
})
