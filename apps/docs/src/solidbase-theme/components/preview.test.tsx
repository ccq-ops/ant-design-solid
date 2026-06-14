import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Preview, PreviewPanel, PreviewStage } from './preview'

describe('SolidBase preview components', () => {
  it('renders preview stage and panel landmarks used by migrated demos', () => {
    const result = render(() => (
      <Preview>
        <PreviewStage>
          <button type="button">Live demo</button>
        </PreviewStage>
        <PreviewPanel>
          <pre>source</pre>
        </PreviewPanel>
      </Preview>
    ))

    expect(result.container.querySelector('[data-preview-root]')).toBeInTheDocument()
    expect(result.container.querySelector('[data-preview-stage]')).toContainElement(
      result.getByRole('button', { name: 'Live demo' }),
    )
    expect(result.container.querySelector('[data-preview-panel]')).toHaveTextContent('source')
  })
})
