import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { notification } from '../index'

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
    notification.success({ message: 'Saved', description: 'Record saved', duration: 1 })

    expect(document.body).toHaveTextContent('Saved')
    expect(document.body).toHaveTextContent('Record saved')
    expect(document.body.querySelector('.ads-notification-notice-success')).toBeTruthy()
    expect(
      document.body.querySelector('.ads-notification-icon-success')?.getAttribute('aria-hidden'),
    ).toBe('true')

    vi.advanceTimersByTime(1000)
    await Promise.resolve()

    expect(document.body).not.toHaveTextContent('Saved')
  })

  it('uses topRight placement by default and supports other placements', () => {
    notification.open({ message: 'Default', duration: 0 })
    notification.open({ message: 'Bottom', placement: 'bottomLeft', duration: 0 })

    expect(document.body.querySelector('.ads-notification-top-right')).toHaveTextContent('Default')
    expect(document.body.querySelector('.ads-notification-bottom-left')).toHaveTextContent('Bottom')
  })

  it('keeps duration 0 notifications until closed by handle', () => {
    const handle = notification.info({ message: 'Persistent', duration: 0 })

    vi.advanceTimersByTime(10000)
    expect(document.body).toHaveTextContent('Persistent')

    handle.close()
    expect(document.body).not.toHaveTextContent('Persistent')
  })

  it('updates existing keyed notification and resets its timer', async () => {
    notification.open({ key: 'job', message: 'Running', duration: 1 })
    vi.advanceTimersByTime(500)
    notification.open({ key: 'job', message: 'Done', duration: 1 })

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
    notification.open({ key: 'a', message: 'A', duration: 0 })
    notification.open({ key: 'b', message: 'B', duration: 0 })

    document.body.querySelector<HTMLButtonElement>('[aria-label="close notification"]')?.click()
    expect(document.body.querySelectorAll('.ads-notification-notice')).toHaveLength(1)

    notification.destroy('b')
    expect(document.body).not.toHaveTextContent('B')

    notification.open({ key: 'c', message: 'C', duration: 0 })
    notification.open({ key: 'd', message: 'D', duration: 0 })

    notification.destroy()
    expect(document.body.querySelectorAll('.ads-notification-notice')).toHaveLength(0)
  })
  it('renders title before deprecated message and supports top and bottom placements', () => {
    notification.open({
      title: 'Preferred title',
      message: 'Legacy message',
      placement: 'top',
      duration: 0,
    })
    notification.open({ message: 'Bottom legacy', placement: 'bottom', duration: 0 })

    expect(document.body).toHaveTextContent('Preferred title')
    expect(document.body).not.toHaveTextContent('Legacy message')
    expect(document.body.querySelector('.ads-notification-top')).toHaveTextContent(
      'Preferred title',
    )
    expect(document.body.querySelector('.ads-notification-bottom')).toHaveTextContent(
      'Bottom legacy',
    )
  })

  it('applies className style props and onClick to the notice element', () => {
    const onClick = vi.fn()

    notification.open({
      message: 'Clickable',
      duration: 0,
      className: 'custom-notice',
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
    notification.success({ message: 'Aligned title', duration: 0 })

    const message = document.body.querySelector<HTMLElement>('.ads-notification-notice-message')
    const icon = document.body.querySelector<HTMLElement>('.ads-notification-icon')

    expect(message).toHaveStyle({ display: 'flex', 'align-items': 'center' })
    expect(icon).toHaveStyle({
      display: 'inline-flex',
      'align-items': 'center',
      'flex-shrink': '0',
    })
  })

  it('renders custom icon actions and deprecated btn content', () => {
    notification.open({
      message: 'With actions',
      icon: <span data-testid="custom-icon">I</span>,
      actions: <button>Action</button>,
      duration: 0,
    })
    notification.open({ message: 'With btn', btn: <button>Legacy Btn</button>, duration: 0 })

    expect(document.body.querySelector('[data-testid="custom-icon"]')).toBeTruthy()
    expect(document.body).toHaveTextContent('Action')
    expect(document.body).toHaveTextContent('Legacy Btn')
  })

  it('supports closable false and closeIcon false', () => {
    notification.open({ message: 'No close', closable: false, duration: 0 })
    notification.open({ message: 'No close icon', closeIcon: false, duration: 0 })

    expect(document.body.querySelectorAll('[aria-label="close notification"]')).toHaveLength(0)
  })

  it('renders custom close icon and calls close callbacks on manual close', () => {
    const onClose = vi.fn()
    const closableOnClose = vi.fn()

    notification.open({
      message: 'Closable',
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
    notification.open({ message: 'Configured' })

    const bottom = document.body.querySelector<HTMLElement>('.ads-notification-bottom')
    expect(bottom).toHaveTextContent('Configured')
    expect(bottom?.style.bottom).toBe('50px')

    vi.advanceTimersByTime(1000)
    await Promise.resolve()
    expect(document.body).not.toHaveTextContent('Configured')
  })

  it('mounts into configured container', () => {
    const container = document.createElement('section')
    document.body.appendChild(container)
    notification.config({ getContainer: () => container })

    notification.open({ message: 'In container', duration: 0 })

    expect(container).toHaveTextContent('In container')
  })

  it('drops oldest notifications when maxCount is exceeded', () => {
    notification.config({ maxCount: 2 })

    notification.open({ message: 'One', duration: 0 })
    notification.open({ message: 'Two', duration: 0 })
    notification.open({ message: 'Three', duration: 0 })

    expect(document.body).not.toHaveTextContent('One')
    expect(document.body).toHaveTextContent('Two')
    expect(document.body).toHaveTextContent('Three')
  })

  it('keeps duration false notifications open', () => {
    notification.open({ message: 'Persistent false', duration: false })

    vi.advanceTimersByTime(10000)

    expect(document.body).toHaveTextContent('Persistent false')
  })

  it('pauses auto close on hover by default and resumes on mouse leave', async () => {
    notification.open({ message: 'Hover pause', duration: 1 })
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
      message: 'Semantic',
      duration: 2,
      showProgress: true,
      role: 'status',
      classNames: {
        notice: 'semantic-notice',
        message: 'semantic-message',
        progress: 'semantic-progress',
      },
      styles: { message: { color: 'red' }, progress: { height: '4px' } },
    })

    const notice = document.body.querySelector<HTMLElement>('.semantic-notice')
    const message = document.body.querySelector<HTMLElement>('.semantic-message')
    const progress = document.body.querySelector<HTMLElement>('.semantic-progress')

    expect(document.body.querySelector('.ads-notification-rtl')).toBeTruthy()
    expect(notice?.getAttribute('role')).toBe('status')
    expect(message?.style.color).toBe('red')
    expect(progress).toBeTruthy()
    expect(progress?.style.height).toBe('4px')
  })
})
