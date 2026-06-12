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

  it('prefers description over deprecated tip', () => {
    render(() => <Spin tip="Legacy tip" description="Loading description" />)

    expect(screen.getByText('Loading description')).toBeInTheDocument()
    expect(screen.queryByText('Legacy tip')).toBeNull()
  })

  it('renders percent progress and clamps aria value', () => {
    const { container } = render(() => <Spin percent={120} />)
    const progress = screen.getByRole('progressbar')

    expect(progress).toHaveAttribute('aria-valuenow', '100')
    expect(container.querySelector('.ads-spin-dot-progress')).toBeInTheDocument()
  })

  it('advances auto percent while spinning', async () => {
    vi.useFakeTimers()
    render(() => <Spin percent="auto" />)

    await vi.advanceTimersByTimeAsync(200)

    expect(Number(screen.getByRole('progressbar').getAttribute('aria-valuenow'))).toBeGreaterThan(0)
  })

  it('applies semantic classes and styles', () => {
    const { container } = render(() => (
      <Spin
        description="Styled loading"
        class="outer-class"
        classNames={{
          root: 'root-slot',
          section: 'section-slot',
          indicator: 'indicator-slot',
          description: 'description-slot',
        }}
        styles={{
          root: { color: 'rgb(1, 2, 3)' },
          section: { padding: '4px' },
          indicator: { margin: '2px' },
          description: { color: 'rgb(4, 5, 6)' },
        }}
      />
    ))

    expect(container.querySelector('.root-slot')).toHaveClass('outer-class')
    expect(container.querySelector<HTMLElement>('.root-slot')!.style.color).toBe('rgb(1, 2, 3)')
    expect(container.querySelector<HTMLElement>('.section-slot')!.style.padding).toBe('4px')
    expect(container.querySelector<HTMLElement>('.indicator-slot')!.style.margin).toBe('2px')
    expect(container.querySelector('.description-slot')).toHaveTextContent('Styled loading')
    expect(container.querySelector<HTMLElement>('.description-slot')!.style.color).toBe(
      'rgb(4, 5, 6)',
    )
  })

  it('applies wrapperClass and container semantic slot for nested content', () => {
    const { container } = render(() => (
      <Spin wrapperClass="wrapper-slot" classNames={{ container: 'container-slot' }}>
        <div>Nested</div>
      </Spin>
    ))

    expect(container.querySelector('.ads-spin-nested-loading')).toHaveClass('wrapper-slot')
    expect(container.querySelector('.container-slot')).toHaveTextContent('Nested')
  })

  it('resolves semantic classes and styles from functions', () => {
    const { container } = render(() => (
      <Spin
        size="large"
        classNames={({ props }) => ({ root: props.size === 'large' ? 'large-root' : undefined })}
        styles={({ props }) => ({
          root: { color: props.size === 'large' ? 'rgb(7, 8, 9)' : undefined },
        })}
      />
    ))

    expect(container.querySelector('.large-root')).toBeInTheDocument()
    expect(container.querySelector<HTMLElement>('.large-root')!.style.color).toBe('rgb(7, 8, 9)')
  })

  it('keeps nested root semantic class on the wrapper only', () => {
    const { container } = render(() => (
      <Spin classNames={{ root: 'nested-root' }}>
        <div>Nested</div>
      </Spin>
    ))

    expect(container.querySelector('.ads-spin-nested-loading')).toHaveClass('nested-root')
    expect(container.querySelector('.ads-spin')).not.toHaveClass('nested-root')
  })

  it('supports medium size and default size compatibility', () => {
    const { container } = render(() => (
      <>
        <Spin size="medium" />
        <Spin size="default" />
      </>
    ))

    expect(container.querySelectorAll('.ads-spin-sm')).toHaveLength(0)
    expect(container.querySelectorAll('.ads-spin-lg')).toHaveLength(0)
    expect(screen.getAllByRole('status')).toHaveLength(2)
  })

  it('uses a global default indicator when provided', () => {
    Spin.setDefaultIndicator(<span>Default indicator</span>)

    render(() => <Spin />)

    expect(screen.getByText('Default indicator')).toBeInTheDocument()
    Spin.setDefaultIndicator(undefined)
  })
})
