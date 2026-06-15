import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { renderDocsPage } from '../../test-utils/render-docs-page'
import MasonryPage from './masonry.mdx'

const masonrySource = readFileSync(
  resolve(process.cwd(), 'src/routes/components/masonry.mdx'),
  'utf8',
)

function renderMasonryPage() {
  return renderDocsPage(() => <MasonryPage />)
}

describe('Masonry docs page', () => {
  it('renders all demos without runtime recursion errors', () => {
    const result = renderMasonryPage()

    expect(result.getByRole('heading', { name: 'Masonry', level: 1 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Basic', level: 3 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Responsive', level: 3 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Image', level: 3 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Dynamic', level: 3 })).toBeInTheDocument()
    expect(
      result.getByRole('heading', { name: 'Custom semantic dom styling', level: 3 }),
    ).toBeInTheDocument()
    expect(
      result.queryByRole('heading', { name: 'Item children', level: 3 }),
    ).not.toBeInTheDocument()
    expect(
      result.queryByRole('heading', { name: 'Fixed columns', level: 3 }),
    ).not.toBeInTheDocument()
    expect(
      result.queryByRole('heading', { name: 'Layout change', level: 3 }),
    ).not.toBeInTheDocument()
    expect(result.container.querySelectorAll('[data-preview-root]')).toHaveLength(5)
    expect(result.container.querySelectorAll('[data-preview-stage]')).toHaveLength(5)
    expect(result.container.querySelectorAll('[data-preview-panel]')).toHaveLength(5)
  })

  it('uses theme-aware color tokens in demos', () => {
    expect(masonrySource).not.toMatch(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/)
    expect(masonrySource).toContain('var(--docs-')
  })
})
