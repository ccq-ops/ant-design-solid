import { render } from '@solidjs/testing-library'
import { ConfigProvider } from '@ant-design-solid/core'
import { StyleProvider } from '@ant-design-solid/cssinjs'
import { describe, expect, it } from 'vitest'
import MasonryPage from './masonry.mdx'

function renderMasonryPage() {
  return render(() => (
    <StyleProvider>
      <ConfigProvider>
        <MasonryPage />
      </ConfigProvider>
    </StyleProvider>
  ))
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
    expect(result.getAllByText('Example')).toHaveLength(7)
    for (const exampleLabel of result.getAllByText('Example')) {
      expect(exampleLabel.closest('section')).not.toHaveAttribute('aria-label')
    }
  })
})
