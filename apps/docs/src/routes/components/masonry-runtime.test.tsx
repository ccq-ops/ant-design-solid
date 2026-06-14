import { describe, expect, it } from 'vitest'
import { renderDocsPage } from '../../test-utils/render-docs-page'
import MasonryPage from './masonry.mdx'

function renderMasonryPage() {
  return renderDocsPage(() => <MasonryPage />)
}

describe('Masonry docs page', () => {
  it('renders all demos without runtime recursion errors', () => {
    const result = renderMasonryPage()

    expect(result.getByRole('heading', { name: 'Masonry', level: 1 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Basic', level: 3 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Responsive', level: 3 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Item children', level: 3 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Fixed columns', level: 3 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Dynamic items', level: 3 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Semantic styles', level: 3 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Layout change', level: 3 })).toBeInTheDocument()
    expect(result.container.querySelectorAll('[data-preview-root]')).toHaveLength(7)
    expect(result.container.querySelectorAll('[data-preview-stage]')).toHaveLength(7)
    expect(result.container.querySelectorAll('[data-preview-panel]')).toHaveLength(7)
  })
})
