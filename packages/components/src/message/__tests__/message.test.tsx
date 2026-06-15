import { StyleProvider, createCache, extractStyle } from '@ant-design-solid/cssinjs'
import { createSignal } from 'solid-js'
import { render } from '@solidjs/testing-library'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { darkAlgorithm } from '@ant-design-solid/theme'
import { App } from '../../app'
import { ConfigProvider } from '../../config-provider'
import { message } from '../index'
import { MessageHolder } from '../holder'

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

  it('uses global ConfigProvider theme for static messages', async () => {
    ConfigProvider.config({
      theme: { algorithm: darkAlgorithm },
    })

    message.info('Dark static message', 0)

    await Promise.resolve()

    const css = Array.from(document.head.querySelectorAll('style[data-ant-design-solid]'))
      .map((style) => style.textContent ?? '')
      .join('\n')
    expect(document.body).toHaveTextContent('Dark static message')
    expect(css).toContain('background:#1f1f1f')

    ConfigProvider.config({ theme: undefined })
  })

  it('updates mounted static message holder when global theme changes', async () => {
    message.info('Light static message', 0)
    ConfigProvider.config({ theme: { algorithm: darkAlgorithm } })
    message.success('Dark updated message', 0)

    await Promise.resolve()

    const css = Array.from(document.head.querySelectorAll('style[data-ant-design-solid]'))
      .map((style) => style.textContent ?? '')
      .join('\n')

    expect(document.body).toHaveTextContent('Dark updated message')
    expect(css).toContain('background:#1f1f1f')

    ConfigProvider.config({ theme: undefined })
  })

  it('registers loading icon rotation styles on the loading icon wrapper', () => {
    const cache = createCache()
    const [notices] = createSignal([
      { key: 'loading', type: 'loading' as const, content: 'Loading' },
    ])
    render(() => (
      <StyleProvider cache={cache}>
        <MessageHolder notices={notices} />
      </StyleProvider>
    ))

    const css = extractStyle(cache)

    expect(css).toContain('@keyframes adsIconRotate{to{transform:rotate(360deg);}}')
    expect(css).toContain(
      '.ads-message-icon-loading svg{animation:adsIconRotate 1s linear infinite;',
    )
  })

  it('registers consistent spacing styles for stacked messages', () => {
    const cache = createCache()
    const [notices] = createSignal([
      { key: 'first', type: 'info' as const, content: 'First' },
      { key: 'second', type: 'success' as const, content: 'Second' },
      { key: 'third', type: 'warning' as const, content: 'Third' },
    ])
    render(() => (
      <StyleProvider cache={cache}>
        <MessageHolder notices={notices} config={() => ({ stack: { threshold: 2 } })} />
      </StyleProvider>
    ))

    const css = extractStyle(cache)

    expect(css).toContain('.ads-message-stack .ads-message-notice:not(:first-child)')
    expect(css).not.toContain('.ads-message-stack .ads-message-notice-stacked:not(:first-child)')
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

  it('renders custom icon, class, style, onClick, semantic classNames and styles', () => {
    const onClick = vi.fn()
    message.open({
      content: 'Custom',
      duration: 0,
      icon: <span data-testid="custom-icon">!</span>,
      class: 'notice-extra',
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

  it('uses Solid class prop and ignores removed className compatibility props', () => {
    message.config({
      // @ts-expect-error className was removed in favor of Solid class.
      className: 'legacy-global-class',
      class: 'solid-global-class',
      classNames: ({ props }) => ({
        root: props.type === 'success' ? 'global-success-root' : undefined,
        wrapper: 'global-wrapper',
      }),
      styles: ({ props }) => ({
        root: props.type === 'success' ? { inset: '0 auto auto 50%' } : undefined,
        wrapper: { border: '1px solid rgb(1, 2, 3)' },
      }),
    })

    message.success({
      content: 'Solid class',
      duration: 0,
      class: 'solid-notice',
      // @ts-expect-error className was removed in favor of Solid class.
      className: 'react-notice',
      classNames: ({ props }) => ({
        title: props.key === 'solid-key' ? 'solid-title' : undefined,
      }),
      styles: ({ props }) => ({
        title: props.key === 'solid-key' ? { color: 'rgb(4, 5, 6)' } : undefined,
      }),
      key: 'solid-key',
    })

    const root = document.body.querySelector('.ads-message') as HTMLElement
    const wrapper = document.body.querySelector('.ads-message-notice') as HTMLElement
    const title = document.body.querySelector('.ads-message-title') as HTMLElement

    expect(root.classList.contains('global-success-root')).toBe(true)
    expect(root.style.inset).toBe('0 auto auto 50%')
    expect(wrapper.classList.contains('solid-global-class')).toBe(true)
    expect(wrapper.classList.contains('legacy-global-class')).toBe(false)
    expect(wrapper.classList.contains('solid-notice')).toBe(true)
    expect(wrapper.classList.contains('react-notice')).toBe(false)
    expect(wrapper.classList.contains('global-wrapper')).toBe(true)
    expect(wrapper.style.border).toBe('1px solid rgb(1, 2, 3)')
    expect(title.classList.contains('solid-title')).toBe(true)
    expect(title.style.color).toBe('rgb(4, 5, 6)')
  })

  it('adds transition classes when transitionName is configured', () => {
    message.config({ transitionName: 'fade-message' })
    message.info('Animated', 0)

    const wrapper = document.body.querySelector('.ads-message-notice') as HTMLElement

    expect(wrapper.classList.contains('fade-message')).toBe(true)
    expect(wrapper.classList.contains('fade-message-appear')).toBe(true)
    expect(wrapper.classList.contains('fade-message-appear-active')).toBe(true)
  })

  it('collapses older notices visually after stack threshold', () => {
    message.config({ stack: { threshold: 2 } })

    message.info('First', 0)
    message.success('Second', 0)
    message.warning('Third', 0)

    const root = document.body.querySelector('.ads-message') as HTMLElement
    const wrappers = document.body.querySelectorAll('.ads-message-notice')

    expect(document.body).toHaveTextContent('First')
    expect(document.body).toHaveTextContent('Second')
    expect(document.body).toHaveTextContent('Third')
    expect(root.classList.contains('ads-message-stack')).toBe(true)
    expect(wrappers).toHaveLength(3)
    expect(wrappers[0].classList.contains('ads-message-notice-stacked')).toBe(true)
    expect(wrappers[1].classList.contains('ads-message-notice-stacked')).toBe(true)
    expect(wrappers[2].classList.contains('ads-message-notice-stacked')).toBe(false)
    expect((wrappers[0] as HTMLElement).style.display).toBe('none')
    expect((wrappers[1] as HTMLElement).style.display).toBe('none')
    expect((wrappers[2] as HTMLElement).style.display).toBe('')
  })

  it('renders internal pure panel and list helpers', () => {
    const Panel = message._InternalPanelDoNotUseOrYouWillBeFired
    const List = message._InternalListDoNotUseOrYouWillBeFired

    const panel = render(() => <Panel type="success" content="Panel content" class="panel-extra" />)
    expect(panel.container).toHaveTextContent('Panel content')
    expect(panel.container.querySelector('.ads-message-notice-pure-panel')).toBeTruthy()
    expect(panel.container.querySelector('.panel-extra')).toBeTruthy()

    const list = render(() => (
      <List
        notices={[
          { key: 'a', type: 'info', content: 'List A' },
          { key: 'b', type: 'error', content: 'List B' },
        ]}
      />
    ))

    expect(list.container).toHaveTextContent('List A')
    expect(list.container).toHaveTextContent('List B')
    expect(list.container.querySelectorAll('.ads-message-notice')).toHaveLength(2)
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

  it('merges ConfigProvider message config for hook holders', () => {
    function InnerDemo() {
      const [api, holder] = message.useMessage()
      return (
        <>
          {holder}
          <button type="button" onClick={() => api.info('Context message', 0)}>
            Show
          </button>
        </>
      )
    }

    function Demo() {
      return (
        <ConfigProvider
          message={{
            class: 'context-notice',
            style: { 'letter-spacing': '1px' },
            classNames: { title: 'context-title' },
            styles: { title: { color: 'rgb(7, 8, 9)' } },
          }}
        >
          <InnerDemo />
        </ConfigProvider>
      )
    }

    const result = render(() => <Demo />)
    result.getByText('Show').click()

    const wrapper = result.container.querySelector('.ads-message-notice') as HTMLElement
    const title = result.container.querySelector('.ads-message-title') as HTMLElement

    expect(wrapper.classList.contains('context-notice')).toBe(true)
    expect(wrapper.style.letterSpacing).toBe('1px')
    expect(title.classList.contains('context-title')).toBe(true)
    expect(title.style.color).toBe('rgb(7, 8, 9)')
  })

  it('exposes scoped message api from App.useApp', () => {
    function InnerDemo() {
      const { message: api } = App.useApp()
      return (
        <button type="button" onClick={() => api.success('App scoped message', 0)}>
          Show
        </button>
      )
    }

    const result = render(() => (
      <App message={{ class: 'app-message', classNames: { title: 'app-message-title' } }}>
        <InnerDemo />
      </App>
    ))
    result.getByText('Show').click()

    const wrapper = result.container.querySelector('.ads-message-notice') as HTMLElement
    const title = result.container.querySelector('.ads-message-title') as HTMLElement

    expect(result.container).toHaveTextContent('App scoped message')
    expect(result.container.querySelector('.ads-message')).toBeTruthy()
    expect(wrapper.classList.contains('app-message')).toBe(true)
    expect(title.classList.contains('app-message-title')).toBe(true)
  })
})
