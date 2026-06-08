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
    expect(result.getByLabelText('Basic line')).toBeInTheDocument()
    expect(result.getByLabelText('Circle and dashboard')).toBeInTheDocument()
    expect(result.getByLabelText('Status')).toBeInTheDocument()
    expect(result.getByLabelText('Custom text format')).toBeInTheDocument()
    expect(result.getByLabelText('Success segment')).toBeInTheDocument()
    expect(result.getByLabelText('Steps')).toBeInTheDocument()
    expect(result.getByLabelText('Progress value position')).toBeInTheDocument()
    expect(result.getByLabelText('Stroke color and rail color')).toBeInTheDocument()
    expect(result.getByLabelText('Stroke linecap')).toBeInTheDocument()
    expect(result.getByLabelText('Size')).toBeInTheDocument()
    expect(result.getByLabelText('Hidden info')).toBeInTheDocument()
    expect(result.getAllByText('Example')).toHaveLength(11)
  })
})
