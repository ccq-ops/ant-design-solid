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
    expect(result.getByLabelText('Basic')).toBeInTheDocument()
    expect(result.getByLabelText('With text')).toBeInTheDocument()
    expect(result.getByLabelText('Variants')).toBeInTheDocument()
    expect(result.getByLabelText('Vertical')).toBeInTheDocument()
    expect(result.getAllByText('Example')).toHaveLength(4)
  })
})
