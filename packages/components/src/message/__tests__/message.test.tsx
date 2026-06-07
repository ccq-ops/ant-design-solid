import { createSignal } from 'solid-js'
import { render } from '@solidjs/testing-library'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { message } from '../index'

describe('message', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
    message.destroy()
    message.config({
      top: 8,
      duration: 3,
      getContainer: undefined,
      maxCount: undefined,
      prefixCls: undefined,
      rtl: false,
      pauseOnHover: true,
      classNames: undefined,
      styles: undefined,
      stack: false,
    })
  })

  afterEach(() => {
    message.destroy()
    vi.useRealTimers()
  })

  it('renders success content and auto closes', async () => {
    message.success('Saved', 1)

    expect(document.body).toHaveTextContent('Saved')
    expect(document.body.querySelector('.ads-message-notice-success')).toBeTruthy()
    expect(
      document.body.querySelector('.ads-message-icon-success')?.getAttribute('aria-hidden'),
    ).toBe('true')

    vi.advanceTimersByTime(1000)
    await Promise.resolve()

    expect(document.body).not.toHaveTextContent('Saved')
  })

  it('keeps loading messages until closed by handle', () => {
    const handle = message.loading('Loading')

    vi.advanceTimersByTime(10000)
    expect(document.body).toHaveTextContent('Loading')

    handle.close()
    expect(document.body).not.toHaveTextContent('Loading')
  })

  it('updates existing keyed message', () => {
    message.open({ key: 'save', type: 'info', content: 'Saving', duration: 0 })
    message.open({ key: 'save', type: 'success', content: 'Saved', duration: 0 })

    expect(document.body).not.toHaveTextContent('Saving')
    expect(document.body).toHaveTextContent('Saved')
    expect(document.body.querySelectorAll('.ads-message-notice')).toHaveLength(1)
  })

  it('destroys one message or all messages', () => {
    message.open({ key: 'a', content: 'A', duration: 0 })
    message.open({ key: 'b', content: 'B', duration: 0 })

    message.destroy('a')
    expect(document.body).not.toHaveTextContent('A')
    expect(document.body).toHaveTextContent('B')

    message.destroy()
    expect(document.body).not.toHaveTextContent('B')
  })

  it('returns a callable thenable handle and invokes onClose for all close paths', async () => {
    const onClose = vi.fn()
    const afterClose = vi.fn()
    const handle = message.success('Saved', 0, onClose)
    handle.then(afterClose)

    expect(document.body).toHaveTextContent('Saved')
    handle()
    await Promise.resolve()

    expect(document.body).not.toHaveTextContent('Saved')
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(afterClose).toHaveBeenCalledTimes(1)

    const secondClose = vi.fn()
    message.info('Info', secondClose)
    message.destroy()

    expect(secondClose).toHaveBeenCalledTimes(1)
  })

  it('supports global config for duration, maxCount, top, prefixCls, container, rtl and number keys', () => {
    message.destroy()
    const container = document.createElement('section')
    document.body.appendChild(container)

    message.config({
      duration: 1,
      maxCount: 1,
      top: 24,
      prefixCls: 'custom-message',
      getContainer: () => container,
      rtl: true,
    })

    const evictedClose = vi.fn()
    message.open({ key: 1, content: 'First', onClose: evictedClose })
    message.open({ key: 2, content: 'Second' })

    expect(container).not.toHaveTextContent('First')
    expect(container).toHaveTextContent('Second')
    expect(evictedClose).toHaveBeenCalledTimes(1)
    expect(container.querySelector('.custom-message')).toBeTruthy()
    expect(container.querySelector('.custom-message-rtl')).toBeTruthy()
    expect((container.querySelector('.custom-message') as HTMLElement).style.top).toBe('24px')

    vi.advanceTimersByTime(1000)
    expect(container).not.toHaveTextContent('Second')
  })

  it('renders custom icon, className, style, onClick, semantic classNames and styles', () => {
    const onClick = vi.fn()
    message.open({
      content: 'Custom',
      duration: 0,
      icon: <span data-testid="custom-icon">!</span>,
      className: 'notice-extra',
      style: { color: 'red' },
      onClick,
      classNames: {
        root: 'root-extra',
        wrapper: 'wrapper-extra',
        listContent: 'content-extra',
        icon: 'icon-extra',
        title: 'title-extra',
      },
      styles: {
        wrapper: { 'margin-top': '3px' },
        listContent: { 'background-color': 'rgb(1, 2, 3)' },
        title: { 'font-weight': '700' },
      },
    })

    const root = document.body.querySelector('.ads-message')!
    const wrapper = document.body.querySelector('.ads-message-notice') as HTMLElement
    const content = document.body.querySelector('.ads-message-notice-content') as HTMLElement
    const title = document.body.querySelector('.ads-message-title') as HTMLElement

    expect(root.classList.contains('root-extra')).toBe(true)
    expect(wrapper.classList.contains('notice-extra')).toBe(true)
    expect(wrapper.classList.contains('wrapper-extra')).toBe(true)
    expect(wrapper.style.color).toBe('red')
    expect(wrapper.style.marginTop).toBe('3px')
    expect(content.classList.contains('content-extra')).toBe(true)
    expect(content.style.backgroundColor).toBe('rgb(1, 2, 3)')
    expect(document.body.querySelector('[data-testid="custom-icon"]')).toBeTruthy()
    expect(document.body.querySelector('.icon-extra')).toBeTruthy()
    expect(title.classList.contains('title-extra')).toBe(true)
    expect(title.style.fontWeight).toBe('700')

    content.click()
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('pauses auto close while hovered', () => {
    message.open({ content: 'Hover', duration: 1, pauseOnHover: true })
    const content = document.body.querySelector('.ads-message-notice-content') as HTMLElement

    content.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    vi.advanceTimersByTime(1500)
    expect(document.body).toHaveTextContent('Hover')

    content.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
    vi.advanceTimersByTime(1000)
    expect(document.body).not.toHaveTextContent('Hover')
  })

  it('creates a local message instance with context holder', () => {
    function Demo() {
      const [api, holder] = message.useMessage({ prefixCls: 'local-message' })
      const [shown, setShown] = createSignal(false)
      return (
        <>
          {holder}
          <button
            type="button"
            onClick={() => {
              api.success('Local', 0)
              setShown(true)
            }}
          >
            {shown() ? 'Shown' : 'Show'}
          </button>
        </>
      )
    }

    const result = render(() => <Demo />)
    result.getByText('Show').click()

    expect(result.container).toHaveTextContent('Local')
    expect(result.container.querySelector('.local-message')).toBeTruthy()
    expect(document.body.querySelector('.ads-message')).toBeFalsy()
  })
})
