import { createCache, extractStyle } from '@ant-design-solid/cssinjs'
import { describe, expect, it } from 'vitest'
import { renderDocsPage } from '../../test-utils/render-docs-page'
import FormPage from './form.mdx'

function renderFormPage() {
  const cache = createCache()
  const result = renderDocsPage(() => <FormPage />, { cache })
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
