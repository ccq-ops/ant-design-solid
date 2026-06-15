import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRoot } from 'solid-js'
import { render } from 'solid-js/web'
import { ConfigProvider, notification } from '../..'

describe('notification', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
    notification.destroy()
  })

  afterEach(() => {
    notification.destroy()
    vi.useRealTimers()
  })

  it('renders success notification and auto closes after duration', async () => {
    notification.success({ title: 'Saved', description: 'Record saved', duration: 1 })

    expect(document.body).toHaveTextContent('Saved')
    expect(document.body).toHaveTextContent('Record saved')
    expect(document.body.querySelector('.ads-notification-notice-success')).toBeTruthy()
    expect(
      document.body
        .querySelector('.ads-notification-notice-icon-success')
        ?.getAttribute('aria-hidden'),
    ).toBe('true')

    vi.advanceTimersByTime(1000)
    await Promise.resolve()

    expect(document.body).not.toHaveTextContent('Saved')
  })

  it('uses topRight placement by default and supports other placements', () => {
    notification.open({ title: 'Default', duration: 0 })
    notification.open({ title: 'Bottom', placement: 'bottomLeft', duration: 0 })

    expect(document.body.querySelector('.ads-notification-top-right')).toHaveTextContent('Default')
    expect(document.body.querySelector('.ads-notification-bottom-left')).toHaveTextContent('Bottom')
  })

  it('keeps duration 0 notifications until closed by handle', () => {
    const handle = notification.info({ title: 'Persistent', duration: 0 })

    vi.advanceTimersByTime(10000)
    expect(document.body).toHaveTextContent('Persistent')

    handle.close()
    expect(document.body).not.toHaveTextContent('Persistent')
  })

  it('updates existing keyed notification and resets its timer', async () => {
    notification.open({ key: 'job', title: 'Running', duration: 1 })
    vi.advanceTimersByTime(500)
    notification.open({ key: 'job', title: 'Done', duration: 1 })

    expect(document.body).not.toHaveTextContent('Running')
    expect(document.body).toHaveTextContent('Done')
    expect(document.body.querySelectorAll('.ads-notification-notice')).toHaveLength(1)

    vi.advanceTimersByTime(500)
    await Promise.resolve()
    expect(document.body).toHaveTextContent('Done')

    vi.advanceTimersByTime(500)
    await Promise.resolve()
    expect(document.body).not.toHaveTextContent('Done')
  })

  it('closes with close button and destroys one or all notifications', () => {
    notification.open({ key: 'a', title: 'A', duration: 0 })
    notification.open({ key: 'b', title: 'B', duration: 0 })

    document.body.querySelector<HTMLButtonElement>('[aria-label="close notification"]')?.click()
    expect(document.body.querySelectorAll('.ads-notification-notice')).toHaveLength(1)

    notification.destroy('b')
    expect(document.body).not.toHaveTextContent('B')

    notification.open({ key: 'c', title: 'C', duration: 0 })
    notification.open({ key: 'd', title: 'D', duration: 0 })

    notification.destroy()
    expect(document.body.querySelectorAll('.ads-notification-notice')).toHaveLength(0)
  })
  it('renders title and supports top and bottom placements', () => {
    notification.open({ title: 'Top title', placement: 'top', duration: 0 })
    notification.open({ title: 'Bottom title', placement: 'bottom', duration: 0 })

    expect(document.body.querySelector('.ads-notification-top')).toHaveTextContent('Top title')
    expect(document.body.querySelector('.ads-notification-bottom')).toHaveTextContent(
      'Bottom title',
    )
  })

  it('applies class style props and onClick to the notice element', () => {
    const onClick = vi.fn()

    notification.open({
      title: 'Clickable',
      duration: 0,
      class: 'custom-notice',
      style: { width: '333px' },
      props: { 'data-testid': 'notice-a', 'aria-label': 'custom notification' },
      onClick,
    })

    const notice = document.body.querySelector<HTMLDivElement>('[data-testid="notice-a"]')
    expect(notice).toBeTruthy()
    expect(notice).toHaveClass('custom-notice')
    expect(notice?.style.width).toBe('333px')
    expect(notice?.getAttribute('aria-label')).toBe('custom notification')
    notice?.click()
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('aligns icon and title in one centered row', () => {
    notification.success({ title: 'Aligned title', duration: 0 })

    const title = document.body.querySelector<HTMLElement>('.ads-notification-notice-title')
    const icon = document.body.querySelector<HTMLElement>('.ads-notification-notice-icon')

    expect(title).toHaveStyle({ display: 'flex', 'align-items': 'center' })
    expect(icon).toHaveStyle({
      display: 'inline-flex',
      'align-items': 'center',
      'flex-shrink': '0',
    })
  })

  it('renders custom icon and actions content', () => {
    notification.open({
      title: 'With actions',
      icon: <span data-testid="custom-icon">I</span>,
      actions: <button>Action</button>,
      duration: 0,
    })

    expect(document.body.querySelector('[data-testid="custom-icon"]')).toBeTruthy()
    expect(document.body).toHaveTextContent('Action')
  })

  it('supports closable false and closeIcon false', () => {
    notification.open({ title: 'No close', closable: false, duration: 0 })
    notification.open({ title: 'No close icon', closeIcon: false, duration: 0 })

    expect(document.body.querySelectorAll('[aria-label="close notification"]')).toHaveLength(0)
  })

  it('renders custom close icon and calls close callbacks on manual close', () => {
    const onClose = vi.fn()
    const closableOnClose = vi.fn()

    notification.open({
      title: 'Closable',
      duration: 0,
      closeIcon: <span data-testid="x-icon">X</span>,
      closable: { onClose: closableOnClose },
      onClose,
    })

    expect(document.body.querySelector('[data-testid="x-icon"]')).toBeTruthy()
    document.body.querySelector<HTMLButtonElement>('[aria-label="close notification"]')?.click()

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(closableOnClose).toHaveBeenCalledTimes(1)
    expect(document.body).not.toHaveTextContent('Closable')
  })

  it('uses notification.config defaults for placement duration and offsets', async () => {
    notification.config({ placement: 'bottom', duration: 1, top: 40, bottom: 50 })
    notification.open({ title: 'Configured' })

    const bottom = document.body.querySelector<HTMLElement>('.ads-notification-bottom')
    expect(bottom).toHaveTextContent('Configured')
    expect(bottom?.style.bottom).toBe('50px')

    vi.advanceTimersByTime(1000)
    await Promise.resolve()
    expect(document.body).not.toHaveTextContent('Configured')
  })

  it('applies global props closable classNames and styles defaults', () => {
    notification.config({
      props: { 'data-testid': 'global-notice', role: 'status' },
      closable: false,
      classNames: { title: 'global-title', root: 'global-root' },
      styles: { title: { color: 'blue' } },
    })

    notification.open({ title: 'Global defaults', duration: 0 })

    const notice = document.body.querySelector<HTMLElement>('[data-testid="global-notice"]')
    const title = document.body.querySelector<HTMLElement>('.global-title')

    expect(document.body.querySelector('.global-root')).toBeTruthy()
    expect(notice).toHaveTextContent('Global defaults')
    expect(notice?.getAttribute('role')).toBe('status')
    expect(title?.style.color).toBe('blue')
    expect(document.body.querySelector('[aria-label="close notification"]')).toBeFalsy()
  })

  it('supports function semantic classNames and styles with notice props info', () => {
    notification.open({
      title: 'Function semantic',
      duration: 0,
      props: { 'data-kind': 'sync' },
      classNames: ({ props }) => ({ title: `title-${props?.['data-kind']}` }),
      styles: ({ props }) => ({
        title: { color: props?.['data-kind'] === 'sync' ? 'green' : 'red' },
      }),
    })

    const title = document.body.querySelector<HTMLElement>('.title-sync')
    expect(title).toHaveTextContent('Function semantic')
    expect(title?.style.color).toBe('green')
  })

  it('mounts into configured container', () => {
    const container = document.createElement('section')
    document.body.appendChild(container)
    notification.config({ getContainer: () => container })

    notification.open({ title: 'In container', duration: 0 })

    expect(container).toHaveTextContent('In container')
  })

  it('drops oldest notifications when maxCount is exceeded', () => {
    notification.config({ maxCount: 2 })

    notification.open({ title: 'One', duration: 0 })
    notification.open({ title: 'Two', duration: 0 })
    notification.open({ title: 'Three', duration: 0 })

    expect(document.body).not.toHaveTextContent('One')
    expect(document.body).toHaveTextContent('Two')
    expect(document.body).toHaveTextContent('Three')
  })

  it('marks notifications as stacked when stack threshold is exceeded', () => {
    notification.config({ stack: { threshold: 2 } })

    notification.open({ title: 'One', duration: 0 })
    notification.open({ title: 'Two', duration: 0 })
    notification.open({ title: 'Three', duration: 0 })

    expect(document.body).toHaveTextContent('One')
    expect(document.body).toHaveTextContent('Two')
    expect(document.body).toHaveTextContent('Three')
    expect(document.body.querySelector('.ads-notification-stack')).toBeTruthy()
    expect(document.body.querySelectorAll('.ads-notification-notice-stacked')).toHaveLength(3)
  })

  it('supports numeric keys when updating and destroying notifications', () => {
    notification.open({ key: 1, title: 'One', duration: 0 })
    notification.open({ key: 1, title: 'Updated one', duration: 0 })

    expect(document.body).not.toHaveTextContent('One')
    expect(document.body).toHaveTextContent('Updated one')

    notification.destroy(1)
    expect(document.body).not.toHaveTextContent('Updated one')
  })

  it('keeps duration false notifications open', () => {
    notification.open({ title: 'Persistent false', duration: false })

    vi.advanceTimersByTime(10000)

    expect(document.body).toHaveTextContent('Persistent false')
  })

  it('pauses auto close on hover by default and resumes on mouse leave', async () => {
    notification.open({ title: 'Hover pause', duration: 1 })
    const notice = document.body.querySelector<HTMLElement>('.ads-notification-notice')

    notice?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    vi.advanceTimersByTime(1500)
    await Promise.resolve()
    expect(document.body).toHaveTextContent('Hover pause')

    notice?.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
    vi.advanceTimersByTime(1000)
    await Promise.resolve()
    expect(document.body).not.toHaveTextContent('Hover pause')
  })

  it('renders progress and semantic classes styles role and rtl class', () => {
    notification.config({ rtl: true })
    notification.open({
      title: 'Semantic',
      duration: 2,
      showProgress: true,
      role: 'status',
      classNames: {
        root: 'semantic-root',
        wrapper: 'semantic-wrapper',
        section: 'semantic-section',
        title: 'semantic-title',
        progress: 'semantic-progress',
      },
      styles: { title: { color: 'red' }, progress: { height: '4px' } },
    })

    const notice = document.body.querySelector<HTMLElement>('.semantic-root')
    const title = document.body.querySelector<HTMLElement>('.semantic-title')
    const progress = document.body.querySelector<HTMLElement>('.semantic-progress')

    expect(document.body.querySelector('.ads-notification-rtl')).toBeTruthy()
    expect(document.body.querySelector('.semantic-wrapper')).toBeTruthy()
    expect(document.body.querySelector('.semantic-section')).toBeTruthy()
    expect(notice?.getAttribute('role')).toBe('status')
    expect(title?.style.color).toBe('red')
    expect(progress).toBeTruthy()
    expect(progress?.style.height).toBe('4px')
  })

  it('uses hook api with an inline context holder and local config', () => {
    let api!: ReturnType<typeof notification.useNotification>[0]
    const dispose = createRoot((rootDispose) => {
      const [instance, contextHolder] = notification.useNotification({
        placement: 'bottomLeft',
        props: { 'data-testid': 'hook-notice' },
        getContainer: () => document.querySelector<HTMLElement>('#app')!,
      })
      api = instance
      render(() => <div id="app">{contextHolder}</div>, document.body)
      return rootDispose
    })

    api.open({ title: 'Hook notice', duration: 0 })

    expect(document.body.querySelector('#app')).toHaveTextContent('Hook notice')
    expect(document.body.querySelector('.ads-notification-bottom-left')).toHaveTextContent(
      'Hook notice',
    )
    expect(document.body.querySelector('[data-testid="hook-notice"]')).toBeTruthy()

    dispose()
  })

  it('uses ConfigProvider notification defaults in hook holder', () => {
    let api!: ReturnType<typeof notification.useNotification>[0]
    render(
      () => (
        <ConfigProvider prefixCls="custom" notification={{ classNames: { title: 'from-config' } }}>
          {(() => {
            const [instance, contextHolder] = notification.useNotification()
            api = instance
            return contextHolder
          })()}
        </ConfigProvider>
      ),
      document.body,
    )

    api.open({ title: 'Configured hook', duration: 0 })

    expect(document.body.querySelector('.custom-notification-top-right')).toHaveTextContent(
      'Configured hook',
    )
    expect(document.body.querySelector('.from-config')).toHaveTextContent('Configured hook')
  })
})
