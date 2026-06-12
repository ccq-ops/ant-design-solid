import { cleanup, render, screen } from '@solidjs/testing-library'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Statistic } from '../index'

afterEach(() => cleanup())

describe('Statistic', () => {
  it('renders title, value, and default classes', () => {
    const { container } = render(() => <Statistic title="Active Users" value={112893} />)

    const statistic = container.querySelector('.ads-statistic') as HTMLElement

    expect(statistic).toBeInTheDocument()
    expect(container.querySelector('.ads-statistic-title')).toHaveTextContent('Active Users')
    expect(container.querySelector('.ads-statistic-content')).toBeInTheDocument()
    expect(container.querySelector('.ads-statistic-content-value')).toHaveTextContent('112,893')
  })

  it('formats numeric values with precision', () => {
    render(() => <Statistic title="Rate" value={93.456} precision={2} />)

    expect(screen.getByText('93.46')).toBeInTheDocument()
  })

  it('formats values with group and decimal separators', () => {
    render(() => (
      <Statistic
        title="Revenue"
        value={112893.456}
        precision={2}
        groupSeparator=" "
        decimalSeparator=","
      />
    ))

    expect(screen.getByText('112 893,46')).toBeInTheDocument()
  })

  it('uses a custom formatter instead of default number formatting', () => {
    render(() => <Statistic value={0.875} formatter={(value) => `${Number(value) * 100}%`} />)

    expect(screen.getByText('87.5%')).toBeInTheDocument()
  })

  it('applies semantic classNames and styles', () => {
    const { container } = render(() => (
      <Statistic
        title="Visitors"
        value={1200}
        prefix="$"
        suffix="USD"
        classNames={({ props }) => ({
          root: props.value === 1200 ? 'stat-root' : 'other-root',
          header: 'stat-header',
          title: 'stat-title',
          content: 'stat-content',
          value: 'stat-value',
          prefix: 'stat-prefix',
          suffix: 'stat-suffix',
        })}
        styles={{
          root: { padding: '2px' },
          header: { margin: '1px' },
          title: { color: 'rgb(0, 0, 255)' },
          content: { color: 'rgb(0, 128, 0)' },
          value: { 'font-weight': 700 },
          prefix: { color: 'rgb(255, 0, 0)' },
          suffix: { color: 'rgb(128, 0, 128)' },
        }}
      />
    ))

    expect(container.querySelector('.ads-statistic')).toHaveClass('stat-root')
    expect(container.querySelector('.ads-statistic-header')).toHaveClass('stat-header')
    expect(container.querySelector('.ads-statistic-title')).toHaveClass('stat-title')
    expect(container.querySelector('.ads-statistic-content')).toHaveClass('stat-content')
    expect(container.querySelector('.ads-statistic-content-value')).toHaveClass('stat-value')
    expect(container.querySelector('.ads-statistic-content-prefix')).toHaveClass('stat-prefix')
    expect(container.querySelector('.ads-statistic-content-suffix')).toHaveClass('stat-suffix')
    expect(container.querySelector('.ads-statistic')).toHaveStyle({ padding: '2px' })
    expect(container.querySelector('.ads-statistic-header')).toHaveStyle({ margin: '1px' })
    expect(container.querySelector('.ads-statistic-title')).toHaveStyle({ color: 'rgb(0, 0, 255)' })
    expect(container.querySelector('.ads-statistic-content')).toHaveStyle({
      color: 'rgb(0, 128, 0)',
    })
    expect(container.querySelector('.ads-statistic-content-value')).toHaveStyle({
      'font-weight': '700',
    })
    expect(container.querySelector('.ads-statistic-content-prefix')).toHaveStyle({
      color: 'rgb(255, 0, 0)',
    })
    expect(container.querySelector('.ads-statistic-content-suffix')).toHaveStyle({
      color: 'rgb(128, 0, 128)',
    })
  })

  it('renders prefix, suffix, class, and valueStyle', () => {
    const { container } = render(() => (
      <Statistic
        class="custom-statistic"
        title="Balance"
        value={88}
        prefix={<span data-testid="prefix">$</span>}
        suffix={<span data-testid="suffix">USD</span>}
        valueStyle={{ color: 'rgb(63, 134, 0)' }}
        data-testid="statistic"
      />
    ))

    const statistic = screen.getByTestId('statistic')
    const value = container.querySelector('.ads-statistic-content-value') as HTMLElement

    expect(statistic).toHaveClass('ads-statistic')
    expect(statistic).toHaveClass('custom-statistic')
    expect(container.querySelector('.ads-statistic-content-prefix')).toContainElement(
      screen.getByTestId('prefix'),
    )
    expect(container.querySelector('.ads-statistic-content-suffix')).toContainElement(
      screen.getByTestId('suffix'),
    )
    expect(value).toHaveStyle({ color: 'rgb(63, 134, 0)' })
  })

  it('renders loading placeholder instead of value', () => {
    const { container } = render(() => <Statistic title="Revenue" value={1000} loading />)

    expect(container.querySelector('.ads-statistic-title')).toHaveTextContent('Revenue')
    expect(container.querySelector('.ads-statistic-loading')).toBeInTheDocument()
    expect(container.querySelector('.ads-statistic-content-value')).not.toHaveTextContent('1000')
  })

  it('renders countdown timer and calls onFinish once time is up', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
    const onFinish = vi.fn()
    const onChange = vi.fn()

    render(() => (
      <Statistic.Timer
        type="countdown"
        value={new Date('2026-01-01T00:00:03.000Z').getTime()}
        format="HH:mm:ss"
        onChange={onChange}
        onFinish={onFinish}
      />
    ))

    expect(screen.getByText('00:00:03')).toBeInTheDocument()

    vi.advanceTimersByTime(1000)
    expect(screen.getByText('00:00:02')).toBeInTheDocument()
    expect(onChange).toHaveBeenCalledWith(2000)

    vi.advanceTimersByTime(2000)
    expect(screen.getByText('00:00:00')).toBeInTheDocument()
    expect(onFinish).toHaveBeenCalledTimes(1)

    vi.useRealTimers()
  })

  it('renders countup timer from a start time', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:05.000Z'))

    render(() => (
      <Statistic.Timer
        type="countup"
        value={new Date('2026-01-01T00:00:00.000Z').getTime()}
        format="HH:mm:ss"
      />
    ))

    expect(screen.getByText('00:00:05')).toBeInTheDocument()

    vi.advanceTimersByTime(1000)
    expect(screen.getByText('00:00:06')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('keeps deprecated Countdown as a countdown timer alias', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))

    render(() => (
      <Statistic.Countdown
        value={new Date('2026-01-01T00:00:01.000Z').getTime()}
        format="s [seconds]"
      />
    ))

    expect(screen.getByText('1 seconds')).toBeInTheDocument()
    vi.advanceTimersByTime(1000)
    expect(screen.getByText('0 seconds')).toBeInTheDocument()

    vi.useRealTimers()
  })
})
