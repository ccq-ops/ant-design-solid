import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { message } from '../index'

describe('message', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
    message.destroy()
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
})
