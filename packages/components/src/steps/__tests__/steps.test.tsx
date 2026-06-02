import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { Steps } from '../steps'

describe('Steps', () => {
  it('derives item status from current and global status', () => {
    const result = render(() => (
      <Steps
        current={1}
        items={[{ title: 'Create account' }, { title: 'Verify email' }, { title: 'Done' }]}
      />
    ))

    const items = result.getAllByRole('listitem')

    expect(items[0]).toHaveClass('ads-steps-item-finish')
    expect(items[1]).toHaveClass('ads-steps-item-process')
    expect(items[1]).toHaveAttribute('aria-current', 'step')
    expect(items[2]).toHaveClass('ads-steps-item-wait')
  })

  it('uses the global current status and item status overrides', () => {
    const result = render(() => (
      <Steps
        current={1}
        status="error"
        items={[
          { title: 'Finished' },
          { title: 'Current but overridden', status: 'finish' },
          { title: 'Waiting but error', status: 'error' },
        ]}
      />
    ))

    const items = result.getAllByRole('listitem')

    expect(items[0]).toHaveClass('ads-steps-item-finish')
    expect(items[1]).toHaveClass('ads-steps-item-finish')
    expect(items[1]).not.toHaveClass('ads-steps-item-error')
    expect(items[2]).toHaveClass('ads-steps-item-error')
  })

  it('renders navigation buttons for enabled steps and calls onChange', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Steps
        type="navigation"
        current={0}
        onChange={onChange}
        items={[{ title: 'Start' }, { title: 'Details' }, { title: 'Confirm' }]}
      />
    ))

    fireEvent.click(result.getByRole('button', { name: 'Go to step 2: Details' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenLastCalledWith(1)
  })

  it('does not render disabled navigation items as clickable', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Steps
        type="navigation"
        onChange={onChange}
        items={[{ title: 'Start' }, { title: 'Locked', disabled: true }, { title: 'Confirm' }]}
      />
    ))

    expect(result.queryByRole('button', { name: 'Go to step 2: Locked' })).not.toBeInTheDocument()
    expect(result.getByText('Locked').closest('li')).toHaveAttribute('aria-disabled', 'true')
    fireEvent.click(result.getByText('Locked'))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('renders descriptions, custom icons, direction, and small size classes', () => {
    const result = render(() => (
      <Steps
        direction="vertical"
        size="small"
        items={[
          {
            title: 'One',
            description: 'First step',
            icon: <span data-testid="custom-icon">★</span>,
          },
          { title: 'Two', description: 'Second step' },
        ]}
      />
    ))

    expect(result.container.firstElementChild).toHaveClass('ads-steps-vertical')
    expect(result.container.firstElementChild).toHaveClass('ads-steps-small')
    expect(result.getByText('First step')).toBeInTheDocument()
    expect(result.getByTestId('custom-icon')).toBeInTheDocument()
  })
})
