import { render } from '@solidjs/testing-library'
import { afterEach, describe, expect, it } from 'vitest'
import { Masonry } from '../index'

function setViewportWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  })
  window.dispatchEvent(new Event('resize'))
}

afterEach(() => {
  setViewportWidth(1024)
})

describe('Masonry', () => {
  it('resolves responsive columns and gutter from the active breakpoint', () => {
    setViewportWidth(800)

    const result = render(() => (
      <Masonry
        columns={{ xs: 1, md: 3, xl: 5 }}
        gutter={{ xs: 4, md: 12, xl: 24 }}
        items={[
          { key: 'a', title: 'A' },
          { key: 'b', title: 'B' },
          { key: 'c', title: 'C' },
        ]}
        itemRender={(item) => <div>{item.title}</div>}
      />
    ))

    const root = result.container.querySelector<HTMLElement>('.ads-masonry')!
    expect(result.container.querySelectorAll('.ads-masonry-column')).toHaveLength(3)
    expect(root.style.getPropertyValue('--ads-masonry-gutter')).toBe('12px')
  })

  it('passes the original item index to itemRender after round-robin distribution', () => {
    const indexes: number[] = []

    render(() => (
      <Masonry
        columns={2}
        items={[{ key: 'a' }, { key: 'b' }, { key: 'c' }]}
        itemRender={(_, index) => {
          indexes.push(index)
          return <span>{index}</span>
        }}
      />
    ))

    expect(indexes).toEqual([0, 2, 1])
  })

  it('merges string root styles with the masonry gutter CSS variable', () => {
    const result = render(() => <Masonry gutter={8} style="color: red;" />)

    const root = result.container.querySelector<HTMLElement>('.ads-masonry')!
    expect(root.style.getPropertyValue('--ads-masonry-gutter')).toBe('8px')
    expect(root.style.color).toBe('red')
  })

  it('renders four columns by default and distributes item mode content round-robin before measurement', () => {
    const result = render(() => (
      <Masonry
        items={[
          { key: 'a', title: 'A' },
          { key: 'b', title: 'B' },
          { key: 'c', title: 'C' },
          { key: 'd', title: 'D' },
          { key: 'e', title: 'E' },
        ]}
        itemRender={(item) => <span>{item.title}</span>}
      />
    ))

    const columns = result.container.querySelectorAll('.ads-masonry-column')
    expect(columns).toHaveLength(4)
    expect(columns[0]).toHaveTextContent('A')
    expect(columns[0]).toHaveTextContent('E')
    expect(columns[1]).toHaveTextContent('B')
    expect(columns[2]).toHaveTextContent('C')
    expect(columns[3]).toHaveTextContent('D')
  })

  it('applies item classNames and styles', () => {
    const result = render(() => (
      <Masonry
        columns={2}
        items={[{ key: 'a', title: 'A' }]}
        itemRender={(item) => <span>{item.title}</span>}
        classNames={{ item: 'custom-item' }}
        styles={{ item: { color: 'red' } }}
      />
    ))

    const item = result.container.querySelector<HTMLElement>('.ads-masonry-item')!
    expect(item).toHaveClass('custom-item')
    expect(item).toHaveStyle({ color: 'rgb(255, 0, 0)' })
  })

  it('renders children when items are omitted', () => {
    const result = render(() => (
      <Masonry columns={2}>
        <div>First child</div>
        <div>Second child</div>
      </Masonry>
    ))

    expect(result.container.querySelectorAll('.ads-masonry-item')).toHaveLength(2)
    expect(result.container).toHaveTextContent('First child')
    expect(result.container).toHaveTextContent('Second child')
  })

  it('calls onLayoutChange with column and item layout information', () => {
    let layoutColumns = 0
    let layoutItemCount = 0

    render(() => (
      <Masonry
        columns={2}
        items={[
          { key: 'a', title: 'A' },
          { key: 'b', title: 'B' },
        ]}
        itemRender={(item) => <span>{item.title}</span>}
        onLayoutChange={(info) => {
          layoutColumns = info.columns
          layoutItemCount = info.items.length
        }}
      />
    ))

    expect(layoutColumns).toBe(2)
    expect(layoutItemCount).toBe(2)
  })
})

it('does not recurse when fresh masonry measures the same height during render', () => {
  expect(() => {
    render(() => (
      <Masonry
        fresh
        columns={2}
        items={[{ key: 'a', title: 'A' }]}
        itemRender={(item) => <span>{item.title}</span>}
      />
    ))
  }).not.toThrow()
})
