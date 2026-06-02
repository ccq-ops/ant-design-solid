import { cleanup, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, describe, expect, it } from 'vitest'
import { Progress } from '../progress'

afterEach(() => cleanup())

describe('Progress', () => {
  it('clamps percent and exposes progressbar aria', () => {
    const { container } = render(() => <Progress percent={150} />)
    const progress = screen.getByRole('progressbar')

    expect(progress).toHaveAttribute('aria-valuemin', '0')
    expect(progress).toHaveAttribute('aria-valuemax', '100')
    expect(progress).toHaveAttribute('aria-valuenow', '100')
    expect(container.querySelector('.ads-progress-status-success')).toBeInTheDocument()
  })

  it('clamps negative percent to zero', () => {
    render(() => <Progress percent={-20} />)

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('defaults to success when percent is 100', () => {
    const { container } = render(() => <Progress percent={100} />)

    expect(container.querySelector('.ads-progress-status-success')).toBeInTheDocument()
  })

  it('renders line width based on percent', () => {
    const { container } = render(() => <Progress percent={30} />)
    const bar = container.querySelector('.ads-progress-bg') as HTMLElement

    expect(bar.style.width).toBe('30%')
  })

  it('renders circle progress', () => {
    const { container } = render(() => <Progress type="circle" percent={25} />)
    const circle = container.querySelector('.ads-progress-circle-path') as SVGCircleElement

    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(circle).toHaveAttribute('stroke-dashoffset')
    expect(screen.getByText('25%')).toBeInTheDocument()
  })

  it('supports custom format and hidden info', () => {
    const [hidden, setHidden] = createSignal(false)
    render(() => (
      <Progress
        percent={40}
        showInfo={!hidden()}
        format={hidden() ? undefined : (percent) => `${percent} done`}
      />
    ))

    expect(screen.getByText('40 done')).toBeInTheDocument()

    setHidden(true)

    expect(screen.queryByText('40%')).toBeNull()
    expect(screen.queryByText('40 done')).toBeNull()
  })

  it('shows status symbols unless format overrides them', () => {
    const [status, setStatus] = createSignal<'success' | 'exception'>('success')
    const [customFormat, setCustomFormat] = createSignal(false)
    render(() => (
      <Progress
        percent={60}
        status={status()}
        format={customFormat() ? (percent) => `${percent}% ok` : undefined}
      />
    ))

    expect(screen.getByText('✓')).toBeInTheDocument()

    setStatus('exception')

    expect(screen.getByText('✕')).toBeInTheDocument()

    setStatus('success')
    setCustomFormat(true)

    expect(screen.getByText('60% ok')).toBeInTheDocument()
  })
})
