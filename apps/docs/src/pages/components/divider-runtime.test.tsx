import { render } from '@solidjs/testing-library'
import { ConfigProvider } from '@ant-design-solid/core'
import { StyleProvider } from '@ant-design-solid/cssinjs'
import { describe, expect, it } from 'vitest'
import DividerPage from './divider.mdx'

function renderDividerPage() {
  return render(() => (
    <StyleProvider>
      <ConfigProvider>
        <DividerPage />
      </ConfigProvider>
    </StyleProvider>
  ))
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
    expect(result.getAllByText('Example')).toHaveLength(6)
    for (const exampleLabel of result.getAllByText('Example')) {
      expect(exampleLabel.closest('section')).not.toHaveAttribute('aria-label')
    }
  })
})
