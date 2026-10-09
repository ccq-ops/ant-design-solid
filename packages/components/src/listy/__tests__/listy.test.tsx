import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Listy } from '../listy'
import type { ListyRef } from '../interface'

interface Item {
  id: number
  group: string
  label: string
}

const items: Item[] = [
  { id: 1, group: 'A', label: 'Alpha' },
  { id: 2, group: 'A', label: 'Apple' },
  { id: 3, group: 'B', label: 'Beta' },
]

describe('Listy', () => {
  it('renders items and semantic customizations in raw mode', () => {
    const onScroll = vi.fn()
    const result = render(() => (
      <Listy
        items={items}
        rowKey="id"
        virtual={false}
        class="local-root"
        classNames={{ root: 'semantic-root', item: 'semantic-item' }}
        styles={{ item: { color: 'red' } }}
        onScroll={onScroll}
        itemRender={(item) => item.label}
      />
    ))

    const root = result.container.querySelector('.ads-listy')!
    expect(root).toHaveClass('local-root', 'semantic-root')
    expect(result.getByText('Alpha')).toHaveClass('semantic-item')
    expect(result.getByText('Alpha')).toHaveStyle({ color: 'rgb(255, 0, 0)' })

    fireEvent.scroll(root)
    expect(onScroll).toHaveBeenCalledTimes(1)
  })

  it('renders grouped data in first-seen group order with sticky headers', () => {
    const result = render(() => (
      <Listy
        items={items}
        rowKey={(item) => item.id}
        virtual={false}
        sticky
        group={{
          key: (item) => item.group,
          title: (groupKey, groupItems) => `${groupKey} (${groupItems.length})`,
        }}
        itemRender={(item) => item.label}
      />
    ))

    const headers = Array.from(result.container.querySelectorAll('.ads-listy-group-header'))
    expect(headers.map((header) => header.textContent)).toEqual(['A (2)', 'B (1)'])
    expect(headers[0]).toHaveClass('ads-listy-group-header-sticky')
    expect(result.container.querySelectorAll('.ads-listy-group-section')).toHaveLength(2)
  })

  it('supports semantic functions and ConfigProvider defaults', () => {
    const result = render(() => (
      <ConfigProvider
        listy={{
          class: 'provider-root',
          classNames: { item: 'provider-item' },
          styles: { groupHeader: { 'font-weight': 700 } },
        }}
      >
        <Listy
          items={items}
          rowKey="id"
          virtual={false}
          classNames={({ props }) => ({
            root: props.items?.length === 3 ? 'three-items' : undefined,
          })}
          itemRender={(item) => item.label}
        />
      </ConfigProvider>
    ))

    expect(result.container.querySelector('.ads-listy')).toHaveClass('provider-root', 'three-items')
    expect(result.getByText('Alpha')).toHaveClass('provider-item')
  })

  it('exposes scrollTo for item keys and absolute positions', () => {
    let api: ListyRef | undefined
    const result = render(() => (
      <Listy
        items={items}
        rowKey="id"
        virtual={false}
        height={100}
        ref={(value) => {
          api = value
        }}
        itemRender={(item) => item.label}
      />
    ))
    const root = result.container.querySelector<HTMLElement>('.ads-listy')!
    expect(root).toHaveAttribute('tabindex', '0')
    const beta = result.getByText('Beta')
    Object.defineProperty(beta, 'offsetTop', { configurable: true, value: 80 })

    api?.scrollTo({ key: 3, align: 'top', offset: 5 })
    expect(root.scrollTop).toBe(85)

    const scrollTo = vi.fn()
    Object.defineProperty(root, 'scrollTo', { configurable: true, value: scrollTo })
    api?.scrollTo({ top: 12, left: 4 })
    expect(scrollTo).toHaveBeenCalledWith({ top: 12, left: 4 })
  })

  it('virtualizes long lists when a height is provided', () => {
    const manyItems = Array.from({ length: 100 }, (_, index) => ({
      id: index,
      group: 'A',
      label: `Item ${index}`,
    }))
    const result = render(() => (
      <Listy items={manyItems} rowKey="id" height={120} itemRender={(item) => item.label} />
    ))

    expect(result.container.querySelector('.ads-listy-virtual-holder')).toBeInTheDocument()
    const renderedItems = result.container.querySelectorAll('.ads-listy-item')
    expect(renderedItems.length).toBeGreaterThan(0)
    expect(renderedItems.length).toBeLessThan(manyItems.length)
  })

  it('inherits RTL direction from ConfigProvider', () => {
    const result = render(() => (
      <ConfigProvider direction="rtl">
        <Listy items={items} rowKey="id" virtual={false} itemRender={(item) => item.label} />
      </ConfigProvider>
    ))

    expect(result.container.querySelector('.ads-listy')).toHaveAttribute('dir', 'rtl')
    expect(result.container.querySelector('.ads-listy')).toHaveClass('ads-listy-rtl')
  })
})
