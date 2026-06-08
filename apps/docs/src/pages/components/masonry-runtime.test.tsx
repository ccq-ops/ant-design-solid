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
    expect(result.getByLabelText('Basic')).toBeInTheDocument()
    expect(result.getByLabelText('Responsive')).toBeInTheDocument()
    expect(result.getByLabelText('Gallery')).toBeInTheDocument()
    expect(result.getByLabelText('Dynamic items')).toBeInTheDocument()
    expect(result.getAllByText('Example')).toHaveLength(4)
  })
})
