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

  it('shows status icons from the icons package unless format overrides them', () => {
    const [status, setStatus] = createSignal<'success' | 'exception'>('success')
    const [customFormat, setCustomFormat] = createSignal(false)
    render(() => (
      <Progress
        percent={60}
        status={status()}
        format={customFormat() ? (percent) => `${percent}% ok` : undefined}
      />
    ))

    expect(document.body.querySelector('.ads-progress-text svg')).toBeInTheDocument()

    setStatus('exception')

    expect(document.body.querySelector('.ads-progress-text svg')).toBeInTheDocument()

    setStatus('success')
    setCustomFormat(true)

    expect(screen.getByText('60% ok')).toBeInTheDocument()
  })

  it('supports railColor success segment format success percent strokeLinecap and size', () => {
    const { container } = render(() => (
      <Progress
        type="circle"
        percent={70}
        railColor="#eeeeee"
        trailColor="#dddddd"
        success={{ percent: 25, strokeColor: '#52c41a' }}
        strokeLinecap="square"
        size={96}
        format={(percent, successPercent) => `${percent}/${successPercent}`}
      />
    ))

    const root = screen.getByRole('progressbar')
    const trail = container.querySelector('.ads-progress-circle-trail') as SVGCircleElement
    const path = container.querySelector('.ads-progress-circle-path') as SVGCircleElement
    const success = container.querySelector('.ads-progress-circle-success') as SVGCircleElement
    const svg = container.querySelector('svg') as SVGSVGElement

    expect(root).toHaveAttribute('aria-valuenow', '25')
    expect(trail).toHaveAttribute('stroke', '#eeeeee')
    expect(path).toHaveAttribute('stroke-linecap', 'square')
    expect(success).toHaveAttribute('stroke', '#52c41a')
    expect(success).toHaveAttribute('stroke-linecap', 'square')
    expect(svg).toHaveAttribute('width', '96')
    expect(svg).toHaveAttribute('height', '96')
    expect(screen.getByText('70/25')).toBeInTheDocument()
  })

  it('renders dashboard with gap props', () => {
    const { container } = render(() => (
      <Progress type="dashboard" percent={50} gapDegree={120} gapPlacement="top" />
    ))
    const root = screen.getByRole('progressbar')
    const path = container.querySelector('.ads-progress-circle-path') as SVGCircleElement

    expect(root).toHaveClass('ads-progress-dashboard')
    expect(path).toHaveAttribute('transform', 'rotate(150 60 60)')
    expect(path.getAttribute('stroke-dasharray')).toContain('209.')
  })

  it('renders line steps with stroke color array', () => {
    const { container } = render(() => (
      <Progress percent={50} steps={4} strokeColor={['#111111', '#222222', '#333333']} />
    ))
    const items = container.querySelectorAll<HTMLElement>('.ads-progress-steps-item')

    expect(items).toHaveLength(4)
    expect(items[0].style.background).toBe('rgb(17, 17, 17)')
    expect(items[1].style.background).toBe('rgb(34, 34, 34)')
    expect(items[2]).not.toHaveClass('ads-progress-steps-item-active')
  })

  it('renders inner percent text and gradient line stroke', () => {
    const { container } = render(() => (
      <Progress
        percent={35}
        percentPosition={{ align: 'center', type: 'inner' }}
        strokeColor={{ from: '#108ee9', to: '#87d068', direction: 'to right' }}
      />
    ))
    const bar = container.querySelector('.ads-progress-bg') as HTMLElement
    const text = container.querySelector('.ads-progress-text-inner') as HTMLElement

    expect(bar.style.background).toBe(
      'linear-gradient(to right, rgb(16, 142, 233), rgb(135, 208, 104))',
    )
    expect(text).toHaveClass('ads-progress-text-center')
    expect(text).toHaveTextContent('35%')
  })

  it('renders circle steps and picks a color from gradient object', () => {
    const { container } = render(() => (
      <Progress
        type="circle"
        percent={25}
        steps={{ count: 5, gap: 4 }}
        strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
      />
    ))
    const path = container.querySelector('.ads-progress-circle-path') as SVGCircleElement

    expect(path).toHaveAttribute('stroke', '#108ee9')
    expect(path.getAttribute('stroke-dasharray')).toContain('58.')
  })
})
