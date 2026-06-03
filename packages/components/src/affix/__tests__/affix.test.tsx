import { cleanup, render } from '@solidjs/testing-library'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Affix } from '../index'

function mockRect(element: Element, rect: Partial<DOMRect>) {
  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({
      x: rect.left ?? 0,
      y: rect.top ?? 0,
      top: rect.top ?? 0,
      left: rect.left ?? 0,
      right: rect.right ?? (rect.left ?? 0) + (rect.width ?? 0),
      bottom: rect.bottom ?? (rect.top ?? 0) + (rect.height ?? 0),
      width: rect.width ?? 0,
      height: rect.height ?? 0,
      toJSON: () => undefined,
    }),
  })
}

describe('Affix', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders children in a non-affixed placeholder by default', () => {
    const result = render(() => (
      <Affix>
        <button type="button">Save</button>
      </Affix>
    ))

    expect(result.getByText('Save')).toBeInTheDocument()
    expect(result.container.querySelector('.ads-affix')).toBeNull()
    expect(result.container.firstElementChild).toHaveClass('ads-affix-wrapper')
  })

  it('affixes to the top when the placeholder crosses offsetTop', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Affix offsetTop={16} onChange={onChange}>
        <div>Toolbar</div>
      </Affix>
    ))
    const wrapper = result.container.querySelector('.ads-affix-wrapper')!

    mockRect(wrapper, { top: 10, left: 20, width: 120, height: 32, bottom: 42 })
    window.dispatchEvent(new Event('scroll'))

    const fixed = result.container.querySelector('.ads-affix') as HTMLElement
    expect(fixed).toBeInTheDocument()
    expect(fixed.style.position).toBe('fixed')
    expect(fixed.style.top).toBe('16px')
    expect(fixed.style.left).toBe('20px')
    expect(fixed.style.width).toBe('120px')
    expect(wrapper).toHaveStyle({ width: '120px', height: '32px' })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('affixes to the bottom when offsetBottom threshold is crossed', () => {
    const result = render(() => (
      <Affix offsetBottom={24}>
        <div>Bottom bar</div>
      </Affix>
    ))
    const wrapper = result.container.querySelector('.ads-affix-wrapper')!

    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(600)
    mockRect(wrapper, { top: 590, left: 8, width: 200, height: 40, bottom: 630 })
    window.dispatchEvent(new Event('scroll'))

    const fixed = result.container.querySelector('.ads-affix') as HTMLElement
    expect(fixed).toBeInTheDocument()
    expect(fixed.style.bottom).toBe('24px')
    expect(fixed.style.left).toBe('8px')
    expect(fixed.style.width).toBe('200px')
  })

  it('calls onChange only when affixed state changes', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Affix offsetTop={0} onChange={onChange}>
        <div>Stable</div>
      </Affix>
    ))
    const wrapper = result.container.querySelector('.ads-affix-wrapper')!

    mockRect(wrapper, { top: -1, left: 0, width: 100, height: 20, bottom: 19 })
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('scroll'))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenLastCalledWith(true)

    mockRect(wrapper, { top: 12, left: 0, width: 100, height: 20, bottom: 32 })
    window.dispatchEvent(new Event('scroll'))
    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange).toHaveBeenLastCalledWith(false)
  })

  it('applies custom prefix from ConfigProvider', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Affix>
          <span>Custom</span>
        </Affix>
      </ConfigProvider>
    ))

    expect(result.container.firstElementChild).toHaveClass('custom-affix-wrapper')
    expect(result.container.querySelector('.ads-affix-wrapper')).toBeNull()
  })
})
