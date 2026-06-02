import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Divider } from '../index'

describe('Divider', () => {
  it('renders a horizontal separator by default', () => {
    const result = render(() => <Divider data-testid="divider" />)
    const divider = result.getByTestId('divider')

    expect(divider.className).toContain('ads-divider')
    expect(divider.className).toContain('ads-divider-horizontal')
    expect(divider.className).not.toContain('ads-divider-with-text')
  })

  it('renders horizontal text with orientation and plain classes', () => {
    const result = render(() => (
      <Divider orientation="left" plain>
        Text
      </Divider>
    ))
    const divider = result.container.firstElementChild as HTMLElement

    expect(divider.className).toContain('ads-divider-with-text')
    expect(divider.className).toContain('ads-divider-with-text-left')
    expect(divider.className).toContain('ads-divider-plain')
    expect(result.getByText('Text')).toHaveClass('ads-divider-inner-text')
  })

  it('renders a vertical dashed separator without text', () => {
    const result = render(() => (
      <Divider type="vertical" dashed orientation="right">
        Ignored
      </Divider>
    ))
    const divider = result.container.firstElementChild as HTMLElement

    expect(divider).toHaveAttribute('role', 'separator')
    expect(divider.className).toContain('ads-divider-vertical')
    expect(divider.className).toContain('ads-divider-dashed')
    expect(divider.className).not.toContain('ads-divider-with-text')
    expect(result.queryByText('Ignored')).toBeNull()
  })
})
