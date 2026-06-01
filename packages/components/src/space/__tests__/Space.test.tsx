import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Space } from '../index'

describe('Space', () => {
  it('renders children with horizontal gap', () => {
    const result = render(() => <Space size="large"><span>A</span><span>B</span></Space>)
    const space = result.container.firstElementChild as HTMLElement
    expect(space.className).toContain('ads-space')
    expect(space.style.columnGap).toBe('16px')
  })
  it('supports vertical direction, wrap and split', () => {
    const result = render(() => <Space direction="vertical" wrap split={<span data-testid="split">|</span>}><span>A</span><span>B</span></Space>)
    const space = result.container.firstElementChild as HTMLElement
    expect(space.className).toContain('ads-space-vertical')
    expect(space.className).toContain('ads-space-wrap')
    expect(result.getByTestId('split')).toHaveTextContent('|')
  })
})
