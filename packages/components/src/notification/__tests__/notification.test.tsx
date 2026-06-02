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
})
