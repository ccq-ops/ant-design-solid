import { cleanup, render, screen } from '@solidjs/testing-library'
import { afterEach, describe, expect, it } from 'vitest'
import { Statistic } from '../statistic'

afterEach(() => cleanup())

describe('Statistic', () => {
  it('renders title, value, and default classes', () => {
    const { container } = render(() => <Statistic title="Active Users" value={112893} />)

    const statistic = container.querySelector('.ads-statistic') as HTMLElement

    expect(statistic).toBeInTheDocument()
    expect(container.querySelector('.ads-statistic-title')).toHaveTextContent('Active Users')
    expect(container.querySelector('.ads-statistic-content')).toBeInTheDocument()
    expect(container.querySelector('.ads-statistic-content-value')).toHaveTextContent('112893')
  })

  it('formats numeric values with precision', () => {
    render(() => <Statistic title="Rate" value={93.456} precision={2} />)

    expect(screen.getByText('93.46')).toBeInTheDocument()
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
})
