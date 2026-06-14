import { render } from '@solidjs/testing-library'
import { ConfigProvider } from '@ant-design-solid/core'
import { StyleProvider, type StyleProviderProps } from '@ant-design-solid/cssinjs'
import { MDXProvider } from '@kobalte/solidbase/mdx'
import type { JSX } from 'solid-js'
import * as mdxComponents from '../solidbase-theme/mdx-components'

export function renderDocsPage(children: () => JSX.Element, props?: StyleProviderProps) {
  return render(() => (
    <StyleProvider {...props}>
      <ConfigProvider>
        <MDXProvider components={mdxComponents}>{children()}</MDXProvider>
      </ConfigProvider>
    </StyleProvider>
  ))
}
