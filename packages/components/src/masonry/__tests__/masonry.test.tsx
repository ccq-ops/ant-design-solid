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
          { key: 'a', data: { title: 'A' } },
          { key: 'b', data: { title: 'B' } },
          { key: 'c', data: { title: 'C' } },
        ]}
        itemRender={(item) => <div>{item.data.title}</div>}
      />
    ))

    const root = result.container.querySelector<HTMLElement>('.ads-masonry')!
    expect(result.container.querySelectorAll('.ads-masonry-column')).toHaveLength(3)
    expect(root.style.getPropertyValue('--ads-masonry-horizontal-gutter')).toBe('12px')
    expect(root.style.getPropertyValue('--ads-masonry-vertical-gutter')).toBe('12px')
  })

  it('uses antd compatible defaults', () => {
    const result = render(() => (
      <Masonry
        items={[
          { key: 'a', data: { title: 'A' } },
          { key: 'b', data: { title: 'B' } },
          { key: 'c', data: { title: 'C' } },
        ]}
        itemRender={(item) => <span>{item.data.title}</span>}
      />
    ))

    const root = result.container.querySelector<HTMLElement>('.ads-masonry')!
    expect(result.container.querySelectorAll('.ads-masonry-column')).toHaveLength(3)
    expect(root.style.getPropertyValue('--ads-masonry-horizontal-gutter')).toBe('0px')
    expect(root.style.getPropertyValue('--ads-masonry-vertical-gutter')).toBe('0px')
  })

  it('passes index and column in the itemRender info', () => {
    const rendered: Array<{ key: string | number; index: number; column: number }> = []

    render(() => (
      <Masonry
        columns={2}
        items={[
          { key: 'a', data: { title: 'A' } },
          { key: 'b', data: { title: 'B' } },
          { key: 'c', data: { title: 'C' } },
        ]}
        itemRender={(item) => {
          rendered.push({ key: item.key, index: item.index, column: item.column })
          return <span>{item.index}</span>
        }}
      />
    ))

    expect(rendered).toEqual([
      { key: 'a', index: 0, column: 0 },
      { key: 'c', index: 2, column: 0 },
      { key: 'b', index: 1, column: 1 },
    ])
  })

  it('supports horizontal and vertical gutter tuple values', () => {
    const result = render(() => <Masonry gutter={[8, 20]} style="color: red;" />)

    const root = result.container.querySelector<HTMLElement>('.ads-masonry')!
    expect(root.style.getPropertyValue('--ads-masonry-horizontal-gutter')).toBe('8px')
    expect(root.style.getPropertyValue('--ads-masonry-vertical-gutter')).toBe('20px')
    expect(root.style.color).toBe('red')
  })

  it('renders three columns by default and distributes item mode content round-robin before measurement', () => {
    const result = render(() => (
      <Masonry
        items={[
          { key: 'a', data: { title: 'A' } },
          { key: 'b', data: { title: 'B' } },
          { key: 'c', data: { title: 'C' } },
          { key: 'd', data: { title: 'D' } },
        ]}
        itemRender={(item) => <span>{item.data.title}</span>}
      />
    ))

    const columns = result.container.querySelectorAll('.ads-masonry-column')
    expect(columns).toHaveLength(3)
    expect(columns[0]).toHaveTextContent('A')
    expect(columns[0]).toHaveTextContent('D')
    expect(columns[1]).toHaveTextContent('B')
    expect(columns[2]).toHaveTextContent('C')
  })

  it('uses item children before itemRender', () => {
    const result = render(() => (
      <Masonry
        items={[
          { key: 'a', data: { title: 'A' }, children: <strong>Child content</strong> },
          { key: 'b', data: { title: 'B' } },
        ]}
        itemRender={(item) => <span>Rendered {item.data.title}</span>}
      />
    ))

    expect(result.container).toHaveTextContent('Child content')
    expect(result.container).not.toHaveTextContent('Rendered A')
    expect(result.container).toHaveTextContent('Rendered B')
  })

  it('places items with an explicit column into that column', () => {
    const result = render(() => (
      <Masonry
        columns={3}
        items={[
          { key: 'a', column: 2, data: { title: 'A' } },
          { key: 'b', data: { title: 'B' } },
        ]}
        itemRender={(item) => <span>{item.data.title}</span>}
      />
    ))

    const columns = result.container.querySelectorAll('.ads-masonry-column')
    expect(columns[0]).toHaveTextContent('B')
    expect(columns[2]).toHaveTextContent('A')
  })

  it('uses item height metadata before DOM measurements are available', () => {
    let columnHeights: number[] = []

    render(() => (
      <Masonry
        columns={2}
        gutter={10}
        items={[
          { key: 'a', height: 40, data: { title: 'A' } },
          { key: 'b', height: 90, data: { title: 'B' } },
          { key: 'c', height: 20, data: { title: 'C' } },
        ]}
        itemRender={(item) => <span>{item.data.title}</span>}
        onLayoutInfoChange={(info) => {
          columnHeights = info.columnHeights
        }}
      />
    ))

    expect(columnHeights).toEqual([70, 90])
  })

  it('applies semantic classNames and styles', () => {
    const result = render(() => (
      <Masonry
        columns={2}
        items={[{ key: 'a', data: { title: 'A' } }]}
        itemRender={(item) => <span>{item.data.title}</span>}
        classNames={({ props }) => ({
          root: props.columns === 2 ? 'custom-root' : 'wrong-root',
          item: 'custom-item',
        })}
        styles={({ props }) => ({
          root: { width: props.columns === 2 ? '222px' : '111px' },
          item: { color: 'red' },
        })}
      />
    ))

    const root = result.container.querySelector<HTMLElement>('.ads-masonry')!
    const item = result.container.querySelector<HTMLElement>('.ads-masonry-item')!
    expect(root).toHaveClass('custom-root')
    expect(root).toHaveStyle({ width: '222px' })
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

  it('calls onLayoutChange with key and column order', () => {
    let layoutItems: Array<{ key: string | number; column: number }> = []

    render(() => (
      <Masonry
        columns={2}
        items={[
          { key: 'a', data: { title: 'A' } },
          { key: 'b', data: { title: 'B' } },
        ]}
        itemRender={(item) => <span>{item.data.title}</span>}
        onLayoutChange={(info) => {
          layoutItems = info
        }}
      />
    ))

    expect(layoutItems).toEqual([
      { key: 'a', column: 0 },
      { key: 'b', column: 1 },
    ])
  })

  it('calls onLayoutInfoChange with detailed Solid layout information', () => {
    let layoutColumns = 0
    let layoutItemCount = 0

    render(() => (
      <Masonry
        columns={2}
        items={[
          { key: 'a', data: { title: 'A' } },
          { key: 'b', data: { title: 'B' } },
        ]}
        itemRender={(item) => <span>{item.data.title}</span>}
        onLayoutInfoChange={(info) => {
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
        items={[{ key: 'a', data: { title: 'A' } }]}
        itemRender={(item) => <span>{item.data.title}</span>}
      />
    ))
  }).not.toThrow()
})
