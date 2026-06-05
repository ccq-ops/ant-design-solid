import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { InternalPortal } from '../portal'

describe('InternalPortal', () => {
  it('mounts children into a custom container', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    render(() => (
      <InternalPortal mount={() => container}>
        <div>Portaled content</div>
      </InternalPortal>
    ))

    expect(container).toContainElement(screen.getByText('Portaled content'))
  })
})
