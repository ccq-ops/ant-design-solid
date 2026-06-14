import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { PreviewPanel } from './mdx-components'

describe('Docs PreviewPanel', () => {
  it('collapses source code by default and expands it on demand', () => {
    const result = render(() => (
      <PreviewPanel>
        <pre>
          <code>const Demo = () =&gt; &lt;Button&gt;Click&lt;/Button&gt;</code>
        </pre>
      </PreviewPanel>
    ))

    const panel = result.container.querySelector('[data-preview-panel]')
    const source = result.getByText(/const Demo/)
    const toggle = result.getByRole('button', { name: 'Show code' })

    expect(panel).toHaveAttribute('data-collapsed', 'true')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(source).not.toBeVisible()

    fireEvent.click(toggle)

    expect(panel).toHaveAttribute('data-collapsed', 'false')
    expect(result.getByRole('button', { name: 'Hide code' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    expect(source).toBeVisible()
  })

  it('links the source code to the playground with encoded code', () => {
    const result = render(() => (
      <PreviewPanel>
        <pre>
          <code>{'import { Button } from "@ant-design-solid/core"\n\nexport default Demo'}</code>
        </pre>
      </PreviewPanel>
    ))

    const link = result.getByRole('link', { name: 'Open in playground' })
    const href = link.getAttribute('href') ?? ''
    const params = new URLSearchParams(href.split('?')[1])

    expect(href.startsWith('/playground?')).toBe(true)
    expect(params.get('code')).toBe(
      'import { Button } from "@ant-design-solid/core"\n\nexport default Demo',
    )
  })

  it('does not link to an empty playground source before rendered code is available', () => {
    const result = render(() => <PreviewPanel>{undefined}</PreviewPanel>)

    expect(result.queryByRole('link', { name: 'Open in playground' })).toBeNull()
    expect(result.getByText('Playground unavailable')).toBeInTheDocument()
  })
})
