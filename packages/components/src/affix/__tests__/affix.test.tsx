import { StyleProvider, createCache, extractStyle } from '@ant-design-solid/cssinjs'
import { cleanup, render } from '@solidjs/testing-library'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Affix } from '../index'
import type { AffixRef } from '../interface'

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

  it('supports Solid rootClass and custom prefixCls on the fixed element', () => {
    const result = render(() => (
      <Affix prefixCls="custom-affix" rootClass="root-extra">
        <span>Custom prefix</span>
      </Affix>
    ))
    const wrapper = result.container.querySelector('.custom-affix-wrapper')!

    mockRect(wrapper, { top: -1, left: 0, width: 100, height: 20, bottom: 19 })
    window.dispatchEvent(new Event('scroll'))

    const fixed = result.container.querySelector('.custom-affix') as HTMLElement
    expect(fixed).toBeInTheDocument()
    expect(fixed).toHaveClass('root-extra')
    expect(result.container.querySelector('.ads-affix')).toBeNull()
  })

  it('exposes updatePosition through ref', () => {
    let affixRef: AffixRef | undefined
    const result = render(() => (
      <Affix offsetTop={0} ref={(ref) => (affixRef = ref)}>
        <div>Manual update</div>
      </Affix>
    ))
    const wrapper = result.container.querySelector('.ads-affix-wrapper')!

    mockRect(wrapper, { top: -2, left: 12, width: 88, height: 24, bottom: 22 })
    affixRef?.updatePosition()

    const fixed = result.container.querySelector('.ads-affix') as HTMLElement
    expect(fixed).toBeInTheDocument()
    expect(fixed.style.top).toBe('0px')
    expect(fixed.style.left).toBe('12px')
  })

  it('updates position from antd trigger events beyond scroll and resize', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Affix offsetTop={0} onChange={onChange}>
        <div>Touch update</div>
      </Affix>
    ))
    const wrapper = result.container.querySelector('.ads-affix-wrapper')!

    mockRect(wrapper, { top: -1, left: 0, width: 100, height: 20, bottom: 19 })
    window.dispatchEvent(new Event('touchmove'))

    expect(result.container.querySelector('.ads-affix')).toBeInTheDocument()
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('uses ResizeObserver to recalculate fixed dimensions', () => {
    let observerCallback: ResizeObserverCallback | undefined
    const observe = vi.fn()
    const disconnect = vi.fn()
    const originalResizeObserver = globalThis.ResizeObserver
    class MockResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        observerCallback = callback
      }

      observe = observe
      disconnect = disconnect
      unobserve = vi.fn()
    }
    globalThis.ResizeObserver = MockResizeObserver as typeof ResizeObserver

    try {
      const result = render(() => (
        <Affix offsetTop={0}>
          <div>Resizable</div>
        </Affix>
      ))
      const wrapper = result.container.querySelector('.ads-affix-wrapper')!

      mockRect(wrapper, { top: -1, left: 0, width: 100, height: 20, bottom: 19 })
      window.dispatchEvent(new Event('scroll'))
      expect(result.container.querySelector('.ads-affix')).toHaveStyle({
        width: '100px',
        height: '20px',
      })

      mockRect(wrapper, { top: -1, left: 0, width: 140, height: 32, bottom: 31 })
      observerCallback?.([], {} as ResizeObserver)

      expect(observe).toHaveBeenCalledWith(wrapper)
      expect(result.container.querySelector('.ads-affix')).toHaveStyle({
        width: '140px',
        height: '32px',
      })
    } finally {
      globalThis.ResizeObserver = originalResizeObserver
    }
  })

  it('uses the Affix zIndexPopup component token', () => {
    const cache = createCache()
    render(() => (
      <ConfigProvider
        theme={{ token: { zIndexBase: 20 }, components: { Affix: { zIndexPopup: 55 } } }}
      >
        <StyleProvider cache={cache}>
          <Affix>Tokenized</Affix>
        </StyleProvider>
      </ConfigProvider>
    ))

    const css = extractStyle(cache)
    expect(css).toContain('.ads-affix{position:fixed;z-index:55;')
  })
})
