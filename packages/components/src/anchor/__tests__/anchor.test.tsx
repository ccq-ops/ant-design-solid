import { cleanup, fireEvent, render } from '@solidjs/testing-library'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Anchor } from '../index'
import type { AnchorItem } from '../interface'

const items: AnchorItem[] = [
  { href: '#intro', title: 'Intro' },
  {
    href: '#usage',
    title: 'Usage',
    children: [{ href: '#api', title: 'API' }],
  },
]

function appendTarget(id: string, top: number) {
  const target = document.createElement('section')
  target.id = id
  Object.defineProperty(target, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      x: 0,
      y: top,
      top,
      left: 0,
      right: 100,
      bottom: top + 50,
      width: 100,
      height: 50,
      toJSON: () => undefined,
    }),
  })
  document.body.appendChild(target)
  return target
}

describe('Anchor', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('renders nested items with anchor semantics', () => {
    const result = render(() => <Anchor affix={false} items={items} />)

    expect(result.container.querySelector('.ads-anchor')).toBeInTheDocument()
    expect(result.getByRole('link', { name: 'Intro' })).toHaveAttribute('href', '#intro')
    expect(result.getByRole('link', { name: 'Usage' })).toHaveClass('ads-anchor-link-title')
    expect(result.getByRole('link', { name: 'API' })).toBeInTheDocument()
    expect(result.container.querySelectorAll('.ads-anchor-list')).toHaveLength(2)
  })

  it('clicks a link, calls onClick, and scrolls to the target', () => {
    const onClick = vi.fn()
    appendTarget('usage', 240)
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    const result = render(() => <Anchor affix={false} items={items} onClick={onClick} />)

    fireEvent.click(result.getByRole('link', { name: 'Usage' }))

    expect(onClick).toHaveBeenCalledWith(
      expect.any(MouseEvent),
      expect.objectContaining({ href: '#usage' }),
    )
    expect(scrollTo).toHaveBeenCalledWith({ top: 240, behavior: 'smooth' })
  })

  it('updates active link on scroll and calls onChange', () => {
    const onChange = vi.fn()
    appendTarget('intro', -20)
    appendTarget('usage', 12)
    appendTarget('api', 160)
    const result = render(() => (
      <Anchor affix={false} targetOffset={20} bounds={0} items={items} onChange={onChange} />
    ))

    window.dispatchEvent(new Event('scroll'))

    expect(result.getByRole('link', { name: 'Usage' })).toHaveAttribute('aria-current', 'true')
    expect(result.getByRole('link', { name: 'Usage' })).toHaveClass('ads-anchor-link-title-active')
    expect(onChange).toHaveBeenCalledWith('#usage')
  })

  it('wraps with Affix by default and skips it when affix is false', () => {
    const affixed = render(() => <Anchor items={items} />)
    expect(affixed.container.querySelector('.ads-affix-wrapper')).toBeInTheDocument()
    cleanup()

    const plain = render(() => <Anchor affix={false} items={items} />)
    expect(plain.container.querySelector('.ads-affix-wrapper')).toBeNull()
  })

  it('applies custom prefix from ConfigProvider', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Anchor affix={false} items={items} />
      </ConfigProvider>
    ))

    expect(result.container.querySelector('.custom-anchor')).toBeInTheDocument()
    expect(result.container.querySelector('.ads-anchor')).toBeNull()
  })
})
