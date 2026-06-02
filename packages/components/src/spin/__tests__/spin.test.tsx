import { cleanup, render, screen } from '@solidjs/testing-library'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSignal } from 'solid-js'
import { ConfigProvider } from '../../config-provider'
import { Spin } from '../spin'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('Spin', () => {
  it('renders standalone spinner by default', () => {
    const { container } = render(() => <Spin />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(container.querySelector('.ads-spin')).toBeInTheDocument()
  })

  it('wraps content and marks it busy while spinning', () => {
    render(() => (
      <Spin spinning>
        <div>Content</div>
      </Spin>
    ))

    expect(screen.getByText('Content').parentElement).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('does not render an overlay or busy state when nested and not spinning', () => {
    const { container } = render(() => (
      <Spin spinning={false}>
        <div>Content</div>
      </Spin>
    ))

    expect(screen.getByText('Content').parentElement).not.toHaveAttribute('aria-busy')
    expect(screen.queryByRole('status')).toBeNull()
    expect(container.querySelector('.ads-spin-nested-loading')).toBeInTheDocument()
  })

  it('respects delay before showing spinner', async () => {
    vi.useFakeTimers()
    render(() => (
      <Spin spinning delay={100}>
        <div>Content</div>
      </Spin>
    ))

    expect(screen.queryByRole('status')).toBeNull()
    await vi.advanceTimersByTimeAsync(99)
    expect(screen.queryByRole('status')).toBeNull()
    await vi.advanceTimersByTimeAsync(1)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('does not restart omitted-spinning delay when children change', async () => {
    vi.useFakeTimers()
    let setContent: (value: string) => void = () => undefined
    render(() => {
      const [content, updateContent] = createSignal('First')
      setContent = updateContent
      return <Spin delay={100}>{content()}</Spin>
    })

    expect(screen.queryByRole('status')).toBeNull()
    await vi.advanceTimersByTimeAsync(50)
    setContent('Second')
    await vi.advanceTimersByTimeAsync(50)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('clears pending delay timers when spinning stops', async () => {
    vi.useFakeTimers()
    let setSpinning: (value: boolean) => void = () => undefined
    render(() => {
      const [spinning, updateSpinning] = createSignal(true)
      setSpinning = updateSpinning
      return (
        <Spin spinning={spinning()} delay={100}>
          <div>Content</div>
        </Spin>
      )
    })

    setSpinning(false)
    await vi.advanceTimersByTimeAsync(100)

    expect(screen.queryByRole('status')).toBeNull()
  })

  it('supports fullscreen and custom indicator', () => {
    const { container } = render(() => <Spin fullscreen indicator={<span>Loading custom</span>} />)

    expect(container.querySelector('.ads-spin-fullscreen')).toBeInTheDocument()
    expect(screen.getByText('Loading custom')).toBeInTheDocument()
  })

  it('renders size, tip, and custom prefix classes', () => {
    const { container } = render(() => (
      <ConfigProvider prefixCls="custom">
        <Spin size="large" tip="Loading data" />
      </ConfigProvider>
    ))

    expect(container.querySelector('.custom-spin-lg')).toBeInTheDocument()
    expect(screen.getByText('Loading data')).toBeInTheDocument()
    expect(container.querySelector('.ads-spin')).toBeNull()
  })
})
