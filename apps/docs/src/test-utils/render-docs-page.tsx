import { render } from '@solidjs/testing-library'
import { ConfigProvider } from '@ant-design-solid/core'
import { StyleProvider, type StyleProviderProps } from '@ant-design-solid/cssinjs'
import * as mdxComponents from '@kobalte/solidbase/default-theme/mdx-components.jsx'
import { MDXProvider } from '@kobalte/solidbase/mdx'
import type { JSX } from 'solid-js'

function h1(props: JSX.HTMLAttributes<HTMLHeadingElement>) {
  return <h1 {...props} />
}

export function renderDocsPage(children: () => JSX.Element, props?: StyleProviderProps) {
  return render(() => (
    <StyleProvider {...props}>
      <ConfigProvider>
        <MDXProvider components={{ ...mdxComponents, h1 }}>{children()}</MDXProvider>
      </ConfigProvider>
    </StyleProvider>
  ))
}
