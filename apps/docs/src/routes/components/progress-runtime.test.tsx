import { render } from '@solidjs/testing-library'
import { ConfigProvider } from '@ant-design-solid/core'
import { StyleProvider } from '@ant-design-solid/cssinjs'
import { describe, expect, it } from 'vitest'
import ProgressPage from './progress.mdx'

function renderProgressPage() {
  return render(() => (
    <StyleProvider>
      <ConfigProvider>
        <ProgressPage />
      </ConfigProvider>
    </StyleProvider>
  ))
}

describe('Progress docs page', () => {
  it('renders all demos without undefined runtime references', () => {
    const result = renderProgressPage()

    expect(result.getByRole('heading', { name: 'Progress', level: 1 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Basic line', level: 3 })).toBeInTheDocument()
    expect(
      result.getByRole('heading', { name: 'Circle and dashboard', level: 3 }),
    ).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Status', level: 3 })).toBeInTheDocument()
    expect(
      result.getByRole('heading', { name: 'Custom text format', level: 3 }),
    ).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Success segment', level: 3 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Steps', level: 3 })).toBeInTheDocument()
    expect(
      result.getByRole('heading', { name: 'Progress value position', level: 3 }),
    ).toBeInTheDocument()
    expect(
      result.getByRole('heading', { name: 'Stroke color and rail color', level: 3 }),
    ).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Stroke linecap', level: 3 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Size', level: 3 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Hidden info', level: 3 })).toBeInTheDocument()
    expect(result.getAllByText('Example')).toHaveLength(11)
    for (const exampleLabel of result.getAllByText('Example')) {
      expect(exampleLabel.closest('section')).not.toHaveAttribute('aria-label')
    }
  })
})
