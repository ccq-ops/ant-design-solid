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
        items={[{ key: 'a', title: 'A' }, { key: 'b', title: 'B' }, { key: 'c', title: 'C' }]}
        itemRender={(item) => <div>{item.title}</div>}
      />
    ))

    const root = result.container.querySelector<HTMLElement>('.ads-masonry')!
    expect(result.container.querySelectorAll('.ads-masonry-column')).toHaveLength(3)
    expect(root.style.getPropertyValue('--ads-masonry-gutter')).toBe('12px')
  })
})
