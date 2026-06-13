import { render } from '@solidjs/testing-library'
import { ConfigProvider } from '@ant-design-solid/core'
import { StyleProvider, createCache, extractStyle } from '@ant-design-solid/cssinjs'
import { describe, expect, it } from 'vitest'
import FormPage from './form.mdx'

function renderFormPage() {
  const cache = createCache()
  const result = render(() => (
    <StyleProvider cache={cache}>
      <ConfigProvider>
        <FormPage />
      </ConfigProvider>
    </StyleProvider>
  ))
  return { cache, result }
}

describe('Form docs page', () => {
  it('keeps token demo label color isolated from default form demos', () => {
    const { cache, result } = renderFormPage()

    expect(result.getByRole('heading', { name: 'Form', level: 1 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Component Token', level: 3 })).toBeInTheDocument()

    const css = extractStyle(cache)
    expect(css).toContain('.ads-form-item-label{color:rgba(0,0,0,0.88);')
    expect(css).toContain('.ads-token-form-item-label{color:#1677ff;')
  })
})
