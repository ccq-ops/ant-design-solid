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

  it('supports orientation, vertical and separator aliases', () => {
    const result = render(() => (
      <Space vertical orientation="horizontal" separator={<span data-testid="separator">/</span>}>
        <span>A</span>
        <span>B</span>
      </Space>
    ))
    const space = result.container.firstElementChild as HTMLElement
    expect(space.className).not.toContain('ads-space-vertical')
    expect(result.getByTestId('separator')).toHaveTextContent('/')
  })

  it('uses small size by default and accepts preset tuple gaps', () => {
    const result = render(() => (
      <Space size={['small', 'large']}>
        <span>A</span>
        <span>B</span>
      </Space>
    ))
    const space = result.container.firstElementChild as HTMLElement
    expect(space.style.columnGap).toBe('8px')
    expect(space.style.rowGap).toBe('16px')
  })

  it('merges root class, style and semantic customizations', () => {
    const result = render(() => (
      <Space
        class="custom-root"
        style={{ width: '320px' }}
        classNames={{ item: 'custom-item', split: 'custom-split' }}
        styles={{ item: { color: 'red' }, split: { color: 'blue' } }}
        separator={<span>/</span>}
      >
        <span>A</span>
        <span>B</span>
      </Space>
    ))
    const space = result.container.firstElementChild as HTMLElement
    const item = result.container.querySelector<HTMLElement>('.ads-space-item')
    const split = result.container.querySelector<HTMLElement>('.ads-space-split')
    expect(space.className).toContain('custom-root')
    expect(space.style.width).toBe('320px')
    expect(space.style.columnGap).toBe('8px')
    expect(item).toHaveClass('custom-item')
    expect(item?.style.color).toBe('red')
    expect(split).toHaveClass('custom-split')
    expect(split?.style.color).toBe('blue')
  })

  it('supports function semantic customizations', () => {
    const result = render(() => (
      <Space
        size="large"
        classNames={({ props }) => ({ item: props.size === 'large' ? 'large-item' : '' })}
        styles={({ props }) => ({ item: { margin: props.size === 'large' ? '1px' : '0px' } })}
      >
        <span>A</span>
      </Space>
    ))
    const item = result.container.querySelector<HTMLElement>('.ads-space-item')
    expect(item).toHaveClass('large-item')
    expect(item?.style.margin).toBe('1px')
  })

  it('renders compact layouts and addon cells', () => {
    const result = render(() => (
      <Space.Compact block size="large">
        <Button>One</Button>
        <Space.Addon>Addon</Space.Addon>
        <Button>Two</Button>
      </Space.Compact>
    ))
    const compact = result.container.firstElementChild as HTMLElement
    const addon = result.getByText('Addon')
    expect(compact).toHaveClass('ads-space-compact')
    expect(compact).toHaveClass('ads-space-compact-block')
    expect(compact).toHaveClass('ads-space-compact-lg')
    expect(addon).toHaveClass('ads-space-compact-addon')
  })

  it('supports compact orientation and vertical alias priority', () => {
    const result = render(() => (
      <Space.Compact vertical orientation="horizontal">
        <Button>One</Button>
        <Button>Two</Button>
      </Space.Compact>
    ))
    const compact = result.container.firstElementChild as HTMLElement
    expect(compact).toHaveClass('ads-space-compact')
    expect(compact).not.toHaveClass('ads-space-compact-vertical')
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
