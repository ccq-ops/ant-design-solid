import { describe, expect, it } from 'vitest'
import { renderDocsPage } from '../../test-utils/render-docs-page'
import DividerPage from './divider.mdx'

function renderDividerPage() {
  return renderDocsPage(() => <DividerPage />)
}

describe('Divider docs page', () => {
  it('renders all demos without undefined runtime references', () => {
    const result = renderDividerPage()

    expect(result.getByRole('heading', { name: 'Divider', level: 1 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Basic', level: 3 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'With text', level: 3 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Plain', level: 3 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Vertical', level: 3 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Variant', level: 3 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Size', level: 3 })).toBeInTheDocument()
    expect(result.container.querySelectorAll('[data-preview-root]')).toHaveLength(6)
    expect(result.container.querySelectorAll('[data-preview-stage]')).toHaveLength(6)
    expect(result.container.querySelectorAll('[data-preview-panel]')).toHaveLength(6)
  })
})
