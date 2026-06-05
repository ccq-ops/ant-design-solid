import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Button } from '../../button'
import { Popover } from '../../popover'
import { Space } from '../index'

describe('Space', () => {
  it('renders children with horizontal gap', () => {
    const result = render(() => (
      <Space size="large">
        <span>A</span>
        <span>B</span>
      </Space>
    ))
    const space = result.container.firstElementChild as HTMLElement
    expect(space.className).toContain('ads-space')
    expect(space.style.columnGap).toBe('16px')
  })
  it('supports vertical direction, wrap and split', () => {
    const result = render(() => (
      <Space direction="vertical" wrap split={<span data-testid="split">|</span>}>
        <span>A</span>
        <span>B</span>
      </Space>
    ))
    const space = result.container.firstElementChild as HTMLElement
    expect(space.className).toContain('ads-space-vertical')
    expect(space.className).toContain('ads-space-wrap')
    expect(result.getByTestId('split')).toHaveTextContent('|')
  })

  it('does not create an empty item for a popover portal marker', () => {
    const result = render(() => (
      <Space wrap>
        <Popover trigger="click" title="Click" content="Clicked content">
          <Button>Click</Button>
        </Popover>
        <Popover trigger="focus" title="Focus" content="Focused content">
          <Button>Focus</Button>
        </Popover>
      </Space>
    ))

    fireEvent.click(result.getByRole('button', { name: 'Click' }))

    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Clicked content')
    const items = Array.from(result.container.querySelectorAll<HTMLElement>('.ads-space-item'))
    expect(items).toHaveLength(2)
    expect(items.map((item) => item.textContent)).toEqual(['Click', 'Focus'])
  })
})
